import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { User } from '../types';
import { LogIn, UserPlus, ShieldCheck, Mail, Lock, User as UserIcon, AlertCircle, PlayCircle, UserCheck, CheckCircle, KeyRound } from 'lucide-react';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  // Initialize from URL to determine mode immediately
  const searchParams = new URLSearchParams(window.location.search);
  const initialUplineId = searchParams.get('upline');
  const hasInvite = !!initialUplineId && initialUplineId.trim() !== '';

  const [isLogin, setIsLogin] = useState(!hasInvite);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [uplineId, setUplineId] = useState<string | null>(hasInvite ? initialUplineId : null);
  const [uplineName, setUplineName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    const fetchManagerName = async () => {
      if (initialUplineId) {
        try {
          const fetchedName = await db.getUserName(initialUplineId);
          if (fetchedName) {
            setUplineName(fetchedName);
          }
        } catch (err) {
          console.warn("Could not fetch manager name", err);
        }
      }
    };
    fetchManagerName();
  }, [initialUplineId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setVerificationSent(false);

    try {
      if (isLogin) {
        const user = await db.login(email, password);
        onAuthSuccess(user);
      } else {
        if (!name.trim()) throw new Error('Name is required');
        
        // Register returns session info
        const { user, session } = await db.register(name, email, password, uplineId);
        
        // If Supabase requires verification, switch to OTP input
        if (!session) {
            setVerificationSent(true);
        } else {
            onAuthSuccess(user);
        }
      }
    } catch (err: any) {
      // Backend validation for duplicate emails is handled by Supabase automatically.
      // We surface the error message directly to the user here.
      setError(err.message || 'An unexpected error occurred. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const user = await db.verifyOtp(email, otp);
        onAuthSuccess(user);
    } catch (err: any) {
        setError(err.message || 'Invalid code. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    
    const demoEmail = 'brandita@d11academy.com';
    const demoName = 'Brandita';
    const demoTitle = 'Financial Wealth Branch Manager';
    const demoId = 'demo-brandita-id';

    try {
        const demoUser: User = { id: demoId, name: demoName, email: demoEmail, title: demoTitle };
        await db.seedDemoProgress(demoId);
        onAuthSuccess(demoUser);
    } catch (err: any) {
      setError('Could not initialize Demo User.');
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
        <div className="min-h-screen bg-corporate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                    <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    We've sent an <span className="font-bold text-corporate-600">8-digit code</span> to <br/><span className="font-bold text-gray-900">{email}</span>.
                </p>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 text-sm justify-center">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="relative">
                        <KeyRound className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Enter 8-digit Code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.trim())}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-500 outline-none transition-all text-center tracking-widest font-mono text-lg"
                            required
                            maxLength={8}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-corporate-500 hover:bg-corporate-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                </form>

                <div className="mt-6 border-t border-gray-100 pt-4">
                    <button
                        onClick={() => { setVerificationSent(false); setOtp(''); }}
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Change email address
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-corporate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-corporate-100 rounded-2xl mb-4">
                <ShieldCheck className="w-8 h-8 text-corporate-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">D11 Academy</h2>
              <p className="text-gray-500 mt-2">
                {isLogin ? 'Welcome back, Advisor' : 'Join the Financial Academy'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {uplineId && !isLogin && (
              <div className="mb-6 p-3 bg-corporate-50 border border-corporate-200 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-full bg-corporate-100 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 text-corporate-600" />
                </div>
                <div>
                  <p className="font-bold text-corporate-800 text-xs uppercase tracking-wide">Recruited By</p>
                  <p className="text-corporate-600 font-bold text-sm">
                     {uplineName ? uplineName : `ID: ${uplineId.slice(0, 8)}...`}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-500 outline-none transition-all"
                    required
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-corporate-500 outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-corporate-500 hover:bg-corporate-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? 'Processing...' : (
                  <>
                    {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-4 relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Demo Access</span></div>
            </div>

            <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="mt-4 w-full bg-white border-2 border-corporate-100 hover:border-corporate-300 text-corporate-600 font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 hover:bg-corporate-50"
            >
                <PlayCircle className="w-5 h-5" />
                Log in as "Brandita" (Branch Mgr)
            </button>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
            {uplineId ? (
                <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium text-corporate-500 hover:text-corporate-700 transition-colors"
                >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
            ) : (
                <p className="text-xs text-gray-400 italic">
                    Registration is by invitation only. Please use your recruitment link to sign up.
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;