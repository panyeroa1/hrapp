import React, { useState } from 'react';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@eburon.ai' && password === 'Password25') {
        onSuccess();
    } else {
        setError('Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
            <p className="text-gray-400 text-sm mt-1">Authorized Eburon Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input 
                    type="email" 
                    required 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input 
                    type="password" 
                    required 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <button 
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
            >
                Access Portal
            </button>
        </form>
        <button onClick={onBack} className="w-full text-center mt-6 text-gray-500 hover:text-white text-sm">
            &larr; Back to Home
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
