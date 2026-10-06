import { Product } from '../interfaces/product';

export const normalizeText = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

// "baterias" y "bateria" deben encontrarse entre sí: se quita una "s" final.
const stem = (token: string): string =>
  token.length > 3 && token.endsWith('s') ? token.slice(0, -1) : token;

export function searchTokens(term: string): string[] {
  const tokens = normalizeText(term).split(/\s+/).filter(Boolean);
  const meaningful = tokens.filter((token) => token.length > 1);
  return (meaningful.length ? meaningful : tokens).map(stem);
}

export function matchesSearch(product: Product, tokens: string[]): boolean {
  if (!tokens.length) return true;
  const haystack = normalizeText(
    [
      product.name,
      product.category,
      product.brand,
      product.sku,
      product.Marcavehicular,
      product.ReferenciaVehiculo,
    ].join(' ')
  );
  return tokens.every((token) => haystack.includes(token));
}
