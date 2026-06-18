import { Injectable } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import { randomUUID } from 'crypto';

@Injectable()
export class AzureService {
  private readonly blobServiceClient: BlobServiceClient;

  constructor() {
    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING!,
      );
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    const containerClient =
      this.blobServiceClient.getContainerClient(
        process.env.AZURE_CONTAINER_NAME!,
      );

    const fileName = `${folder}/${randomUUID()}-${file.originalname}`;

    const blockBlobClient =
      containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    return blockBlobClient.url;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const containerClient =
      this.blobServiceClient.getContainerClient(
        process.env.AZURE_CONTAINER_NAME!,
      );

    // Extract blob name from the full URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    // pathname is like /container-name/folder/uuid-filename
    // Remove the first empty string and container name
    const blobName = decodeURIComponent(pathParts.slice(2).join('/'));

    const blockBlobClient =
      containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.deleteIfExists();
  }

  async downloadFile(fileUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
    const containerClient =
      this.blobServiceClient.getContainerClient(
        process.env.AZURE_CONTAINER_NAME!,
      );

    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const blobName = decodeURIComponent(pathParts.slice(2).join('/'));

    const blockBlobClient =
      containerClient.getBlockBlobClient(blobName);

    const properties = await blockBlobClient.getProperties();
    const contentType = properties.contentType || 'application/octet-stream';
    const buffer = await blockBlobClient.downloadToBuffer();

    return { buffer, contentType };
  }
}