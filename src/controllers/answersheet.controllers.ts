import {
    Request,
    Response, 
    NextFunction
} from "express";
import asyncHandler from "../utils/asyncHandler.utils";
import { ApiError } from "../utils/ApiError.utils";
import { uploadOnCloudinary } from "../utils/cloudinary.utils";
const catchError = (error: any) => {
    console.log(error);
    throw new ApiError(
        500,
        "Something went wrong on generating access and refresh token in user.controllers.ts"
    );
};
export const uploadAnswerSheet = asyncHandler(
    async (req: Request & {files?:any}, res: Response, next: NextFunction) => {
        try{
            // const {  subject } = req.body;
            console.log(req.files);
            // const answerSheet= req.files?.answerSheet[0]?.path;
            const answerSheet= req.file?.path;
            if(!answerSheet){
                return res.status(400).json(new ApiError(400, "Answer sheet Path is required"));
            }
            const answerSheetUrl = await uploadOnCloudinary(answerSheet);
            if(!answerSheetUrl){
                return res.status(400).json(new ApiError(400, "Error uploading Answer Sheet"));
            }
            return res.status(200).json({answerSheetUrl});
        }catch(error){
            catchError(error);
        }
    }
)

