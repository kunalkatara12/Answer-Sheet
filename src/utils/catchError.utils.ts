import { ApiError } from "./ApiError.utils";

export const catchError = (error: any) => {
    console.log(error);
    throw new ApiError(
        500,
        "Something went wrong on generating access and refresh token in user.controllers.ts"
    );
};