import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getBackendMode, getFirebaseApp } from '../services/firebase';
import { uid } from '../lib/utils';

export type Role = 'client' | 'creator';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** id of the Creator profile this account manages (creators only) */
  creatorId?: string;
}

interface AuthValue {
  user: AuthUser | null;
  loading: boolean;
  backend: 'local' | 'firebase';
  register: (p: { name: string; email: string; password: string; role: Role }) => Promise<AuthUser>;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginWithGoogle: () => Promise<AuthUser>;
  logout: () => Promise<void>;
  linkCreator: (creatorId: string) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

/* ============================================================
 * LOCAL adapter — accounts live in this browser's localStorage.
 * Passwords are salted + SHA-256 hashed. This is for offline /
 * demo use; real security needs the Firebase backend.
 * ============================================================ */

const LS_USERS = 'workflow-users-v1';
const LS_SESSION = 'workflow-session-v1';

interface LocalRecord extends AuthUser {
  salt: string;
  hash: string;
}

async function sha256(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // very old browsers / insecure origins: weak fallback so the app still works
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

function readUsers(): LocalRecord[] {
  try {
    const raw = localStorage.getItem(LS_USERS);
    if (raw) return JSON.parse(raw) as LocalRecord[];
  } catch {
    /* ignore */
  }
  return [];
}

function writeUsers(list: LocalRecord[]) {
  try {
    localStorage.setItem(LS_USERS, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

const strip = ({ salt: _s, hash: _h, ...u }: LocalRecord): AuthUser => u;

async function ensureDemoUser() {
  const users = readUsers();
  if (users.some((u) => u.email === 'demo@workflow.app')) return;
  const salt = uid();
  users.push({
    id: 'demo-user',
    name: 'मीरा कपूर',
    email: 'demo@workflow.app',
    role: 'creator',
    creatorId: 'meera',
    salt,
    hash: await sha256(salt + 'demo1234'),
  });
  writeUsers(users);
}

const localApi = {
  async init(): Promise<AuthUser | null> {
    await ensureDemoUser();
    const id = localStorage.getItem(LS_SESSION);
    const rec = readUsers().find((u) => u.id === id);
    return rec ? strip(rec) : null;
  },
  async register(p: { name: string; email: string; password: string; role: Role }): Promise<AuthUser> {
    const email = p.email.trim().toLowerCase();
    const users = readUsers();
    if (users.some((u) => u.email === email)) throw new Error('EMAIL_EXISTS');
    const salt = uid();
    const rec: LocalRecord = {
      id: uid(),
      name: p.name.trim(),
      email,
      role: p.role,
      salt,
      hash: await sha256(salt + p.password),
    };
    writeUsers([...users, rec]);
    localStorage.setItem(LS_SESSION, rec.id);
    return strip(rec);
  },
  async login(emailIn: string, password: string): Promise<AuthUser> {
    const email = emailIn.trim().toLowerCase();
    const rec = readUsers().find((u) => u.email === email);
    if (!rec || rec.hash !== (await sha256(rec.salt + password))) throw new Error('BAD_CREDENTIALS');
    localStorage.setItem(LS_SESSION, rec.id);
    return strip(rec);
  },
  async logout() {
    localStorage.removeItem(LS_SESSION);
  },
  async linkCreator(userId: string, creatorId: string) {
    writeUsers(readUsers().map((u) => (u.id === userId ? { ...u, creatorId } : u)));
  },
};

/* ============================================================
 * FIREBASE adapter — Firebase Auth (email/password + Google)
 * and a `users/{uid}` Firestore doc for role + creator link.
 * ============================================================ */

async function fbParts() {
  const app = await getFirebaseApp();
  const auth = await import('firebase/auth');
  const fs = await import('firebase/firestore');
  return { a: auth, f: fs, auth: auth.getAuth(app), db: fs.getFirestore(app) };
}

async function fbProfile(
  uidStr: string,
  fallback: { name: string; email: string },
  create?: { role: Role; name?: string },
): Promise<AuthUser> {
  const { f, db } = await fbParts();
  const ref = f.doc(db, 'users', uidStr);
  const snap = await f.getDoc(ref);
  if (snap.exists()) {
    const d = snap.data() as Partial<AuthUser>;
    return {
      id: uidStr,
      name: d.name || fallback.name,
      email: d.email || fallback.email,
      role: d.role === 'creator' ? 'creator' : 'client',
      creatorId: d.creatorId,
    };
  }
  const u: AuthUser = {
    id: uidStr,
    name: create?.name || fallback.name,
    email: fallback.email,
    role: create?.role ?? 'client',
  };
  await f.setDoc(ref, JSON.parse(JSON.stringify(u)));
  return u;
}

const firebaseApi = {
  async register(p: { name: string; email: string; password: string; role: Role }): Promise<AuthUser> {
    const { a, auth } = await fbParts();
    const cred = await a.createUserWithEmailAndPassword(auth, p.email.trim(), p.password);
    await a.updateProfile(cred.user, { displayName: p.name.trim() });
    return fbProfile(cred.user.uid, { name: p.name.trim(), email: p.email.trim() }, { role: p.role, name: p.name.trim() });
  },
  async login(email: string, password: string): Promise<AuthUser> {
    const { a, auth } = await fbParts();
    const cred = await a.signInWithEmailAndPassword(auth, email.trim(), password);
    return fbProfile(cred.user.uid, { name: cred.user.displayName ?? email, email: cred.user.email ?? email });
  },
  async google(): Promise<AuthUser> {
    const { a, auth } = await fbParts();
    const cred = await a.signInWithPopup(auth, new a.GoogleAuthProvider());
    return fbProfile(cred.user.uid, { name: cred.user.displayName ?? 'User', email: cred.user.email ?? '' });
  },
  async logout() {
    const { a, auth } = await fbParts();
    await a.signOut(auth);
  },
  async linkCreator(userId: string, creatorId: string) {
    const { f, db } = await fbParts();
    await f.setDoc(f.doc(db, 'users', userId), { creatorId }, { merge: true });
  },
};

/* ============================================================ */

export function AuthProvider({ children }: { children: ReactNode }) {
  const backend = getBackendMode();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        if (backend === 'local') {
          const u = await localApi.init();
          if (!cancelled) setUser(u);
        } else {
          const { a, auth } = await fbParts();
          unsub = a.onAuthStateChanged(auth, async (fu) => {
            if (!fu) {
              if (!cancelled) setUser(null);
            } else {
              try {
                const u = await fbProfile(fu.uid, { name: fu.displayName ?? fu.email ?? 'User', email: fu.email ?? '' });
                if (!cancelled) setUser(u);
              } catch {
                if (!cancelled) setUser({ id: fu.uid, name: fu.displayName ?? fu.email ?? 'User', email: fu.email ?? '', role: 'client' });
              }
            }
            if (!cancelled) setLoading(false);
          });
          return;
        }
      } catch {
        /* fall through to loading=false */
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [backend]);

  const register = useCallback<AuthValue['register']>(
    async (p) => {
      const u = backend === 'firebase' ? await firebaseApi.register(p) : await localApi.register(p);
      setUser(u);
      return u;
    },
    [backend],
  );

  const login = useCallback<AuthValue['login']>(
    async (email, password) => {
      const u = backend === 'firebase' ? await firebaseApi.login(email, password) : await localApi.login(email, password);
      setUser(u);
      return u;
    },
    [backend],
  );

  const loginWithGoogle = useCallback<AuthValue['loginWithGoogle']>(async () => {
    if (backend !== 'firebase') throw new Error('GOOGLE_NEEDS_FIREBASE');
    const u = await firebaseApi.google();
    setUser(u);
    return u;
  }, [backend]);

  const logout = useCallback(async () => {
    if (backend === 'firebase') await firebaseApi.logout();
    else await localApi.logout();
    setUser(null);
  }, [backend]);

  const linkCreator = useCallback<AuthValue['linkCreator']>(
    async (creatorId) => {
      if (!user) return;
      if (backend === 'firebase') await firebaseApi.linkCreator(user.id, creatorId);
      else await localApi.linkCreator(user.id, creatorId);
      setUser({ ...user, creatorId, role: 'creator' });
    },
    [backend, user],
  );

  const value = useMemo(
    () => ({ user, loading, backend, register, login, loginWithGoogle, logout, linkCreator }),
    [user, loading, backend, register, login, loginWithGoogle, logout, linkCreator],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Human-friendly message for auth errors in the selected language. */
export function authErrorMessage(e: unknown, tr: (hi: string, en: string) => string): string {
  const code = (e as { code?: string })?.code ?? (e instanceof Error ? e.message : '');
  switch (code) {
    case 'EMAIL_EXISTS':
    case 'auth/email-already-in-use':
      return tr('इस ईमेल से अकाउंट पहले से है — लॉगिन करें।', 'An account with this email already exists — please log in.');
    case 'BAD_CREDENTIALS':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return tr('ईमेल या पासवर्ड गलत है।', 'Incorrect email or password.');
    case 'auth/weak-password':
      return tr('पासवर्ड कम से कम 6 अक्षर का रखें।', 'Password must be at least 6 characters.');
    case 'auth/invalid-email':
      return tr('सही ईमेल डालें।', 'Please enter a valid email.');
    case 'auth/popup-closed-by-user':
      return tr('Google साइन-इन बंद कर दिया गया।', 'Google sign-in was closed.');
    case 'auth/operation-not-allowed':
      return tr('Firebase Console में यह साइन-इन तरीका चालू करें।', 'Enable this sign-in method in the Firebase Console.');
    case 'auth/network-request-failed':
      return tr('नेटवर्क की दिक्कत — इंटरनेट जाँचें।', 'Network problem — check your connection.');
    case 'GOOGLE_NEEDS_FIREBASE':
      return tr('Google लॉगिन के लिए Firebase मोड चालू करें।', 'Turn on Firebase mode to use Google login.');
    default:
      return tr('कुछ गलत हो गया, फिर कोशिश करें।', 'Something went wrong, please try again.');
  }
}
