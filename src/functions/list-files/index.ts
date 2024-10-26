import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyHandler } from 'aws-lambda';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

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

    const prefix = 'uploads/';
    const maxKeys = 1000;

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys
    });

    const response = await s3Client.send(command);

    const files = response.Contents?.map(item => ({
      key: item.Key,
      lastModified: item.LastModified,
      size: item.Size
    })) || [];

    return {
      statusCode: 200,
      headers: {
        ...customHeaders
      },
      body: JSON.stringify({ files })
    }

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        ...customHeaders
      },
      body: JSON.stringify({ error: 'Failed to list files.' })
    }
  }
}