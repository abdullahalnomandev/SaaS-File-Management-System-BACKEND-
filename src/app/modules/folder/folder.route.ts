import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { FolderController } from './folder.controller';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN,USER_ROLES.USER),
  FolderController.create
);

router.get(
  '/',
  auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN,USER_ROLES.USER),
  FolderController.getAll
);

router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN,USER_ROLES.USER),
  FolderController.deleteFolder
);
router.patch(
  '/:id',
  auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN,USER_ROLES.USER),
  FolderController.update
);

router.get(
  '/breadcrumb/:id',
  auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN,USER_ROLES.USER),
  FolderController.getBreadcrumb
)


export const FolderRoutes = router;