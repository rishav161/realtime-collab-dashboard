'use client';

import { useState, useEffect } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    title: 'Connect with everyone',
    subtitle: 'Join thousands collaborating in real-time'
  },
  {
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    title: 'Work together seamlessly',
    subtitle: 'Share ideas and build amazing things'
  },
  {
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
    title: 'Your team, unified',
    subtitle: 'Collaborate from anywhere, anytime'
  }
];

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        try {
          await fetch('/api/users/sync', { method: 'POST' });
        } catch (syncError) {
          console.error('Failed to sync user:', syncError);
        }
        
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-7xl bg-white dark:bg-neutral-950 rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="absolute top-6 right-6 p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3">Welcome back</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Sign in to continue your journey</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={() => signIn?.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/dashboard'
              })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-neutral-950 text-neutral-500">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-neutral-600 dark:text-neutral-400 cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded border-neutral-300 dark:border-neutral-700" />
                  Remember me
                </label>
                <a href="#" className="text-neutral-900 dark:text-white font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-lg disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-neutral-900 dark:text-white font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        </div>

        {/* Right Side - Image Carousel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded-r-3xl">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
              <h2 className="text-4xl font-bold mb-3">{slide.title}</h2>
              <p className="text-xl text-white/90">{slide.subtitle}</p>
            </div>
          </div>
        ))}
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
