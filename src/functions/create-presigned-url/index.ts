import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

const URL_EXPIRE_IN = 3600;

// Aditional Data for S3 Object
interface FileMetaData {
  fileName: string;
  contentType: string;
  [key: string]: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const customHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Amz-Date, X-Api-Key, X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  try {
    const bucketName = process.env.BUCKET_NAME;

    if (!bucketName) {
      throw new Error('BUCKET_NAME environment variable is not set');
    }

    // Parse body
    const body = event.body ? JSON.parse(event.body) : {};
    const metadata: FileMetaData = body.metadata || {};

    if (!metadata.fileName || !metadata.contentType) {
      throw new Error('fileName and contentType are required in metadata');
    }

    const fileKey = `uploads/${uuidv4()}-${metadata.fileName}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: metadata.contentType,
      Metadata: Object.entries(metadata).reduce((acc, [key, value]) => {
        if (key !== 'fileName' && key !== 'contentType') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>)
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: URL_EXPIRE_IN });

    return {
      statusCode: 200,
      headers: {
        ...customHeaders
      },
      body: JSON.stringify({
        uploadUrl: signedUrl,
        fileKey: fileKey,
        metadata: metadata
      }),
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        ...customHeaders,
      },
      body: JSON.stringify({ error: 'Failed to create presigned URL.' })
    };
  }

}