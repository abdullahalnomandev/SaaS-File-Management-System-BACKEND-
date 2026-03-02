import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import db from '../../../shared/prisma';
import { IFile } from './file.interface';
import { Prisma } from '../../../generated/prisma/client';



export const createFileToDB = async (
  payload: Partial<IFile>,
  filePerFolderLimit: number
) => {
  console.log('payload', payload);
  // Convert folder_id safely
  const folderId = payload.folder_id ? Number(payload.folder_id) : null;

  let folder = null;

  // ✅ Only validate if folder_id exists
  if (folderId) {
    folder = await db.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid folder id");
    }

    // Count files inside this folder
    const totalFiles = await db.file.count({
      where: { folder_id: folderId },
    });

    if (totalFiles >= filePerFolderLimit) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Max ${filePerFolderLimit} files allowed per folder`
      );
    }
  }

  // ✅ Create file
  const result = await db.file.create({
    data: {
      ...payload,
      folder_id: folderId, // can be null
    } as Prisma.FileUncheckedCreateInput,
  });

  // ✅ Update folder file count ONLY if folder exists
  if (folder) {
    await db.folder.update({
      where: { id: folder.id },
      data: {
        total_files: { increment: 1 }, // 🔥 safer than +1
      },
    });
  }

  return result;
};



const getAllFilesFromDB = async (userId: number, parent_folder_id?: number) => {

  const files = await db.file.findMany({
    where: { user_id: userId, folder_id: parent_folder_id || null },
    orderBy: { id: 'asc' },
  });
  return files;
}

const deleteFile = async (userId: number, file_id: number | null) => {
  if (!file_id) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "File ID is required");
  }

  const file = await db.file.findFirst({
    where: {
      id: file_id,
      user_id: userId,
    },
  });

  if (!file) {
    throw new ApiError(StatusCodes.NOT_FOUND, "File not found");
  }

  if (file.folder_id !== null) {
    await db.folder.update({
      where: { id: file.folder_id },
      data: {
        total_files: { decrement: 1 },
      },
    });
  }

  await db.file.delete({
    where: { id: file_id },
  });

  return { success: true, message: "File deleted successfully" };
};



export const FileService = {
  createFileToDB,
  getAllFilesFromDB,
  deleteFile
};
