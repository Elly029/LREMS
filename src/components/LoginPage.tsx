import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      onLogin(username, password);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Left Side - Hero/Info */}
      <div className="w-full md:w-1/2 lg:w-2/3 relative overflow-hidden flex flex-col items-center justify-center p-8 sm:p-12 text-white">

        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 animate-gradient-xy"></div>

        {/* Starry Night Layers */}
        <div className="stars"></div>
        <div className="twinkling"></div>

        {/* Floating Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary-500/20 blur-3xl animate-blob"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-deped-red/10 blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-deped-yellow/10 blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.svg')]"></div>

        <div className="relative z-10 text-center max-w-2xl flex flex-col items-center">
          {/* System Logo */}
          <div className="mb-8 p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-500">
            <img
              src="/logos/lrems-logo.png"
              alt="LR-EMS Logo"
              className="w-48 h-48 object-contain drop-shadow-lg"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-white drop-shadow-md">
            Learning Resource Evaluation Management System
          </h1>

          <p className="text-xl sm:text-2xl text-blue-100 font-medium max-w-lg mx-auto mb-12">
            {/* Grades 1 & 3 Records */}
          </p>

          <div className="flex items-center justify-center gap-6 text-sm sm:text-base text-blue-50 font-medium">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse"></span>
              {/* Secure */}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.5)] animate-pulse"></span>
              {/* Reliable */}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.5)] animate-pulse"></span>
              {/* Efficient */}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 lg:w-1/3 bg-white flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative shadow-2xl">
        <div className="max-w-md mx-auto w-full">
          {/* Logos */}
          <div className="flex justify-center items-center gap-6 mb-12">
            <img src="/logos/deped-logo.png" alt="DepEd" className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            <div className="h-12 w-px bg-gray-200"></div>
            <img src="/logos/bagong-pilipinas-logo.png" alt="Bagong Pilipinas" className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300" />
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500">Access your account to manage records</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 ml-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-600/30 text-sm font-bold text-white bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-medium">
              &copy; {new Date().getFullYear()} Department of Education<br />Bureau of Learning Resources
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 15s ease infinite;
        }
        
        /* Starry Night Animation */
        @keyframes move-twink-back {
            from {background-position:0 0;}
            to {background-position:-10000px 5000px;}
        }
        @keyframes twinkle {
            from {opacity:0.3;}
            to {opacity:1;}
        }
        .stars, .twinkling {
          position:absolute;
          top:0;
          left:0;
          right:0;
          bottom:0;
          width:100%;
          height:100%;
          display:block;
          mix-blend-mode: screen;
        }
        .stars {
          background:transparent url(https://www.script-tutorials.com/demos/360/images/stars.png) repeat top center;
          z-index:0;
        }
        .twinkling{
          background:transparent url(https://www.script-tutorials.com/demos/360/images/twinkling.png) repeat top center;
          z-index:1;
          animation:move-twink-back 50s linear infinite;
        }
      `}</style>
    </div>
  );
};
