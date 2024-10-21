import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";

const USER_POOL_CLIENT_ID = '32tvd92ehbat0rm57t258omctn';
const USER_POOL_REGION = 'us-east-1';

const client = new CognitoIdentityProviderClient({ region: USER_POOL_REGION });

async function signUp(username: string, password: string) {
  const command = new SignUpCommand({
    ClientId: USER_POOL_CLIENT_ID,
    Username: username,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: username,
      },
    ],
  });

  try {
    const response = await client.send(command);
    console.log("User signed up successfully:", response);
  } catch (error) {
    console.error("Error signing up:", error);
  }
}

async function signIn(username: string, password: string) {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: USER_POOL_CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  });

  try {
    const response = await client.send(command);
    console.log("Authentication successful. ID Token:", response.AuthenticationResult?.IdToken);
    return response.AuthenticationResult?.IdToken;
  } catch (error) {
    console.error("Error signing in:", error);
    return;
  }
}

// Usage
(async () => {
  // await signUp("psalguero.me@gmail.com", "TechLead2024$$");
  
  // In a real scenario, you'd need to confirm the user before signing in
  const idToken = await signIn("psalguero.me@gmail.com", "TechLead2024$$");

  if (idToken) {
    console.log("You can now use this ID Token to authenticate your API requests");
  }
})();