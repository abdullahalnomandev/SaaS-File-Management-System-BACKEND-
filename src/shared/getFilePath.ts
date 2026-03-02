type IFolderName = 'image' | 'media' | 'doc' | 'file';

//single file
export const getSingleFilePath = (files: any, folderName: IFolderName) => {

  
  const fileField = files && files[folderName];
  console.log('fileField',files,folderName);
  if (fileField && Array.isArray(fileField) && fileField.length > 0) {
    return `/${folderName}/${fileField[0].filename}`;
  }

  return undefined;
};

//multiple files
export const getMultipleFilesPath = (files: any, folderName: IFolderName) => {
  const folderFiles = files && files[folderName];
  if (folderFiles) {
    if (Array.isArray(folderFiles)) {
      return folderFiles.map((file: any) => `/${folderName}/${file.filename}`);
    }
  }

  return undefined;
};


// Get image info
export const getImageInfo = (files: any, folderName: IFolderName) => {
  const fileField = files && files[folderName];

  if (fileField && Array.isArray(fileField) && fileField.length > 0) {
    const file = fileField[0];
    return {
      name: file.originalname,               // original name
      size: file.size,                   // size in bytes
      mimetype: file.mimetype,           // MIME type
      path: `/${folderName}/${file.filename}` // relative path with folder
    };
  }

  return undefined; // no file found
};