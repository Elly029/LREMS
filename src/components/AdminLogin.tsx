import React, { useState } from 'react';

interface AdminLoginProps {
    onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded admin code for demonstration
        if (code === 'ADMIN123') {
            onLogin();
            setError(false);
        } else {
            setError(true);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md border border-gray-200 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
                    <p className="text-gray-500 mt-2">Enter the admin code to manage evaluations.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="admin-code" className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Code
                        </label>
                        <input
                            id="admin-code"
                            type="password"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                setError(false);
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-300'
                                }`}
                            placeholder="Enter code"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600">
                                Incorrect admin code. Please try again.
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-100 transition-all"
                    >
                        Access Admin Panel
                    </button>
                </form>
            </div>
        </div>
    );
};
