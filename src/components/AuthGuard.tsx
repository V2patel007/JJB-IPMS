import React, { useEffect, useState } from 'react';
import { auth, db, onSnapshot, doc, updateDoc, addDoc, collection } from '@/lib/firebase';
import { AppUser } from '@/types';
import { Button } from '@/components/ui/button';
import { BrickWall, LogIn, ShieldCheck, User as UserIcon, Crown } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (role?: 'USER' | 'ADMIN' | 'SUPERADMIN') => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (role: 'USER' | 'ADMIN' | 'SUPERADMIN' = 'USER') => {
    const mockUser: AppUser = {
      uid: `demo-${role.toLowerCase()}`,
      email: `${role.toLowerCase()}@brickstore.com`,
      displayName: `Demo ${role.charAt(0) + role.slice(1).toLowerCase()}`,
      role: role,
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem('demo_user', JSON.stringify(mockUser));
    window.dispatchEvent(new Event('demo-auth-updated'));
  };

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="p-3 bg-primary/10 rounded-2xl">
            <BrickWall className="h-10 w-10 text-primary" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-10">
            <img 
              src="https://jjbricks.com/dashdesk/files/configuration//logo_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/logo-main%20-%20Copy.png" 
              alt="Jay Jalaram Brick Works" 
              className="h-16 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="h-12 w-px bg-gray-200" />
            <img 
              src="https://jjbricks.com/dashdesk/files/configuration//footer_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/bric_logo.png" 
              alt="Brick Logo" 
              className="h-16 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="mb-2">Brick Store IPMS</h1>
          <p className="text-primary mb-8 font-bold uppercase text-[10px] tracking-widest">
            Jay Jalaram Brick Works
          </p>
          <p className="text-gray-500 mb-8 text-xs font-medium uppercase tracking-widest leading-relaxed">
            Select a role to explore the application features locally.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => signIn('USER')} 
              variant="outline"
              className="w-full h-14 justify-start px-6 border-gray-200 hover:bg-gray-50 rounded-2xl group transition-all"
            >
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors mr-4">
                <UserIcon className="h-5 w-5 text-gray-600" />
              </div>
              <span className="font-bold text-gray-700 uppercase text-xs tracking-widest">Login as Standard User</span>
            </Button>
            
            <Button 
              onClick={() => signIn('ADMIN')} 
              variant="outline"
              className="w-full h-14 justify-start px-6 border-gray-200 hover:bg-gray-50 rounded-2xl group transition-all"
            >
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-white transition-colors mr-4">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-gray-700 uppercase text-xs tracking-widest">Login as Admin</span>
            </Button>
            
            <Button 
              onClick={() => signIn('SUPERADMIN')} 
              variant="outline"
              className="w-full h-14 justify-start px-6 border-gray-200 hover:bg-gray-50 rounded-2xl group transition-all"
            >
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-white transition-colors mr-4">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-gray-700 uppercase text-xs tracking-widest">Login as Superadmin</span>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
