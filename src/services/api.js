/**
 * EcoNexis API Service
 * Central client for interacting with Express.js + MongoDB Backend
 */

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to retrieve stored JWT token
 */
export const getAuthToken = () => {
  return localStorage.getItem('econexis_jwt_token');
};

/**
 * Helper to set stored JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('econexis_jwt_token', token);
  } else {
    localStorage.removeItem('econexis_jwt_token');
  }
};

/**
 * Unified fetch wrapper with JWT authorization header support
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.warn(`[API Request Error] ${options.method || 'GET'} ${endpoint}:`, error.message);
    throw error;
  }
}

// ==============================================================================
// 1. Health API
// ==============================================================================
export const healthApi = {
  check: () => request('/health'),
};

// ==============================================================================
// 2. Auth API (JWT)
// ==============================================================================
export const authApi = {
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
  changePassword: (passwordData) =>
    request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    }),
};

// ==============================================================================
// 3. Users API (MongoDB)
// ==============================================================================
export const userApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/users/${id}`),
  create: (userData) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  update: (id, userData) =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  delete: (id) =>
    request(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// ==============================================================================
// 4. Pickups API (MongoDB)
// ==============================================================================
export const pickupApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/pickups${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/pickups/${id}`),
  create: (pickupData) =>
    request('/pickups', {
      method: 'POST',
      body: JSON.stringify(pickupData),
    }),
  update: (id, pickupData) =>
    request(`/pickups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pickupData),
    }),
  delete: (id) =>
    request(`/pickups/${id}`, {
      method: 'DELETE',
    }),
};

// ==============================================================================
// 5. Donations API (MongoDB)
// ==============================================================================
export const donationApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/donations${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/donations/${id}`),
  create: (donationData) =>
    request('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    }),
  update: (id, donationData) =>
    request(`/donations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(donationData),
    }),
  delete: (id) =>
    request(`/donations/${id}`, {
      method: 'DELETE',
    }),
};

// ==============================================================================
// 6. Deliveries API (MongoDB)
// ==============================================================================
export const deliveryApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/deliveries${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/deliveries/${id}`),
  create: (deliveryData) =>
    request('/deliveries', {
      method: 'POST',
      body: JSON.stringify(deliveryData),
    }),
  verifyScan: (verificationData) =>
    request('/deliveries/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    }),
};

// ==============================================================================
// 7. Rewards API (MongoDB)
// ==============================================================================
export const rewardApi = {
  getAll: () => request('/rewards'),
  getById: (id) => request(`/rewards/${id}`),
  create: (rewardData) =>
    request('/rewards', {
      method: 'POST',
      body: JSON.stringify(rewardData),
    }),
  redeem: (id) =>
    request(`/rewards/${id}/redeem`, {
      method: 'POST',
    }),
};

export const ewasteApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/ewaste${query ? `?${query}` : ''}`);
  },
  getUserStats: () => request('/ewaste/stats'),
  getAdminStats: () => request('/ewaste/stats/admin'),
  getByObjectId: (objectId) => request(`/ewaste/object/${encodeURIComponent(objectId)}`),
  getMyEwaste: () => request('/ewaste/my'),
  getById: (id) => request(`/ewaste/${id}`),
  create: (ewasteData) =>
    request('/ewaste', {
      method: 'POST',
      body: JSON.stringify(ewasteData),
    }),
  confirmPickup: (objectId, data = {}) =>
    request(`/ewaste/object/${encodeURIComponent(objectId)}/pickup`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  recycleObject: (objectId) =>
    request(`/ewaste/object/${encodeURIComponent(objectId)}/recycle`, {
      method: 'PUT',
    }),
  update: (id, ewasteData) =>
    request(`/ewaste/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ewasteData),
    }),
  delete: (id) =>
    request(`/ewaste/${id}`, {
      method: 'DELETE',
    }),
};

export default {
  health: healthApi,
  auth: authApi,
  users: userApi,
  pickups: pickupApi,
  donations: donationApi,
  deliveries: deliveryApi,
  rewards: rewardApi,
  ewaste: ewasteApi,
};
