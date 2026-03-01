import { IFile } from "../file/file.interface";

export interface IFolder {
  id: number;
  name: string;
  user_id: number;
  parent_folder_id?: number | null; // nullable because root folder
  nesting_level: number;
  total_files: number;

  // relational fields
  parent?: IFolder | null;  // optional parent folder
  folders?: IFolder[];      // child folders
  files?: IFile[];           // files inside this folder
}

