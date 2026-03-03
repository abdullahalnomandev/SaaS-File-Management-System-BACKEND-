import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { FileController } from './file.controller';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { loadUserPackage } from '../../middlewares/file.middleware';

const router = express.Router();

router.post(
  '/upload',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  loadUserPackage,
  FileController.uploadHandler,
  FileController.create
);

router.get(
  '/',
  auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN,USER_ROLES.USER),
  FileController.getAll
);

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  FileController.deleteFile
);

export const FileRoutes = router;
