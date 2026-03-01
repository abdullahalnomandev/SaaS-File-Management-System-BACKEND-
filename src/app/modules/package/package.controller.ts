import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PackageService } from "./package.service";

// ✅ Create Package
const createPackage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const packageData = req.body;
  const result = await PackageService.createPackageToDB(packageData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Package created successfully",
    data: result,
  });
});

// ✅ Update Package
const updatePackage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const packageId = Number(req.params.id);
  const packageData = req.body;

  const result = await PackageService.updatePackageToDB(packageId, packageData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Package updated successfully",
    data: result,
  });
});

// ✅ Delete Package
const deletePackage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const packageId = Number(req.params.id);

  const result = await PackageService.deletePackageFromDB(packageId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
  });
});

// ✅ Get All Packages
const getAllPackages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await PackageService.getAllPackagesFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Packages fetched successfully",
    data: result,
  });
});

export const PackageController = {
  createPackage,
  updatePackage,
  deletePackage,
  getAllPackages,
};