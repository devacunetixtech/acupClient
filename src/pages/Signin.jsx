import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/Authcontext';
import { Eye, EyeOff, Mail, Lock, Zap } from 'lucide-react';

const SignIn = () => {
    const { loginUser, loginInfo, updateLoginInfo, loginError, isLoginLoading } = useContext(AuthContext) || {};
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated blobs */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            
            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
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
            `}</style>

            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 border border-cyan-200">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:rotate-6 transition-transform">
                        <Zap className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Welcome Back</h1>
                    <p className="text-gray-600 mt-2">Sign in to ACUPAY</p>
                </div>

                <form onSubmit={loginUser} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500 group-focus-within:scale-110 transition-transform" />
                            <input
                                type="email"
                                placeholder="john@example.com"
                                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
                                required
                                onChange={(e) => updateLoginInfo({ ...loginInfo, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500 group-focus-within:scale-110 transition-transform" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all bg-white"
                                required
                                onChange={(e) => updateLoginInfo({ ...loginInfo, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-transform"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer group">
                            <input type="checkbox" id="checkbox" className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500 cursor-pointer" />
                            <label htmlFor="checkbox" className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 cursor-pointer">Remember me</label>
                        </label>
                        <a href="#" className="text-sm text-cyan-600 font-semibold hover:underline">
                            Forgot Password?
                        </a>
                    </div>

                    {loginError?.error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                            {loginError?.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoginLoading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoginLoading ? (
                            <span className="flex items-center justify-center space-x-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Signing in...</span>
                            </span>
                        ) : "Sign In"}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-600">
                    Don't have an account?{' '}
                    <Link to='/signup' className="text-cyan-600 font-bold hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default SignIn;