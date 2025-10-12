// initialise storage
import { storage } from './config';
// import functions
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';

// Upload image to Firebase Storage
export const uploadImage = async (file, folder = 'itemListings') => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      name: fileName,
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Delete image from Firebase Storage
export const deleteImage = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    console.log('Image deleted successfully');
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Get download URL for an image
export const getImageURL = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
};

// List all files in a folder
export const listImages = async (folder = 'itemListings') => {
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    
    const images = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url: url
        };
      })
    );
    
    return images;
  } catch (error) {
    console.error('Error listing images:', error);
    throw error;
  }
};

// Upload multiple images
export const uploadMultipleImages = async (files, folder = 'itemListings') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};