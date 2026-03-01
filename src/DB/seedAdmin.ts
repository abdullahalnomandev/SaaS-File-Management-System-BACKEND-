import bcrypt from 'bcrypt';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';
import config from '../config';
import db from '../shared/prisma';

export const seedSuperAdmin = async () => {
  const isExistSuperAdmin = await db.user.findFirst({
    where: {
      email: config.super_admin.email,
      role: USER_ROLES.ADMIN,
    },
  });

  if (!isExistSuperAdmin) {
    const hashPassword = await bcrypt.hash(
      config.super_admin.password!,
      Number(config.bcrypt_salt_rounds)
    );

    await db.user.create({
      data: {
        name: 'Admin',
        email: config.super_admin.email!,
        role: USER_ROLES.ADMIN,
        password: hashPassword,
        verified:true
      },
    });

    logger.info('✨ Super Admin account has been successfully created!');
  }
};
