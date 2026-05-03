import config from '@/config';

export async function apiGet(path) {
  const response = await fetch(`${config.API_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`GET ${path} gagal: ${response.status}`);
  }

  return response.json();
}

export async function apiPost(path, body) {
  const response = await fetch(`${config.API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`POST ${path} gagal: ${response.status}`);
  }

  return response.json();
}