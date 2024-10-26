import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

    const fileKey = event.pathParameters?.fileKey;

    if (!fileKey) {
      return {
        statusCode: 400,
        headers: {
          ...customHeaders
        },
        body: JSON.stringify({ error: 'File key is  required' })
      };
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: `uploads/${fileKey}`
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      statusCode: 200,
      headers: {
        ...customHeaders
      },
      body: JSON.stringify({ downloadUrl: signedUrl }),
    };

  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      headers: {
        ...customHeaders
      },
      body: JSON.stringify({ error: 'Failed to get download URL' })
    };
  }
}