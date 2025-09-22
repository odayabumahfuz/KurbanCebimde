import React, { useState } from 'react';
import { adminApi, AdminLoginRequest } from '../lib/adminApi';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, ArrowRight } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<AdminLoginRequest>({
    phoneOrEmail: '',
    password: '',
    otp_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Giriş yapılıyor...', credentials);
      const response = await adminApi.login(credentials);
      console.log('Login successful:', response.user);
      
      // Dashboard'a yönlendir
      console.log('Dashboard\'a yönlendiriliyor...');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-zinc-900 dark:bg-zinc-100 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="h-8 w-8 text-white dark:text-zinc-900" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Admin Girişi
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Kurban Cebimde Admin Panel
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  id="phoneOrEmail"
                  name="phoneOrEmail"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-3 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:border-transparent transition-all"
                  placeholder="admin@kurbancebimde.com"
                  value={credentials.phoneOrEmail}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-3 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {showOtp && (
              <div>
                <label htmlFor="otp_code" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  OTP Kodu
                </label>
                <input
                  id="otp_code"
                  name="otp_code"
                  type="text"
                  autoComplete="off"
                  className="w-full px-3 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:border-transparent transition-all"
                  placeholder="6 haneli kod"
                  value={credentials.otp_code}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 p-4 border border-rose-200 dark:border-rose-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-rose-800 dark:text-rose-200">
                    Giriş Hatası
                  </h3>
                  <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-400 dark:focus:ring-zinc-600 border-zinc-300 dark:border-zinc-700 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                Beni hatırla
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => setShowOtp(!showOtp)}
                className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                {showOtp ? 'OTP Kaldır' : 'OTP Ekle'}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <ArrowRight className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
};

export default AdminLoginPage;
