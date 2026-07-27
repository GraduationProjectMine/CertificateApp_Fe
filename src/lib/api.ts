const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function safeParseJson(res: Response) {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`API Endpoint Error (${res.status}): ${res.statusText || 'Invalid response format'}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Do not set Content-Type if we're sending FormData (fetch handles boundary)
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  } else if (!options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Ensure HTTP-Only refresh cookies are sent/received
  };

  const res = await fetch(`${API_URL}${path}`, fetchOptions);
  
  // Handle 401 Unauthorized for silent JWT refresh
  if (res.status === 401 && !path.startsWith('/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        
        if (refreshRes.ok) {
          const refreshData = await safeParseJson(refreshRes);
          const newToken = refreshData.accessToken;
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', newToken);
          }
          isRefreshing = false;
          onRefreshed(newToken);

          // Retry the original request with the new access token
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryRes = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });
          const retryData = await safeParseJson(retryRes);
          if (!retryRes.ok) {
            throw new Error(retryData?.message || retryData?.error || 'Retry failed');
          }
          return retryData;
        } else {
          isRefreshing = false;
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('auth_user');
            window.location.href = '/auth/login';
          }
          throw new Error('Session expired');
        }
      } catch (err) {
        isRefreshing = false;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('auth_user');
          window.location.href = '/auth/login';
        }
        throw err;
      }
    }

    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        headers['Authorization'] = `Bearer ${newToken}`;
        fetch(`${API_URL}${path}`, { ...fetchOptions, headers })
          .then((retryRes) => {
            if (!retryRes.ok) {
              safeParseJson(retryRes).then(data => reject(new Error(data?.message || data?.error || 'Retry failed'))).catch(reject);
            } else {
              safeParseJson(retryRes).then(resolve).catch(reject);
            }
          })
          .catch(reject);
      });
    });
  }

  const data = await safeParseJson(res);
  if (!res.ok) throw new Error(data?.message || data?.error || 'Request failed');
  return data;
}
