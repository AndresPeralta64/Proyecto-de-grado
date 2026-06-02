const jsonld = require('jsonld');
const crypto = require('crypto');
const bs58 = require('bs58');

async function test() {
  const document = {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"
    ],
    "id": "http://example.com/cred/1",
    "type": ["VerifiableCredential", "OpenBadgeCredential"],
    "issuer": "http://example.com/issuer",
    "validFrom": "2026-06-02T14:00:00Z",
    "credentialSubject": {
      "id": "mailto:test@test.com",
      "type": ["AchievementSubject"],
      "achievement": {
        "id": "http://example.com/ach/1",
        "type": ["Achievement"],
        "name": "Test Badge"
      }
    }
  };

  const proofOptions = {
    "@context": document["@context"],
    "type": "DataIntegrityProof",
    "cryptosuite": "eddsa-rdfc-2022",
    "created": "2026-06-02T14:00:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "http://example.com/issuer#key-1"
  };

  try {
    const docCanon = await jsonld.normalize(document, { algorithm: 'URDNA2015', format: 'application/n-quads' });
    const proofCanon = await jsonld.normalize(proofOptions, { algorithm: 'URDNA2015', format: 'application/n-quads' });

    const hashDoc = crypto.createHash('sha256').update(docCanon).digest();
    const hashProof = crypto.createHash('sha256').update(proofCanon).digest();

    const dataToSign = Buffer.concat([hashProof, hashDoc]);
    console.log("Data to sign length:", dataToSign.length); // Should be 64
    
    // Generate test keys
    const { privateKey } = crypto.generateKeyPairSync('ed25519');
    const signature = crypto.sign(null, dataToSign, privateKey);
    
    console.log("Signature Multibase:", 'z' + bs58.encode(signature));
  } catch (e) {
    console.error(e);
  }
}

test();
