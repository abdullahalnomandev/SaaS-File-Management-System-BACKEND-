import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import unlinkFile from '../../../shared/unlinkFile';
import { IUser } from './user.interface';
import db from '../../../shared/prisma';
import generateOTP from '../../../util/generateOTP';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import bcrypt from 'bcrypt';

const createUserToDB = async (payload: Partial<IUser>) => {
  const { name, email, password } = payload;

  if (!name || !email || !password) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Name, email, and password are required'
    );
  }

  const existingUser = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (existingUser) {
    return {
      message: 'User already exists',
      user: existingUser,
    };
  }

  // Hash password
  const hashPassword = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT_ROUNDS || 10)
  );

  // Create new user
  const createdUser = await db.user.create({
    data: {
      name,
      email,
      password: hashPassword,
      package_id: 1,
    },
  });

  if (!createdUser) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to create user'
    );
  }

  // Generate OTP and expiration
  const otp = generateOTP();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000);

  // Update user with OTP and expiration
  await db.user.update({
    where: { id: createdUser.id },
    data: {
      onetime_code: String(otp),
      expires_at,
    },
  });

  // Send email in background (no await)
  const emailData = {
    otp: otp.toString(),
    email: createdUser.email,
    name: createdUser.name || '',
  };
  const verifyAccount = emailTemplate.verifyAccount(emailData);
  emailHelper.sendEmail(verifyAccount).catch(err => {
    console.error('Failed to send verification email:', err);
  });

  return {
    message: 'User created successfully',
    user: {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
    },
  };
};

const getUserProfileFromDB = async (user: JwtPayload) => {
  const { id } = user;
  const isExistUser = await db.user.findUnique({
    where: { id: Number(id) },
    include:{
      package:true,
    }
  });

  if (!isExistUser)
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");

  // Dynamically remove password
  const { password, onetime_code, expires_at, ...userData } = isExistUser;

  return userData;
};

const updateProfileToDB = async (user: JwtPayload, payload: Partial<IUser>) => {
  payload.package_id = Number(payload.package_id);

  // Find current user
  const isExistUser = await db.user.findUnique({
    where: { id: user.id },
  });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Unlink previous image if new image provided
  if (payload.profile_image && isExistUser.profile_image) {
    unlinkFile(isExistUser.profile_image);
  }

  const isPackageExist = await db.package.findUnique({
    where: { id: payload.package_id ?? undefined },
  });

  if (!isPackageExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Package doesn't exist!");
  }

  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: payload,
  });

  return updatedUser;
};

// Pagination - get all users
const getAllUsersFromDB = async (
  page: number = 1,
  limit: number = 10
): Promise<{
  meta: { page: number; limit: number; total: number };
  data: Partial<IUser>[];
}> => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    db.user.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
    db.user.count(),
  ]);

  const data = users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
    role: user.role,
    profile_image: user.profile_image ?? undefined,
    status: user.status,
    verified: user.verified,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }));

  return {
    meta: {
      page,
      limit,
      total,
    },
    data,
  };
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getAllUsersFromDB,
};
