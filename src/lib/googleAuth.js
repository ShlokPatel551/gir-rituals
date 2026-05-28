import { findCustomerByEmail, registerCustomer, generateClientId } from "./customerStore";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;
const googleEnabled = !!GOOGLE_CLIENT_ID;
function handleGoogleUser(info) {
  const existing = findCustomerByEmail(info.email);
  if (existing) return existing;
  return registerCustomer(
    {
      clientId: generateClientId(),
      firstName: info.given_name || info.name.split(" ")[0] || "User",
      lastName: info.family_name || info.name.split(" ").slice(1).join(" ") || "",
      email: info.email,
      phone: "",
      billingAddress: { street: "", city: "", state: "", pinCode: "" },
      deliveryAddress: { street: "", city: "", state: "", pinCode: "" }
    },
    `google_oauth_${info.sub}`
  );
}
export {
  GOOGLE_CLIENT_ID,
  googleEnabled,
  handleGoogleUser
};
