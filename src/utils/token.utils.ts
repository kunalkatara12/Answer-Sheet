import { sign, verify } from "jsonwebtoken";
import asyncHandler from "./asyncHandler.utils";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError.utils";
import prisma from "../config/db.config";
type DecodedToken = {
    name: string,
    email: string,
    role: string,
};
export const generateAccessToken = (
    name: string,
    email: string,
    role: string,
) => {
    const payload = {  name, email, role };
    const token = sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
    return token;
}
export const generateRefreshToken = (email: string) => {
    const payload = { email };
    const token = sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
    return token;
}
export const verifyToken = asyncHandler(async (req: Request & { teacher?: any, student?: any }
    , res: Response, next: NextFunction) => {
    try {
        const token =
            req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];
        if (!token)
            throw new ApiError(
                401,
                "Please login to access this resource in auth.middlewares.ts"
            );
        const decodedToken: DecodedToken = verify(
            token,
            process.env.ACCESS_TOKEN_SECRET as string
        ) as DecodedToken;
        const {  name, email, role } = decodedToken;
        if (role === "teacher") {
            const user = await prisma.teacher.findUnique({
                where: { email }
            });
            if (!user) {
                throw new ApiError(401, "Teacher does not exist in token.utils.ts");
            }
            req.teacher = user;
            next();
        }
        else {
            const user = await prisma.student.findUnique({
                where: { email }
            });
            if (!user) {
                throw new ApiError(401, "Student does not exist in token.utils.ts");
            }
            req.student = user;
            next();
        }
    }
    catch (error) {
        throw new ApiError(500, "Invalid Access Token in token.utils.ts");
    }
}
)