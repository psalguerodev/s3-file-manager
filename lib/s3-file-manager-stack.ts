import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { ApiStack } from './stacks/api-stack';

export class S3FileManagerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const bucket = new s3.Bucket(this, 'S3FileManagerBucket', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Create a Cognito User Pool
    const userPool = new cognito.UserPool(this, 'S3FileManagerUserPool', {
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      signInAliases: { email: true }
    });

    // Create a Cognito User Client
    const userPoolClient = new cognito.UserPoolClient(this, 'S3FileManagerUserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        custom: true,
        userSrp: true,
      }
    });

    // Define API Stack
    new ApiStack(this, 'ApiStack', {
      bucket: bucket,
      userPool: userPool,
      userPoolClient: userPoolClient
    });

  }
}
