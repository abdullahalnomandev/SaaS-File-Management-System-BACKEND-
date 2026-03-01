import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import db from "../../../shared/prisma";
import { IFolder } from "./folder.interface";

// Create a new folder

//   "name": "Projects",
//   "user_id": 1,
//   "parent_folder_id": null,
//   "nesting_level": 0,
//   "total_files": 3

const createFolderToDB = async (payload: IFolder): Promise<IFolder> => {
  if (!payload.name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Name is required");
  }

  const parentFolder = await db.folder.findUnique({
    where: { id: payload.parent_folder_id ?? 0 },
    select: {
      user:{
        select:{
            package:{
                select:{
                    max_nesting_folder: true
                }
            }
        }
      },
      nesting_level: true
    }
  });

  if (parentFolder && parentFolder.user.package?.max_nesting_folder <= (parentFolder.nesting_level ?? 0) + 1) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Nesting level exceeds maximum allowed (9 levels)");
  }

  const createdFolder = await db.folder.create({
    data: {
      name: payload.name,
      user_id: payload.user_id,
      parent_folder_id: payload.parent_folder_id ?? null,
      nesting_level: parentFolder?.nesting_level ? parentFolder.nesting_level + 1 : 0,
      total_files: payload.total_files ?? 0,
    },
  });

  return createdFolder;
};

// Update folder by ID
const updateFolderToDB = async (
  folderId: number,
  payload: Partial<IFolder>
): Promise<IFolder> => {
  const existing = await db.folder.findUnique({ where: { id: folderId } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Folder not found");
  }

  const updatedFolder = await db.folder.update({
    where: { id: folderId },
    data: {
      name: payload.name ?? existing.name,
      parent_folder_id: payload.parent_folder_id ?? existing.parent_folder_id,
      nesting_level: payload.nesting_level ?? existing.nesting_level,
      total_files: payload.total_files ?? existing.total_files,
    },
  });

  return updatedFolder;
};

// Delete folder by ID
const deleteFolderFromDB = async (folderId: number): Promise<{ message: string }> => {
  const existing = await db.folder.findUnique({ where: { id: folderId } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Folder not found");
  }

  await db.folder.delete({ where: { id: folderId } });
  return { message: "Folder deleted successfully" };
};

// Get all folders (optional: can filter by user_id)
const getAllFoldersFromDB = async (userId?: number)=> {
  const folders = await db.folder.findMany({
    where: userId ? { user_id: userId } : undefined,
    orderBy: { id: "asc" },
    include: {
      folders: true, // include child folders
      files: true,   // include files
    },
  });
  return folders;
};

export const FolderService = {
  createFolderToDB,
  updateFolderToDB,
  deleteFolderFromDB,
  getAllFoldersFromDB,
};