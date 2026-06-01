const ADMIN_TOKEN_KEY = "gir_admin_token";

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function setAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function isAdminLoggedIn() {
  const token = getAdminToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return !!payload.isAdmin && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function getAdminSession() {
  const token = getAdminToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { name: payload.name, email: payload.email };
  } catch {
    return null;
  }
}

function logoutAdmin() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export { getAdminToken, setAdminToken, isAdminLoggedIn, getAdminSession, logoutAdmin };
