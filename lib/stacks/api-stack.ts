import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { LambdaConstruct } from '../constructs/lambda-construct';

interface ApiStackProps extends cdk.StackProps {
  bucket: s3.IBucket
};

export class ApiStack extends Construct {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'S3FileManagerApi', {
      restApiName: 'S3 File Manager Service'
    });

    // Create Lambda Functions
    const createPreSignedUrlLambda = new LambdaConstruct(this, 'CreatePresignedUrlLambda', {
      functionName: 'create-presigned-url',
      bucket: props.bucket
    });

    const listFilesLambda = new LambdaConstruct(this, 'ListFilesLambda', {
      functionName: 'list-files',
      bucket: props.bucket
    });

    const getDownloadUrlLambda = new LambdaConstruct(this, 'GetDownloadUrlLambda', {
      functionName: 'get-download-url',
      bucket: props.bucket
    });

    // Create API Resources and methods
    const files = api.root.addResource('files');

    files.addMethod('POST', new apigateway.LambdaIntegration(createPreSignedUrlLambda.function));
    files.addMethod('GET', new apigateway.LambdaIntegration(listFilesLambda.function));

    const file = files.addResource('{fileKey}');
    file.addMethod('GET', new apigateway.LambdaIntegration(getDownloadUrlLambda.function));

  }
}