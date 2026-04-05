import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { User } from '../types';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, AlertCircle, PlayCircle, UserCheck, GraduationCap, KeyRound } from 'lucide-react';

interface AuthFormProps {
  onAuthSuccess: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
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
        const { user, session } = await db.register(name, email, password, uplineId);
        if (!session) {
            setVerificationSent(true);
        } else {
            onAuthSuccess(user);
        }
      }
    } catch (err: any) {
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
        <div className="min-h-screen bg-fwd-orange flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-fwd-orange-20 rounded-full mb-6">
                    <Mail className="w-8 h-8 text-fwd-orange" />
                </div>
                <h2 className="text-2xl font-bold text-fwd-green mb-2">Verify your email</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    We've sent an <span className="font-bold text-fwd-orange">8-digit code</span> to <br/><span className="font-bold text-fwd-green">{email}</span>.
                </p>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 text-sm justify-center">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="relative">
                        <KeyRound className="w-5 h-5 text-fwd-green/40 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Enter 8-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.trim())}
                            className="w-full pl-10 pr-4 py-3 bg-fwd-grey/30 border border-fwd-grey rounded-xl focus:ring-2 focus:ring-fwd-orange outline-none transition-all text-center tracking-widest font-mono text-lg text-fwd-green placeholder-fwd-green/40"
                            required
                            maxLength={8}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-fwd-orange hover:bg-fwd-orange-80 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98]"
                    >
                        {loading ? 'Verifying...' : 'Verify code'}
                    </button>
                </form>

                <div className="mt-6 border-t border-fwd-grey pt-4">
                    <button
                        onClick={() => { setVerificationSent(false); setOtp(''); }}
                        className="text-sm text-fwd-green/60 hover:text-fwd-orange transition-colors"
                    >
                        Change email address
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-fwd-orange flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-10">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                 <div className="w-16 h-16 rounded-2xl bg-fwd-orange text-white flex items-center justify-center shadow-lg transform rotate-3">
                    <GraduationCap className="w-10 h-10" />
                 </div>
              </div>
              <h2 className="text-2xl font-bold text-fwd-green mb-1">Aquila11 Financial Academy</h2>
              <p className="text-fwd-green/60 text-sm">
                {isLogin ? 'Log in to continue your training' : 'Join the Aquila11 Financial Academy'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {uplineId && !isLogin && (
              <div className="mb-6 p-4 bg-fwd-orange-20 border border-fwd-orange-50 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 text-fwd-orange">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-fwd-green text-xs uppercase tracking-wide">Recruited by</p>
                  <p className="text-fwd-orange font-bold text-sm">
                     {uplineName ? uplineName : `ID: ${uplineId.slice(0, 8)}...`}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-fwd-green/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-fwd-grey/30 border border-fwd-grey rounded-xl focus:ring-2 focus:ring-fwd-orange outline-none transition-all text-fwd-green placeholder-fwd-green/40"
                    required
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="w-5 h-5 text-fwd-green/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-fwd-grey/30 border border-fwd-grey rounded-xl focus:ring-2 focus:ring-fwd-orange outline-none transition-all text-fwd-green placeholder-fwd-green/40"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-fwd-green/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-fwd-grey/30 border border-fwd-grey rounded-xl focus:ring-2 focus:ring-fwd-orange outline-none transition-all text-fwd-green placeholder-fwd-green/40"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-fwd-orange hover:bg-fwd-orange-80 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? 'Processing...' : (
                  <>
                    {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    {isLogin ? 'Sign in' : 'Create account'}
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-fwd-grey"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-fwd-green/50 font-medium">Or</span></div>
            </div>

            <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="mt-6 w-full bg-white border-2 border-fwd-green text-fwd-green font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 hover:bg-fwd-grey/20"
            >
                <PlayCircle className="w-5 h-5" />
                Log in as "Brandita" (Branch Mgr)
            </button>
          </div>

          <div className="p-6 bg-fwd-grey/30 border-t border-fwd-grey text-center">
            {uplineId ? (
                <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-bold text-fwd-orange hover:text-fwd-orange-80 transition-colors"
                >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
            ) : (
                <p className="text-xs text-fwd-green/50 italic">
                    Registration is by invitation only.
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;