import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      toStream(file[0].buffer).pipe(uploadStream);
    });
  }

  uploadFiles(files: Express.Multer.File[]) {
    return Promise.all(
      files.map(
        async (file) =>
          new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            );
            toStream(file.buffer).pipe(uploadStream);
          })
      )
    );
  }
}
