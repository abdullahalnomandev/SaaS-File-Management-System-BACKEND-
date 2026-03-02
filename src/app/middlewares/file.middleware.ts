import { Request, Response, NextFunction } from 'express';
import db from '../../shared/prisma';
import ApiError from '../../errors/ApiError';

export const loadUserPackage = async (req: any, res: Response, next: NextFunction) => {
  const userId = req.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { package: true },
  });

  if (!user || !user.package) {
    throw new ApiError(400, 'Package not found for this user');
  }

  req.packageInfo = user.package;
  next();
};