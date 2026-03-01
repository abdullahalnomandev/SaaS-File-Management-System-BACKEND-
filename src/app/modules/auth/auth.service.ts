import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import db from '../../../shared/prisma';


// Helper function to handle PRISMA user authentication fields
const updateUserAuthentication = async (
  userId: number,
  authentication: Partial<{
    oneTimeCode: string | null;
    expireAt: Date | null;
    isResetPassword: boolean;
  }>
) => {
  // Store authentication as JSON in DB if needed, for now as fields:
  await db.user.update({
    where: { id: userId },
    data: {
      authentication: {
        ...(authentication.oneTimeCode !== undefined && { oneTimeCode: authentication.oneTimeCode }),
        ...(authentication.expireAt !== undefined && { expireAt: authentication.expireAt }),
        ...(authentication.isResetPassword !== undefined && {
          isResetPassword: authentication.isResetPassword,
        }),
      },
    } as any, // for demonstration, actual schema will impact this
  });
};

//login
const isMatchPassword = async (rawPassword: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(rawPassword, hash);
};

const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;

  // user: Must select password & all necessary fields
  const isExistUser = await db.user.findUnique({ where: { email } });

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // status using 'block' as per USER_STATUS, not 'delete'
  if (isExistUser.status === 'block') {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You don’t have permission to access this content. It looks like your account has been deactivated.'
    );
  }

  // Check password
  if (!isExistUser.password || !(await isMatchPassword(password, isExistUser.password))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  // Validate JWT secret presence
  if (!config.jwt.jwt_secret) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'secretOrPrivateKey must have a value'
    );
  }

  //create token
  const createToken = jwtHelper.createToken(
    { id: isExistUser.id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return { access_token:createToken };
};


//forget password
const forgetPasswordToDB = async (email: string) => {
  // Find user by email
  const isExistUser = await db.user.findUnique({ where: { email } });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp: otp.toString(),
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
    emailHelper.sendEmail(forgetPassword);

  await db.user.update({
    where: { email },
    data: {
      onetime_code: otp.toString(),
      expires_at: new Date(Date.now() + 10 * 60000),
    } 
  });
};



const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const foundUser = await db.user.findUnique({ where: { id: Number(user.id) } });

  if (!foundUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await isMatchPassword(currentPassword, foundUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await db.user.update({
    where: { id: Number(user.id) },
    data: {
      password: hashPassword,
    },
  });
};

//resend OTP
const resendOTPToDB = async (email: string) => {
  // Find user by email
  const isExistUser = await db.user.findUnique({ where: { email } });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp: otp.toString(),
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
    emailHelper.sendEmail(forgetPassword);

  await db.user.update({
    where: { email },
    data: {
      onetime_code: otp.toString(),
      expires_at: new Date(Date.now() + 10 * 60000),
    } 
  });
};


//verify OTP`
const verifyOTPFromDB = async (otp: string) => {
  // Ensure OTP is a string
  const otpStr = otp.toString();

  // Find user by OTP
  const user = await db.user.findFirst({
    where: { onetime_code: otpStr }, // ✅ Correct syntax
  });

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid OTP!");
  }


  if (user.expires_at && user.expires_at < new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP has expired');
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      verified: true
    },
  });

  return { message: 'OTP verified successfully' };
};


//renew password
const renewPasswordToDB = async (
  otp: string,
  payload: IChangePassword
) => {
  const { newPassword, confirmPassword } = payload;
  const foundUser = await db.user.findFirst({ where: { onetime_code: otp } });

  if (!foundUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );


  await db.user.update({
    where: { id: Number(foundUser.id) },
    data: {
      password: hashPassword,
      onetime_code: '',
      expires_at: null,
    },
  });
};



export const AuthService = {
  loginUserFromDB,
  forgetPasswordToDB,
  changePasswordToDB,
  resendOTPToDB,
  verifyOTPFromDB,
  renewPasswordToDB
  
};
