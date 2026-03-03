import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { FolderService } from "./folder.service";

// ✅ Create Folder
const create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const folderData = req.body;
  const user = req.user;
  folderData.user_id = Number(user.id);
  folderData.parent_folder_id = folderData.parent_folder_id ? Number(folderData.parent_folder_id) : null;
  
  const result = await FolderService.createFolderToDB(folderData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Folder created successfully",
    data: result,
  });
});

// ✅ Get All Folders
const getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = Number(req.user.id);
  const parent_folder_id = Number(req.query.parent_folder_id);
  const result = await FolderService.getAllFoldersFromDB(userId, parent_folder_id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Folders retrieved successfully",
    data: result,
  });
});

// ✅ Delete Folder
const deleteFolder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const folderId = Number(req.params.id);
  const userId = req.user.id;
  await FolderService.deleteFolderFromDB(folderId, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Folder deleted successfully",
  });
});

// ✅ Update Folder
const update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const folderId = Number(req.params.id);
  const userId = Number(req.user.id);
  const folderData = req.body;
  const result = await FolderService.updateFolderToDB(folderId, userId, folderData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Folder updated successfully",
    data: result,
  });
});

const getBreadcrumb = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const folderId = Number(req.params.id);
  const userId = Number(req.user.id);
  const result = await FolderService.getBreadcrumbFromDB(folderId, userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Breadcrumb retrieved successfully",
    data: result,
  });
});


export const FolderController = {
  create,
 getAll,
 deleteFolder,
 update,
 getBreadcrumb
};