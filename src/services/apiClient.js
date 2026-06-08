export const API_URL = 'http://13.207.106.215:8080/api';
export const BASE_URL = API_URL;
export const API_V1_URL = `${API_URL}/v1`;
export const V1_API = API_V1_URL;

export function isBackendToken(token) {
  return typeof token === 'string' && token.split('.').length === 3;
}

export function buildHeaders(token, extraHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

export async function requestJson(path, { method = 'GET', token, body, headers } = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const response = await fetch(url, {
    method,
    headers: buildHeaders(token, headers),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { response, data };
}

export const apiUrl = (path = '') => {
  return path.startsWith('http') ? path : `${API_URL}${path}`;
};
