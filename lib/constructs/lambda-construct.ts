import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as path from 'path';

interface LambdaConstructProps {
  functionName: string;
  bucket: s3.IBucket;
  userPoolClientId?: string;
}

export class LambdaConstruct extends Construct {
  public readonly function: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    // New Lambda Function
    this.function = new lambda.Function(this, props.functionName, {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code
        .fromAsset(path.join(__dirname, '..', '..', 'src', 'functions', props.functionName)),
      environment: {
        BUCKET_NAME: props.bucket.bucketName,
      }
    });

    if (props.userPoolClientId) {
      this.function.addEnvironment('USER_POOL_CLIENT_ID', props.userPoolClientId);
    }

    // Grant the Lambda function read/write permissions to the S3 bucket
    props.bucket.grantReadWrite(this.function);

    // Add CloudWatch Logs permissions
    this.function.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      resources: ['arn:aws:logs:*:*:*'],
    }));

  }

}