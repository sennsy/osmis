import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fingerprint, Plus } from 'lucide-react';
import styles from './MatrixEasterEgg.module.css';

interface MatrixEasterEggProps {
  onClose: () => void;
}

const ASCII_PHASE1 = `
 _       __     ____                           ____                   
| |     / /___ / / /________  ____ ___  ___   / __ )____ _____  ____ _
| | /| / / __ \\/ / / ___/ __ \\/ __ \`__ \\/ _ \\ / __  / __ \`/ __ \\/ __ \`/
| |/ |/ / /_/ / / / /__/ /_/ / / / / / /  __// /_/ / /_/ / / / / /_/ / 
|__/|__/\\____/_/_/\\___/\\____/_/ /_/ /_/\\___//_____/\\__,_/_/ /_/\\__, /  
                                                              /____/   
`;

const ASCII_PHASE2 = `
 _       __     ____                           ___       __          _     
| |     / /___ / / /________  ____ ___  ___   /   | ____/ /___ ___  (_)___ 
| | /| / / __ \\/ / / ___/ __ \\/ __ \`__ \\/ _ \\ / /| |/ __  / __ \`__ \\/ / __ \\
| |/ |/ / /_/ / / / /__/ /_/ / / / / / /  __// ___ / /_/ / / / / / / / / / /
|__/|__/\\____/_/_/\\___/\\____/_/ /_/ /_/\\___//_/  |_\\__,_/_/ /_/ /_/_/_/ /_/ 
`;


// Convert Base64URL to Uint8Array
const base64UrlToUint8Array = (base64UrlData: string) => {
  const padding = '='.repeat((4 - base64UrlData.length % 4) % 4);
  const base64 = (base64UrlData + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function MatrixEasterEgg({ onClose }: MatrixEasterEggProps) {
  const router = useRouter();
  
  const [phase, setPhase] = useState<1 | 2>(1);
  const [showInput, setShowInput] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (phase === 1) {
      setDisplayedText("");
      setShowInput(false);
      let charIndex = 0;
      interval = setInterval(() => {
        setDisplayedText(ASCII_PHASE1.slice(0, charIndex));
        charIndex += 5;
        if (charIndex > ASCII_PHASE1.length) {
          clearInterval(interval);
          setDisplayedText(ASCII_PHASE1);
          setTimeout(() => setShowInput(true), 500);
        }
      }, 20);
    } else {
      setDisplayedText("");
      setShowInput(false);
      let charIndex = 0;
      interval = setInterval(() => {
        setDisplayedText(ASCII_PHASE2.slice(0, charIndex));
        charIndex += 5;
        if (charIndex > ASCII_PHASE2.length) {
          clearInterval(interval);
          setDisplayedText(ASCII_PHASE2);
          setTimeout(() => setShowInput(true), 500);
        }
      }, 20);
    }

    return () => clearInterval(interval);
  }, [phase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === 1) {
      if (password === 'immszky') {
        setError(false);
        setPhase(2);
        setPassword("");
        setShowInput(false);
      } else {
        setError(true);
      }
    } else if (phase === 2) {
      if (password === 'immszkyy') {
        sessionStorage.setItem('backroom_auth', 'granted');
        router.push('/backroom');
        onClose();
      } else {
        setError(true);
      }
    }
  };

  const handleFingerprintLogin = async () => {
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
  };

  const handleFingerprintRegister = async () => {
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: "OSMIS Backroom",
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: "admin",
            displayName: "Administrator"
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            requireResidentKey: true,
          },
          timeout: 60000
        }
      });

      if (credential) {
        alert("Fingerprint berhasil didaftarkan! Anda sekarang bisa login via Fingerprint.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Gagal mendaftarkan fingerprint: " + err.message);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.uiContainer} onClick={e => e.stopPropagation()}>
        <pre className={`${styles.asciiText} ${phase === 2 ? styles.phase2Color : ''}`}>
          {displayedText}
        </pre>
        
        {showInput && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <p className={styles.prompt}>
              {phase === 1 ? 'Enter Initial Clearance:' : 'Enter Final Authorization:'}
            </p>
            <input 
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`${styles.input} ${error ? styles.error : ''}`}
              autoFocus
              placeholder="_"
            />
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={handleFingerprintLogin}
                className={styles.fingerprintBtn}
                title="Login with Fingerprint"
              >
                <Fingerprint size={20} /> Login Biometrik
              </button>

              <button 
                type="button" 
                onClick={handleFingerprintRegister}
                className={styles.fingerprintBtn}
                title="Register Fingerprint (Dev)"
              >
                <Plus size={16} /> Daftar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
