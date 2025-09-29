import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // TODO: Add login logic here (API call)
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    // On success, redirect to dashboard or home page
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-slate-800 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-slate-900 dark:text-slate-100">Login</h2>
      {error && <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1 font-medium text-slate-700 dark:text-slate-300">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1 font-medium text-slate-700 dark:text-slate-300">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button type="submit" variant="primary" size="md" className="w-full">
          Login
        </Button>
      </form>
      <p className="mt-4 text-center text-slate-700 dark:text-slate-300">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
