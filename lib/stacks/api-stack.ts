import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { LambdaConstruct } from '../constructs/lambda-construct';

interface ApiStackProps extends cdk.StackProps {
  bucket: s3.IBucket,
  userPool: cognito.IUserPool,
  userPoolClient: cognito.IUserPoolClient
};

export class ApiStack extends Construct {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'S3FileManagerApi', {
      restApiName: 'S3 File Manager Service',
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Amz-Date',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ]
      },
    });

    // Create Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'S3FileManagerAuthorizer', {
      cognitoUserPools: [props.userPool]
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

    const signInLambda = new LambdaConstruct(this, 'SignInLambda', {
      functionName: 'authorizer',
      bucket: props.bucket,
      userPoolClientId: props.userPoolClient.userPoolClientId
    });

    // Create API Resources and methods
    const auth = api.root.addResource('auth');
    const signIn = auth.addResource('signIn');

    signIn.addMethod('POST', new apigateway.LambdaIntegration(signInLambda.function));

    const files = api.root.addResource('files');
    const authorizerConfig = {
      authorizer: authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    }

    files.addMethod('POST', new apigateway.LambdaIntegration(createPreSignedUrlLambda.function), {
      ...authorizerConfig
    });

    files.addMethod('GET', new apigateway.LambdaIntegration(listFilesLambda.function), {
      ...authorizerConfig
    });

    const file = files.addResource('{fileKey}');

    file.addMethod('GET', new apigateway.LambdaIntegration(getDownloadUrlLambda.function), {
      ...authorizerConfig
    });


    // Output the User Pool ID and Client ID
    new cdk.CfnOutput(this, 'UserPoolId', { value: props.userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: props.userPoolClient.userPoolClientId });

  }
}