import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { FileService } from "./file.service";
import { getImageInfo, getSingleFilePath } from "../../../shared/getFilePath";
import path from 'path';
import fs from 'fs';
import multer, { FileFilterCallback } from 'multer';
import ApiError from '../../../errors/ApiError';
import { IPackage } from '../package/package.interface';


const createDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};


export const uploadHandler = catchAsync(async (req: any, res, next) => {
  const packageInfo = req.packageInfo as IPackage;
  const baseUploadDir = path.join(process.cwd(), 'uploads', 'files');
  createDir(baseUploadDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = (req.body.folderName || file.fieldname || 'default').toLowerCase();
      const uploadDir = path.join(baseUploadDir);
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = file.originalname.replace(ext, '').toLowerCase().split(' ').join('-');
      cb(null, `${name}-${Date.now()}${ext}`);
    },
  });

  const fileFilter = (req: any, file: any, cb: FileFilterCallback) => {
    if (packageInfo.allowed_file_type.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const readableTypes = packageInfo.allowed_file_type.map(type =>
        type.split('/')[1] || type
      );

      cb(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          `File type not allowed. Allowed: ${readableTypes.join(', ')}`
        )
      );
    }
  };


  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: packageInfo.max_file_size * 1024 * 1024 },
  }).fields([{ name: 'file', maxCount: packageInfo.total_file_limit }]);


  upload(req, res as any, next);
});


// ✅ Create Folder
const create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  const imageInfo = getImageInfo(req.files, 'file');

  const data = {
    ...req.body,
    user_id: user.id,
    name: imageInfo?.name,
    size: imageInfo?.size,
    file_type: imageInfo?.mimetype,
    path_name: imageInfo?.path
  }

  const result = await FileService.createFileToDB(data, Number(((req as any).packageInfo).file_per_folder_limit));
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "File created successfully",
    data: result,
  });
});



// ✅ Get All Files
const getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const parent_folder_id = Number(req.query.parent_folder_id);
  const result = await FileService.getAllFilesFromDB(userId, parent_folder_id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Files retrieved successfully",
    data: result,
  });
});


const deleteFile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const file_id = Number(req.params.id);
  const result = await FileService.deleteFile(userId, file_id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "File deleted successfully",
    data: result,
  });
});


export const FileController = {
  create,
  uploadHandler,
  getAll,
  deleteFile
};