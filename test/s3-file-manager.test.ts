import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as S3FileManager from '../lib/s3-file-manager-stack';

describe('S3FileManager Stack', () => {
  let app: cdk.App;
  let stack: S3FileManager.S3FileManagerStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new S3FileManager.S3FileManagerStack(app, 'S3FileManagerStack');
    template = Template.fromStack(stack);
  });

  test('Lambda Functions Created', () => {
    // Verifica que las funciones Lambda existan
    template.resourceCountIs('AWS::Lambda::Function', 4);

    // Verifica las propiedades básicas de las funciones
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: Match.stringLikeRegexp('index.handler'),
      Runtime: Match.stringLikeRegexp('nodejs20.x'),
    });

    // Verifica que tenga el rol IAM asociado
    template.hasResourceProperties('AWS::Lambda::Function', {
      Role: Match.anyValue()
    });
  });

  test('Lambda Environment Variables', () => {
    // Verifica las variables de entorno
    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: {
          BUCKET_NAME: Match.anyValue()
        }
      }
    });

    // Verifica que no existan variables de entorno sensibles
    template.hasResourceProperties('AWS::Lambda::Function', {
      Environment: {
        Variables: Match.not(Match.objectLike({
          AWS_ACCESS_KEY: Match.anyValue(),
          AWS_SECRET_KEY: Match.anyValue()
        }))
      }
    });
  });

  // Pruebas adicionales que podrías agregar
  test('Lambda Function Permissions', () => {
    // Verifica los permisos IAM asociados
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: [
          Match.objectLike({
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'lambda.amazonaws.com'
            }
          })
        ]
      })
    });

    // Verifica políticas específicas de S3
    // template.hasResourceProperties('AWS::IAM::Policy', {
    //   PolicyDocument: Match.objectLike({
    //     Statement: Match.arrayWith([
    //       Match.objectLike({
    //         Action: Match.arrayWith(['s3:GetObject', 's3:PutObject']),
    //         Effect: 'Allow',
    //         Resource: Match.anyValue()
    //       })
    //     ])
    //   })
    // });
  });

  // Prueba de integración con otros recursos
  test('S3 Bucket Integration', () => {
    // Verifica que el bucket S3 existe
    template.hasResourceProperties('AWS::S3::Bucket', {
      // Propiedades esperadas del bucket
    });

    // Verifica que existe la política que permite a Lambda acceder al bucket
    // template.hasResourceProperties('AWS::S3::BucketPolicy', {
    //   PolicyDocument: Match.objectLike({
    //     Statement: Match.arrayWith([
    //       Match.objectLike({
    //         Action: Match.arrayWith(['s3:GetObject']),
    //         Principal: Match.objectLike({
    //           Service: 'lambda.amazonaws.com'
    //         })
    //       })
    //     ])
    //   })
    // });
  });
});