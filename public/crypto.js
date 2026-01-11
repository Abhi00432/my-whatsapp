const rawKey = crypto.getRandomValues(new Uint8Array(32));

export const key = await crypto.subtle.importKey(
  "raw",
  rawKey,
  "AES-GCM",
  false,
  ["encrypt", "decrypt"]
);

export async function encrypt(text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);

  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return { iv: [...iv], data: [...new Uint8Array(cipher)] };
}

export async function decrypt(payload) {
  const iv = new Uint8Array(payload.iv);
  const data = new Uint8Array(payload.data);

  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return new TextDecoder().decode(plain);
}
                    