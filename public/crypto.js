const raw = crypto.getRandomValues(new Uint8Array(32));
export const key = await crypto.subtle.importKey(
  "raw", raw, "AES-GCM", false, ["encrypt","decrypt"]
);

export async function encrypt(text){
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = await crypto.subtle.encrypt(
    {name:"AES-GCM", iv},
    key,
    new TextEncoder().encode(text)
  );
  return { iv:[...iv], data:[...new Uint8Array(enc)] };
}

export async function decrypt(obj){
  const dec = await crypto.subtle.decrypt(
    {name:"AES-GCM", iv:new Uint8Array(obj.iv)},
    key,
    new Uint8Array(obj.data)
  );
  return new TextDecoder().decode(dec);
}
