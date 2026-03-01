import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import db from "../../../shared/prisma";
import { IPackage } from "./package.interface";

const createPackageToDB = async (payload: IPackage): Promise<IPackage> => {
  if (!payload.name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Name is required");
  }

  const createdPackage = await db.package.create({
    data: payload,
  });

  return createdPackage;
};

const updatePackageToDB = async (
  packageId: number,
  payload: IPackage
): Promise<IPackage> => {
  
  console.log('id', packageId)
  const existing = await db.package.findUnique({ where: { id: packageId } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Package not found");
  }

  const updatedPackage = await db.package.update({
    where: { id: packageId },
    data: payload,
  });

  return updatedPackage;
};

const deletePackageFromDB = async (packageId: number): Promise<{ message: string }> => {
  const existing = await db.package.findUnique({ where: { id: packageId } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Package not found");
  }

  await db.package.delete({ where: { id: packageId } });
  return { message: "Package deleted successfully" };
};

const getAllPackagesFromDB = async (): Promise<IPackage[]> => {
  const packages = await db.package.findMany({
    orderBy: { id: "asc" }, // optional: sort by id
  });
  return packages;
};

export const PackageService = {
  createPackageToDB,
  updatePackageToDB,
  deletePackageFromDB,
  getAllPackagesFromDB,
};