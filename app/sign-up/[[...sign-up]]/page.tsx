'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerifying(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [-90, 0, -90] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Sign Up Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center order-2 lg:order-1"
        >
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Realtime Collab</h1>
            </div>

            {/* Custom Sign Up Form */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
              {!verifying ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Create account</h2>
                    <p className="text-gray-400">Start collaborating in real-time</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          First name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white 
                                   placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 
                                   focus:border-transparent transition-all"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Last name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white 
                                   placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 
                                   focus:border-transparent transition-all"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white 
                                 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 
                                 focus:border-transparent transition-all"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white 
                                 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 
                                 focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 
                               hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg 
                               shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating account...
                        </span>
                      ) : (
                        'Create account'
                      )}
                    </motion.button>
                  </form>
                </>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Verify your email</h2>
                    <p className="text-gray-400">We sent a code to {email}</p>
                  </div>

                  <form onSubmit={handleVerify} className="space-y-6">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Verification code
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl
                                 tracking-widest placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 
                                 focus:border-transparent transition-all"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 
                               hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg 
                               shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        'Verify email'
                      )}
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => setVerifying(false)}
                      className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      ← Back to sign up
                    </button>
                  </form>
                </>
              )}

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link href="/sign-in" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            <p className="text-center text-gray-500 text-xs mt-6">
              By signing up, you agree to our{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
            </p>
          </div>
        </motion.div>

        {/* Right Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block text-white space-y-6 order-1 lg:order-2"
        >
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Realtime Collab
              </h1>
              <p className="text-gray-400 text-sm">Dashboard Platform</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Start your journey to{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                seamless collaboration
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Join thousands of teams already collaborating in real-time. Create your account in seconds.
            </p>
          </div>

          <div className="space-y-4 pt-8">
            {[
              { icon: '✓', title: 'Free to Start', desc: 'No credit card required. Start collaborating immediately.', color: 'from-green-500 to-emerald-600' },
              { icon: '✓', title: 'Instant Setup', desc: 'Get started in under 60 seconds. No complex configuration.', color: 'from-blue-500 to-indigo-600' },
              { icon: '✓', title: '24/7 Support', desc: 'Our team is here to help you succeed, anytime you need.', color: 'from-purple-500 to-pink-600' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg text-2xl`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-4 pt-8"
          >
            {[
              { value: '10K+', label: 'Active Users', color: 'from-purple-400 to-pink-400' },
              { value: '99.9%', label: 'Uptime', color: 'from-blue-400 to-indigo-400' },
              { value: '500+', label: 'Teams', color: 'from-green-400 to-emerald-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
