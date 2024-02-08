import { Request, Response, NextFunction } from "express";
import prisma from "../config/db.config";
import { ApiError } from "../utils/ApiError.utils";
import asyncHandler from "../utils/asyncHandler.utils";
import { compare, hash } from "bcrypt";
import { ApiResponse } from "../utils/ApiResponse.utils";
import { generateAccessToken, generateRefreshToken } from "../utils/token.utils";
import { catchError } from "../utils/catchError.utils";

const options = {
    httpOnly: true,
    secure: true,
};
export const signup = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, email, password, confirmPassword, studentClass } = req.body as {
            name: string,
            email: string,
            password: string,
            confirmPassword: string,
            studentClass: string
        };

        if (password !== confirmPassword) {
            return res.status(400).json(new ApiError(400, "Passwords do not match"));
        }
        const intStudentClass = parseInt(studentClass)
        if (intStudentClass > 12 || intStudentClass < 1) {
            return res.status(400).json(new ApiError(400, "Class should be either less than or equal to 12th or greater than or equal to 1st "))
        }
        const exStudent = await prisma.student.findUnique({
            where: { email }
        })
        if (exStudent) {
            return res.status(400).json(new ApiError(400, "Student already exists"));
        }
        const hashedPassword = await hash(password, 10);
        const accessToken = generateAccessToken(name, email, "student");
        const refreshToken = generateRefreshToken(email);
        // add student to class table


        // Search by class name if ID is not provided:
        let classInstance = await prisma.class.findFirst({
            where: { name: studentClass },
        })


        if (!classInstance) {
            // Create the class if not found (handle errors as needed)
            classInstance = await prisma.class.create({
                data: { name: studentClass },
            });
        }
        // Create the student with hashed password and class association
        const student = await prisma.student.create({
            data: {
                name,
                email,
                password: hashedPassword, // Store only the hashed password
                class: { connect: { id: classInstance.id } }, // Connect to existing or created class
                createdAt: new Date(),
            },
        });
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, {
                name,
                email,
                accessToken,
                refreshToken,
                intStudentClass
            }, "Student created successfully"));
    } catch (error) {
        catchError(error);
    }
});
export const login = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;
        const student = await prisma.student.findUnique({
            where: { email }
        });
        if (!student) {
            return res.status(400).json(new ApiError(400, "Student does not exist"));
        }
        const studentPassword: string = student.password as string;
        const passwordMatch: boolean = await compare(password, studentPassword);
        if (!passwordMatch) {
            return res.status(400).json(new ApiError(400, "Invalid credentials"));
        }
        const name = student.name as string;
        const accessToken = generateAccessToken(name, email, "Student");
        const refreshToken = generateRefreshToken(email);
        await prisma.student.update
            ({
                where: { email },
                data: { accessToken, refreshToken }
            });
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { name, email }, "Student logged in successfully"));
    } catch (error) {
        catchError(error);
    }
});
export const logout = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.clearCookie("accessToken", options);
        res.clearCookie("refreshToken", options);
        return res.status(200).json(new ApiResponse(200, {}, "Student logged out successfully"));
    } catch (error) {
        catchError(error);
    }
});
