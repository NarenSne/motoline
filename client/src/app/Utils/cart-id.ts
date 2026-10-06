import { HttpHeaders } from '@angular/common/http';

const STORAGE_KEY = 'cartId';

function generateCartId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10)).join('');
}

export function getCartId(): string {
  let id: string | null = null;
  try {
    id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateCartId();
      localStorage.setItem(STORAGE_KEY, id);
    }
  } catch {
    id = id || generateCartId();
  }
  return id;
}

export function cartHeaders(): HttpHeaders {
  return new HttpHeaders({ 'X-Cart-Id': getCartId() });
}
