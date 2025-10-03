import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components that should load immediately (layout components)
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { ToastProvider } from './components/ui/Toast';

// Lazy load all page components
const HomePage = React.lazy(() => import('./pages/HomePage'));
const HelpPage = React.lazy(() => import('./pages/HelpPage'));
const CardDatabasePage = React.lazy(() => import('./pages/CardDatabasePage'));
const MyDecksPage = React.lazy(() => import('./pages/MyDecksPage'));
const DeckBuilderPage = React.lazy(() => import('./pages/DeckBuilderPage'));
const DeckViewPage = React.lazy(() => import('./pages/DeckViewPage'));
const CardDetailPage = React.lazy(() => import('./pages/CardDetailPage'));
const SetsPage = React.lazy(() => import('./pages/SetsPage'));
const SetDetailPage = React.lazy(() => import('./pages/SetDetailPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const AccountPage = React.lazy(() => import('./pages/AccountPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));
const ToolsPage = React.lazy(() => import('./pages/ToolsPage'));
const SetChecklistPage = React.lazy(() => import('./pages/SetChecklistPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

/**
 * Loading fallback component
 * Displays while lazy-loaded components are being fetched
 */
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-secondary-200 dark:border-secondary-800 border-t-secondary-600 dark:border-t-secondary-400 rounded-full animate-spin"></div>
      <p className="text-slate-600 dark:text-slate-400 text-sm">Loading...</p>
    </div>
  </div>
);

/**
 * React Query client configuration
 * - Infinite staleTime prevents unnecessary refetches
 * - Long cache time for better performance
 * - Disabled automatic refetching for better UX
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false
    },
  },
});

/**
 * Main App component
 * Provides routing, React Query context, toast notifications, and global layout structure
 * Now with lazy loading for improved performance
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Global header navigation */}
            <Header />
            
            {/* Main content area with flex-grow to fill available space */}
            <main className="flex-grow">
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/cards" element={<CardDatabasePage />} />
                  <Route path="/cards/:id" element={<CardDetailPage />} />
                  <Route path="/sets" element={<SetsPage />} />
                  <Route path="/sets/:id" element={<SetDetailPage />} />
                  
                  {/* Tools routes */}
                  <Route path="/tools" element={<ToolsPage />} />
                  <Route path="/tools/set-checklist" element={<SetChecklistPage />} />
                  
                  {/* Deck management routes */}
                  <Route path="/decks" element={<MyDecksPage />} />
                  <Route path="/decks/builder" element={<DeckBuilderPage />} />
                  <Route path="/decks/:id" element={<DeckViewPage />} />
                  
                  {/* User account routes */}
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Catch-all route for 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </main>
            
            {/* Global footer */}
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;