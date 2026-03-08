const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
let currentUserId = null;

export function setApiUser(user) {
  currentUserId = user && user.id ? Number(user.id) : null;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (currentUserId) {
    headers['x-user-id'] = String(currentUserId);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const data = await response.json();
      if (data && data.message) {
        message = data.message;
      }
    } catch {
      // Ignore JSON parse error and keep generic message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function fetchDevices() {
  return request('/api/devices');
}

export function createDevice(payload) {
  return request('/api/devices', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteDevice(id) {
  return request(`/api/devices/${id}`, { method: 'DELETE' });
}

export function clearDevices() {
  return request('/api/devices', { method: 'DELETE' });
}

export function registerUser(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function sendReportEmail(payload) {
  return request('/api/email/send-report', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
