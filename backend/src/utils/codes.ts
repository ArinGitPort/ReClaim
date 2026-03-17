export function createCode(prefix: string): string {
  const value = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${value}`;
}

export function createPickupToken(): string {
  return `PK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
