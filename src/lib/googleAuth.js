import { api } from "./api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;
const googleEnabled = !!GOOGLE_CLIENT_ID;

async function handleGoogleUser(info) {
  const firstName = info.given_name || info.name?.split(" ")[0] || "User";
  const lastName = info.family_name || info.name?.split(" ").slice(1).join(" ") || "";
  return api.googleAuth(info.email, firstName, lastName);
}

export { GOOGLE_CLIENT_ID, googleEnabled, handleGoogleUser };
