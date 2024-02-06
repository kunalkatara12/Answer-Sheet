import { Request, Response, NextFunction } from "express";
import prisma from "../config/db.config";
import { ApiError } from "../utils/ApiError.utils";
import asyncHandler from "../utils/asyncHandler.utils";
import { hash } from "bcrypt";
import { ApiResponse } from "../utils/ApiResponse.utils";
const catchError = (error: any) => {
    console.log(error);
    throw new ApiError(
        500,
        "Something went wrong on generating access and refresh token in user.controllers.ts"
    );
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
        const user = await prisma.teacher.findUnique({
            where: { email }
        })
        if (user) {
            return res.status(400).json(new ApiError(400, "User already exists"));
        }
        const hashedPassword = await hash(password, 10);
        const newUser = await prisma.teacher.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        return res.status(200).json(new ApiResponse(200, newUser, "User created successfully"));
    } catch (error) {
        catchError(error);
    }
});

