import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadedFile } from './interfaces/uploaded-file.interface';

@Injectable()
export class FileUploadService {
  constructor(private configService: ConfigService) {
    // Configure Cloudinary in production
    if (process.env.NODE_ENV === 'production') {
      cloudinary.config({
        cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
        api_key: this.configService.get('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
      });
    }
  }

  async uploadFile(file: UploadedFile, folder: string): Promise<string> {
    if (process.env.NODE_ENV === 'production') {
      return this.uploadToCloudinary(file, folder);
    } else {
      return this.uploadToLocal(file, folder);
    }
  }

  private async uploadToCloudinary(
    file: UploadedFile,
    folder: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `melodia/${folder}`,
            public_id: uuidv4(),
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              reject(new Error(error.message || 'Upload failed'));
            } else if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error('Upload failed: No result returned'));
            }
          },
        )
        .end(file.buffer);
    });
  }

  private async uploadToLocal(
    file: UploadedFile,
    folder: string,
  ): Promise<string> {
    const uploadDir = join(process.cwd(), 'uploads', folder);
    const fileName = `${uuidv4()}-${file.originalname}`;
    const filePath = join(uploadDir, fileName);

    await mkdir(uploadDir, { recursive: true });

    await writeFile(filePath, file.buffer);

    return `/uploads/${folder}/${fileName}`;
  }
}
