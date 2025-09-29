import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-6xl md:text-8xl font-bold text-primary-600 dark:text-primary-400 mb-6">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white mb-4">Page Not Found</h2>
      <p className="text-center text-slate-600 dark:text-slate-400 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button 
        variant="primary"
        size="lg"
        as={Link}
        to="/"
        leftIcon={<Home size={20} />}
      >
        Go Home
      </Button>
    </div>
  );
};

export default NotFoundPage;