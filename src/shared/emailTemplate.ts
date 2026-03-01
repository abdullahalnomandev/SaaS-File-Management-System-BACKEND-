// src/helpers/emailTemplates.ts

import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const baseStyle = `
  font-family: Arial, sans-serif;
  background-color: #f5f7fa;
  margin: 0;
  padding: 0;
  color: #333;
`;

const containerStyle = `
  width: 100%;
  max-width: 600px;
  margin: 40px auto;
  padding: 30px 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
`;

const otpBox = (otp: string | number) => {
  // Ensure OTP is always 6 digits
  const formattedOtp = otp.toString().padStart(6, '0');

  return `
    <div style="
      background-color: #1D4ED8; /* Blue */
      width: 120px; /* slightly wider for 6 digits */
      padding: 12px;
      text-align: center;
      border-radius: 10px;
      color: #fff;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 2px;
      margin: 25px auto;
    ">${formattedOtp}</div>
  `;
};

const footerNote = `
  <p style="
    color: #6b7280; /* Grayish */
    font-size: 13px;
    line-height: 1.5;
    margin-top: 30px;
    text-align: center;
  ">
    If you didn't request this email, please ignore it. 
  </p>
`;

const createAccount = (values: ICreateAccount) => ({
  to: values.email,
  subject: 'Verify Your Account',
  html: `
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        <h2 style="color: #1D4ED8; font-size: 24px; margin-bottom: 20px; text-align: center;">
          Welcome ${values.name}!
        </h2>
        <p style="font-size: 16px; line-height: 1.6; text-align:center;">
          Please verify your account using the code below:
        </p>
        ${otpBox(values.otp.toString())}
        <p style="font-size: 14px; line-height: 1.5; text-align:center; color: #333;">
          This code is valid for 10 minutes.
        </p>
        ${footerNote}
      </div>
    </body>
  `,
});

const resetPassword = (values: IResetPassword) => ({
  to: values.email,
  subject: 'Reset Your Password',
  html: `
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        <h2 style="color: #1D4ED8; font-size: 24px; margin-bottom: 20px; text-align: center;">
          Password Reset Request
        </h2>
        <p style="font-size: 16px; line-height: 1.6; text-align:center;">
          Use the code below to reset your password:
        </p>
        ${otpBox(values.otp.toString())}
        <p style="font-size: 14px; line-height: 1.5; text-align:center; color: #333;">
          This code is valid for 10 minutes.
        </p>
        ${footerNote}
      </div>
    </body>
  `,
});

const verifyAccount = (values: ICreateAccount) => ({
  to: values.email,
  subject: 'Verify Your Account',
  html: `
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        <h2 style="color: #1D4ED8; font-size: 24px; margin-bottom: 20px; text-align: center;">
          Verify Your Account
        </h2>
        <p style="font-size: 16px; line-height: 1.6; text-align:center;">
          Hello ${
            values.name
          }, please use the following <strong>6-digit code</strong> to verify your account:
        </p>
        ${otpBox(values.otp.toString().padStart(6, '0'))}
        <p style="font-size: 14px; line-height: 1.5; text-align:center; color: #333;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
        ${footerNote}
      </div>
    </body>
  `,
});

export const emailTemplate = {
  createAccount,
  resetPassword,
  verifyAccount,
};
