import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const StaffLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle staff authentication
    // For this example, we'll just redirect to the staff dashboard
    navigate('/staff/dashboard');
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center" style={{ backgroundImage: 'url(/src/assets/BG.jpg)' }}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-md w-96 relative z-10">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#000765]">Staff Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000765]"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#000765]"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#000765] text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <LogIn className="inline mr-2" size={18} />
            Login as Staff
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          No account? <Link to="/staff/create-account" className="text-[#000765] hover:underline">Create one</Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          Not a staff member? <Link to="/" className="text-[#000765] hover:underline">Go back</Link>
        </p>
      </div>
    </div>
  );
};

export default StaffLoginPage;