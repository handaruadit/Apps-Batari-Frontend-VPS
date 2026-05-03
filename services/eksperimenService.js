import { apiGet } from '@/services/api';

export async function getEksperimenParams() {
  return apiGet('/eksperimen/params');
}

export async function getEksperimenChart() {
  return apiGet('/eksperimen/chart');
}