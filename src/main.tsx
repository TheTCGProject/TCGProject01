import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * Application entry point
 * Renders the main App component to the DOM
 */

// Get root element and ensure it exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

/**
 * Render without StrictMode to prevent double renders in development
 * StrictMode can cause issues with some third-party libraries
 * and double-execution of effects during development
 */
root.render(<App />);