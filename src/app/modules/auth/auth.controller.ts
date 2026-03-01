import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';
import config from '../../../config';



const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { otp } = req.body;
  const result = await AuthService.verifyOTPFromDB(otp);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result
  });
});


const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUserFromDB(loginData);

  
  const cookieOptions = {
    secure: config.node_env === 'production',
    httpOnly: true,
  };
  res.cookie('token', result.access_token, cookieOptions);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User logged in successfully.',
    data: result
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  await AuthService.forgetPasswordToDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Please check your email. We have sent you an OTP.'
  });
});


const resendOTPtoDB = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  await AuthService.resendOTPToDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'OTP resend successfully',
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...passwordData } = req?.body;
  await AuthService.changePasswordToDB(user, passwordData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully changed',
  });
});

const renewPassword = catchAsync(async (req: Request, res: Response) => {
  const { ...renewData } = req.body;
  await AuthService.renewPasswordToDB(req?.body?.otp, renewData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully renewed',
  });
});

export const AuthController = {
  verifyOtp,
  loginUser,
  forgetPassword,
  resendOTPtoDB,
  changePassword,
  renewPassword
};
