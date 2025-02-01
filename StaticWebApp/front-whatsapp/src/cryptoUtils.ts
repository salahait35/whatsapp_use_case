// cryptoUtils.ts

export async function generateKeyPair(username: string) {
  const keyPair = await window.crypto.subtle.generateKey({
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  }, true, ["encrypt", "decrypt"]);

  // Exporter la clé publique
  const publicKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  console.log("Public Key: ", publicKeyJwk);

  // Exporter la clé privée
  const privateKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
  console.log("Private Key: ", privateKeyJwk);

  // Télécharger la clé privée en tant que fichier texte avec le nom de l'utilisateur
  const blob = new Blob([JSON.stringify(privateKeyJwk)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${username}_privateKey.txt`;
  a.click();

  return { publicKeyJwk, privateKeyJwk };
}

export async function encryptMessage(publicKeyJwk: JsonWebKey, message: string) {
  // Importer la clé publique
  const publicKey = await window.crypto.subtle.importKey(
    "jwk",
    publicKeyJwk,
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    true,
    ["encrypt"]
  );

  // Encoder le message en Uint8Array
  const encodedMessage = new TextEncoder().encode(message);

  // Chiffrer le message
  const encryptedMessage = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    publicKey,
    encodedMessage
  );

  return encryptedMessage;
}

export async function decryptMessage(privateKeyJwk: JsonWebKey, encryptedMessage: ArrayBuffer) {
  // Importer la clé privée
  const privateKey = await window.crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    true,
    ["decrypt"]
  );

  // Déchiffrer le message
  const decryptedMessage = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP"
    },
    privateKey,
    encryptedMessage
  );

  // Décoder le message en texte
  return new TextDecoder().decode(decryptedMessage);
}