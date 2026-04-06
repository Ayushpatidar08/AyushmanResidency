
/**
 * Utility to parse JWT token without external dependencies
 */
export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Handle global logout
 */
export function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_role');
  localStorage.removeItem('auth_broker_id');
  window.location.href = '/admin';
}

/**
 * Global API fetcher that handles JWT and 401s
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('auth_token');
  const headers: any = { ...options.headers };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Remove Content-Type for FormData so browser sets boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  
  const res = await fetch(url, { ...options, headers });
  
  if (res.status === 401) {
    logout();
  }
  
  return res;
}

/**
 * Set up auto-logout based on token expiry
 */
let logoutTimer: any = null;

export function setupAutoLogout() {
  if (logoutTimer) clearTimeout(logoutTimer);
  
  const token = localStorage.getItem('auth_token');
  if (!token) return;
  
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return;
  
  const expiryTime = decoded.exp * 1000; // Convert to ms
  const now = Date.now();
  const timeLeft = expiryTime - now;
  
  if (timeLeft <= 0) {
    logout();
  } else {
    logoutTimer = setTimeout(() => {
      alert("Session expired. Logging out...");
      logout();
    }, timeLeft);
  }
}
