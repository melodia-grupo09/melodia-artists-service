/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from './file-upload.service';
import { UploadedFile } from './interfaces/uploaded-file.interface';
import { writeFile, mkdir } from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Mock external dependencies
jest.mock('fs/promises');
jest.mock('cloudinary');
jest.mock('uuid');

describe('FileUploadService', () => {
  let service: FileUploadService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockFile: UploadedFile = {
    fieldname: 'file',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test file content'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks
    jest.clearAllMocks();

    // Mock uuid
    (uuidv4 as jest.Mock).mockReturnValue('mock-uuid-123');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload to local storage in development', async () => {
      // Set environment to development
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Mock fs functions
      (mkdir as jest.Mock).mockResolvedValue(undefined);
      (writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await service.uploadFile(mockFile, 'artists');

      expect(mkdir).toHaveBeenCalledWith(
        expect.stringContaining('uploads/artists'),
        { recursive: true },
      );
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('mock-uuid-123-test-image.jpg'),
        mockFile.buffer,
      );
      expect(result).toBe('/uploads/artists/mock-uuid-123-test-image.jpg');

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should upload to Cloudinary in production', async () => {
      // Set environment to production
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Mock config service
      mockConfigService.get
        .mockReturnValueOnce('test-cloud-name')
        .mockReturnValueOnce('test-api-key')
        .mockReturnValueOnce('test-api-secret');

      // Mock Cloudinary uploader
      const mockUploadStream = {
        end: jest.fn(),
      };

      const mockCloudinaryResult = {
        secure_url: 'https://cloudinary.com/test-image.jpg',
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          // Simulate successful upload
          setTimeout(() => callback(null, mockCloudinaryResult), 0);
          return mockUploadStream;
        },
      );

      const result = await service.uploadFile(mockFile, 'artists');

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          folder: 'melodia/artists',
          public_id: 'mock-uuid-123',
          resource_type: 'auto',
        },
        expect.any(Function),
      );

      expect(mockUploadStream.end).toHaveBeenCalledWith(mockFile.buffer);
      expect(result).toBe('https://cloudinary.com/test-image.jpg');

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle Cloudinary upload errors', async () => {
      // Set environment to production
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Mock config service
      mockConfigService.get
        .mockReturnValueOnce('test-cloud-name')
        .mockReturnValueOnce('test-api-key')
        .mockReturnValueOnce('test-api-secret');

      // Mock Cloudinary uploader with error
      const mockUploadStream = {
        end: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          // Simulate upload error
          setTimeout(() => callback({ message: 'Upload failed' }, null), 0);
          return mockUploadStream;
        },
      );

      await expect(service.uploadFile(mockFile, 'artists')).rejects.toThrow(
        'Upload failed',
      );

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle Cloudinary upload with no result', async () => {
      // Set environment to production
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Mock config service
      mockConfigService.get
        .mockReturnValueOnce('test-cloud-name')
        .mockReturnValueOnce('test-api-key')
        .mockReturnValueOnce('test-api-secret');

      // Mock Cloudinary uploader with no result
      const mockUploadStream = {
        end: jest.fn(),
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          // Simulate no result
          setTimeout(() => callback(null, null), 0);
          return mockUploadStream;
        },
      );

      await expect(service.uploadFile(mockFile, 'artists')).rejects.toThrow(
        'Upload failed: No result returned',
      );

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle local storage errors', async () => {
      // Set environment to development
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Mock fs functions to throw error
      (mkdir as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      await expect(service.uploadFile(mockFile, 'artists')).rejects.toThrow(
        'Permission denied',
      );

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('constructor', () => {
    it('should configure Cloudinary in production environment', () => {
      // Set environment to production
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Mock config service
      mockConfigService.get
        .mockReturnValueOnce('test-cloud-name')
        .mockReturnValueOnce('test-api-key')
        .mockReturnValueOnce('test-api-secret');

      // Create new service instance
      new FileUploadService(configService);

      expect(cloudinary.config).toHaveBeenCalledWith({
        cloud_name: 'test-cloud-name',
        api_key: 'test-api-key',
        api_secret: 'test-api-secret',
      });

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should not configure Cloudinary in development environment', () => {
      // Set environment to development
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Clear previous calls
      jest.clearAllMocks();

      // Create new service instance
      new FileUploadService(configService);

      expect(cloudinary.config).not.toHaveBeenCalled();

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });
});
