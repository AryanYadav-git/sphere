// global.d.ts
declare global {
  interface Crypto {
    randomUUID: () => string;
  }
  const crypto: Crypto;
}
export {};