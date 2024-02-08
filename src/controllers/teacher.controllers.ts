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
        const { name, email, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json(new ApiError(400, "Passwords do not match"));
        }
        const teacher = await prisma.teacher.findUnique({
            where: { email }
        })
        if (teacher) {
            return res.status(400).json(new ApiError(400, "Teacher already exists"));
        }
        const hashedPassword = await hash(password, 10);
        const accessToken = generateAccessToken(name, email, "teacher");
        const refreshToken = generateRefreshToken(email);
        const newTeacher = await prisma.teacher.create({
            data: {
                name,
                email,
                password: hashedPassword,
                accessToken,
                refreshToken
            }
        });
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, {
                name,
                email,
                accessToken,
                refreshToken
            }, "Teacher created successfully"));
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
        const teacher = await prisma.teacher.findUnique({
            where: { email }
        });
        if (!teacher) {
            return res.status(400).json(new ApiError(400, "Teacher does not exist"));
        }
        const teacherPassword: string = teacher.password as string;
        const passwordMatch: boolean = await compare(password, teacherPassword);
        if (!passwordMatch) {
            return res.status(400).json(new ApiError(400, "Invalid credentials"));
        }
        const name = teacher.name as string;
        const accessToken = generateAccessToken(name, email, "teacher");
        const refreshToken = generateRefreshToken(email);
        await prisma.teacher.update
            ({
                where: { email },
                data: { accessToken, refreshToken }
            });
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { name, email }, "Teacher logged in successfully"));
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
        return res.status(200).json(new ApiResponse(200, {}, "Teacher logged out successfully"));
    } catch (error) {
        catchError(error);
    }
});
