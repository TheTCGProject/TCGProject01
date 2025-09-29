import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Moon, Sun, PlusCircle, User, ChevronDown, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { useDeckStore } from '../../stores/deckStore';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import AccountDropdown from './AccountDropdown'; 

/**
 * Navigation items for the mega menu
 */
const navItems = [
  {
    name: 'Cards',
    path: '/cards',
    summary: 'Browse all Pokémon cards with advanced filtering and search.',
    icon: '🃏',
  },
  {
    name: 'Sets',
    path: '/sets',
    summary: 'Explore every set from Base Set to modern expansions.',
    icon: '📚',
  },
  {
    name: 'Decks',
    path: '/decks',
    summary: 'Create, manage, and analyze your custom Pokémon decks.',
    icon: '🎯',
  },
  {
    name: 'Tools',
    path: '/tools',
    summary: 'Powerful tools for deck analysis and collection management.',
    icon: '🛠️',
  },
];

/**
 * Modern Header component with refined aesthetics
 */
const Header = () => {
  // Theme management state
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  
  // Mobile menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Mega menu state and timeout management
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const hideMenuTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const location = useLocation();
  const { createDeck } = useDeckStore();

  // Mock authentication state
  const isLoggedIn = true;

  /**
   * Handle mega menu interactions
   */
  const handleMegaMenuMouseEnter = () => {
    if (hideMenuTimeout.current) {
      clearTimeout(hideMenuTimeout.current);
    }
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuMouseLeave = () => {
    hideMenuTimeout.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 300);
  };

  /**
   * Apply theme changes
   */
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  /**
   * Create a new deck
   */
  const handleCreateDeck = () => {
    const newDeckId = createDeck({
      name: 'New Deck',
      description: '',
      format: 'standard',
      cards: [],
      isPublic: false,
    });
    window.location.href = `/decks/builder?id=${newDeckId}`;
  };
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text text-transparent">
              PokeNexus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 relative">
            {/* Home Link */}
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                isActive('/') && location.pathname === '/'
                  ? 'text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-secondary-600 dark:hover:text-secondary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              Home
            </Link>

            {/* Explore Mega Menu */}
            <div
              className="relative"
              onMouseEnter={handleMegaMenuMouseEnter}
              onMouseLeave={handleMegaMenuMouseLeave}
            >
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-secondary-600 dark:hover:text-secondary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 font-medium focus:outline-none"
                aria-haspopup="true"
                aria-expanded={isMegaMenuOpen}
              >
                <span>Explore</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Mega Menu Dropdown */}
              {isMegaMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-[720px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden">
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`block p-4 rounded-xl transition-all duration-200 group hover:bg-gray-50 dark:hover:bg-gray-800/50
                          ${location.pathname.startsWith(item.path)
                            ? 'bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800'
                            : ''
                          }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                              {item.summary}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Help Link */}
            <Link
              to="/help"
              className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                isActive('/help')
                  ? 'text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/20'
                  : 'text-gray-600 dark:text-gray-300 hover:text-secondary-600 dark:hover:text-secondary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              Help
            </Link>
          </nav>
   
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">          
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            {/* Create Deck Button */}
            <Button 
              variant="primary" 
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={handleCreateDeck}
              className="shadow-lg hover:shadow-xl"
            >
              New Deck
            </Button>
            
            {/* Account Dropdown */}
            <AccountDropdown isLoggedIn={isLoggedIn} />

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 py-2 md:hidden">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-200 ${
                      isActive(item.path) 
                        ? 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 font-medium' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.summary}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;