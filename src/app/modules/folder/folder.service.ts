import { ListDateTimeFieldRefInput } from './../../../generated/prisma/internal/prismaNamespace';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import db from '../../../shared/prisma';
import { IFolder } from './folder.interface';

// Create a new folder
const createFolderToDB = async (payload: IFolder): Promise<IFolder> => {
  const { name, user_id, parent_folder_id } = payload;

  if (!name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Name is required');
  }

  const parentFolder = parent_folder_id
    ? await db.folder.findUnique({
        where: { id: parent_folder_id },
        select: {
          nesting_level: true,
          user: {
            select: {
              package: {
                select: {
                  max_nesting_folder: true,
                  total_max_folder: true,
                },
              },
            },
          },
        },
      })
    : null;

  const nesting_level = await db.folder.count({
    where: {
      parent_folder_id,
    },
  });

  const packageInfo = parentFolder?.user?.package;

  // Check nesting level restriction
  const nextNestingLevel = parentFolder ? nesting_level + 1 : 0;
  if (
    packageInfo?.max_nesting_folder !== undefined &&
    nextNestingLevel >= packageInfo.max_nesting_folder
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Maximum ${packageInfo.max_nesting_folder} nesting levels allowed.`
    );
  }

  // Check total folder limit
  const folderCount = await db.folder.count({
    where: { user_id },
  });

  const maxUserFolderPackageCount = await db.user.findUnique({
    where: { id: user_id },
    select: {
      package: {
        select: {
          total_max_folder: true,
        },
      },
    },
  });

  if (
    maxUserFolderPackageCount?.package?.total_max_folder !== undefined &&
    folderCount >= maxUserFolderPackageCount?.package?.total_max_folder
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Oops! You can only create ${maxUserFolderPackageCount?.package?.total_max_folder} folders.`
    );
  }

  // Create folder
  const createdFolder = await db.folder.create({
    data: {
      name,
      user_id,
      parent_folder_id: parent_folder_id ?? null,
      nesting_level: nextNestingLevel,
    },
  });

  return createdFolder;
};

// Update folder by ID
const updateFolderToDB = async (
  folderId: number,
  userId: number,
  payload: Partial<IFolder>
): Promise<IFolder> => {
  const existing = await db.folder.findUnique({ where: { id: folderId } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found');
  }

  if (existing.user_id !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to update this folder'
    );
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

// Get all folders (optional: can filter by user_id)
const getAllFoldersFromDB = async (
  userId?: number,
  parent_folder_id?: number
) => {
  const folders = await db.folder.findMany({
    where: userId
      ? { user_id: userId, parent_folder_id: parent_folder_id ?? undefined }
      : undefined,
    orderBy: { id: 'desc' },
  });
  return folders;
};

const deleteFolderFromDB = async (
  folderId: number,
  userId: number
): Promise<{ message: string }> => {
  const existing = await db.folder.findUnique({ where: { id: folderId } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Folder not found');
  }

  if (existing.user_id !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to delete this folder'
    );
  }

  await db.folder.delete({ where: { id: folderId } });
  await db.folder.deleteMany({
    where: { parent_folder_id: folderId },
  });
  await db.folder.deleteMany({
    where: { parent_folder_id: folderId },
  });
  return { message: 'Folder deleted successfully' };
};

// Get breadcrumb for a folder
const getBreadcrumbFromDB = async (
  folderId: number,
  userId: number
): Promise<IFolder[]> => {
  const breadcrumbs: IFolder[] = [];

  let currentFolder = await db.folder.findFirst({
    where: {
      id: folderId,
      user_id: userId,
    },
  });

  while (currentFolder) {
    breadcrumbs.unshift(currentFolder); // add to beginning

    if (!currentFolder.parent_folder_id) break;

    currentFolder = await db.folder.findFirst({
      where: {
        id: currentFolder.parent_folder_id,
        user_id: userId,
      },
    });
  }

  return breadcrumbs;
};

export const FolderService = {
  createFolderToDB,
  updateFolderToDB,
  getAllFoldersFromDB,
  deleteFolderFromDB,
  getBreadcrumbFromDB,
};
