# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Directories

```txt
s3-file-manager/
├── bin/
│   └── s3-file-manager.ts
├── lib/
│   ├── stacks/
│   │   └── api-stack.ts
│   ├── constructs/
│   │   └── lambda-construct.ts
│   └── s3-file-manager-stack.ts
├── src/
│   ├── functions/
│   │   ├── create-presigned-url/
│   │   │   └── index.ts
│   │   ├── list-files/
│   │   │   └── index.ts
│   │   ├── get-download-url/
│   │   │   └── index.ts
│   │   └── authorizer/
│   │       └── index.ts
│   ├── shared/
│   │   ├── s3-utils.ts
│   │   └── types.ts
│   └── config/
│       └── environment.ts
├── test/
│   └── s3-file-manager.test.ts
├── cdk.json
├── package.json
├── tsconfig.json
└── README.md
```

### HTTP Request cURL
