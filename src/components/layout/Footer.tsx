import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Disc as Discord, Sparkles } from 'lucide-react';

/**
 * Modern Footer component with refined styling
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Card Database', href: '/cards' },
        { name: 'Deck Builder', href: '/decks/builder' },
        { name: 'Collection Tracker', href: '/account' },
        { name: 'Tools', href: '/tools' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'API Documentation', href: '#' },
        { name: 'Community', href: '#' },
        { name: 'Blog', href: '#' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '#' },
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Contact', href: '#' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'Discord', icon: Discord, href: 'https://discord.com' },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-secondary-600 to-secondary-700 bg-clip-text text-transparent">
                PokeNexus
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md leading-relaxed">
              The ultimate platform for Pokémon TCG enthusiasts. Build decks, track collections, 
              and connect with the community.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 hover:border-secondary-300 dark:hover:border-secondary-600 transition-all duration-200 hover:shadow-md"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 dark:text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} PokeNexus. All rights reserved.
            </div>
            
            {/* Legal Disclaimers */}
            <div className="text-xs text-gray-500 dark:text-gray-500 text-center md:text-right max-w-md">
              Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME FREAK Inc. 
              This site is not affiliated with, sponsored by, or endorsed by Nintendo or The Pokémon Company International.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;