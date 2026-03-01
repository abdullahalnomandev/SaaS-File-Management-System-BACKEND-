export type USER_ROLE = 'super_admin' | 'admin' | 'user';
export type USER_STATUS = 'active' | 'block';

export type IUser = {
  id: number;
  email: string;
  name?: string;
  password: string;
  role: USER_ROLE;
  profile_image?: string;
  status: USER_STATUS;
  verified: boolean;
  package_id?: number;
  onetime_code?: string;
  expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
};
