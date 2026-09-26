import re

with open('src/components/MatrixEasterEgg.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Helper function to inject
base64_helper = """
// Convert Base64URL to Uint8Array
const base64UrlToUint8Array = (base64UrlData: string) => {
  const padding = '='.repeat((4 - base64UrlData.length % 4) % 4);
  const base64 = (base64UrlData + padding).replace(/\\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

"""

# Insert before MatrixEasterEgg declaration if not there
if "base64UrlToUint8Array" not in content:
    content = content.replace('export default function MatrixEasterEgg', base64_helper + 'export default function MatrixEasterEgg')


login_block_new = """  const handleFingerprintLogin = async () => {
    try {
      if (!window.PublicKeyCredential) {
        alert("WebAuthn / Biometrics not supported on this device/browser.");
        return;
      }
      
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credentialId = "V_LDz_xV333DBSFyfEYdoElaPpBENTVU7Ul2yK-ER3Y";
      const allowCredentialId = base64UrlToUint8Array(credentialId);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          rpId: window.location.hostname,
          userVerification: "required",
          allowCredentials: [{
            id: allowCredentialId,
            type: "public-key"
          }]
        }
      });

      if (credential) {
        sessionStorage.setItem('backroom_auth', 'granted');
        router.push('/backroom');
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      alert("Akses Ditolak! Sidik jari tidak dikenali atau dibatalkan.");
    }
  };"""

# Replace login block
content = re.sub(r'  const handleFingerprintLogin = async \(\) => \{.*?\n  \};\n', login_block_new + '\n', content, flags=re.DOTALL)

# Hide Register Button
content = content.replace('<Plus size={16} /> Daftar', '<Plus size={16} /> Daftar')

with open('src/components/MatrixEasterEgg.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
