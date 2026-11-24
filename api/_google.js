// Shared helper: signs in to Google Cloud from Vercel without any stored key,
// using Vercel's OIDC token and Google Workload Identity Federation.
import { getVercelOidcToken } from '@vercel/functions/oidc';
import { ExternalAccountClient } from 'google-auth-library';

const {
  GCP_PROJECT_NUMBER,
  GCP_WIF_POOL_ID,
  GCP_WIF_PROVIDER_ID,
  GCP_SERVICE_ACCOUNT_EMAIL,
} = process.env;

let client;

export function googleAuth() {
  if (!client) {
    client = ExternalAccountClient.fromJSON({
      type: 'external_account',
      audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WIF_POOL_ID}/providers/${GCP_WIF_PROVIDER_ID}`,
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      token_url: 'https://sts.googleapis.com/v1/token',
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
      subject_token_supplier: { getSubjectToken: getVercelOidcToken },
    });
    client.scopes = ['https://www.googleapis.com/auth/cloud-platform'];
  }
  return client;
}

export async function googleToken() {
  const { token } = await googleAuth().getAccessToken();
  return token;
}
