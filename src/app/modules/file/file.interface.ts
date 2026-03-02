// Example File interface
export interface IFile {
  id: number;
  name: string;
  folder_id?: number | null; // nullable for root-level files
  user_id: number;
  file_type?: string | null;
  size?: number | null;
  url?: string | null;
  created_at?: Date;
  updated_at?: Date;
}
export type IFolderName = 'image' | 'media' | 'doc';
