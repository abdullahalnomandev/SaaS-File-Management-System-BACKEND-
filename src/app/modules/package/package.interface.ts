export interface IPackage {
  id: number;
  name: string;
  total_max_folder: number;
  max_nesting_folder: number;
  allowed_file_type: string[];
  max_file_size: number;
  total_file_limit: number;
  file_per_folder_limit: number;
  created_at: Date;
  updated_at: Date;
}