import { api } from "./api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;
const googleEnabled = !!GOOGLE_CLIENT_ID;

// tokenResponse is the object from useGoogleLogin onSuccess — contains access_token
// Backend verifies the token with Google directly; we never trust client-supplied email
async function handleGoogleUser(tokenResponse) {
  return api.googleAuth(tokenResponse.access_token);
}

export { GOOGLE_CLIENT_ID, googleEnabled, handleGoogleUser };
