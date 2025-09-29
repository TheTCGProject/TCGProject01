import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Link } from 'react-router-dom';
import { User, Heart } from 'lucide-react';

/**
 * Account dropdown component props interface
 */
interface AccountDropdownProps {
  /** Whether the user is currently logged in */
  isLoggedIn: boolean;
}

/**
 * Account dropdown component
 * Provides navigation to user account features
 */
const AccountDropdown: React.FC<AccountDropdownProps> = ({ isLoggedIn }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="text-slate-600 dark:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          aria-label="Account menu"
        >
          <User size={20} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="min-w-[180px] bg-white dark:bg-slate-800 shadow-lg rounded-md p-2 mt-2 border border-slate-200 dark:border-slate-700">
        {isLoggedIn ? (
          <>
            <DropdownMenu.Item asChild>
              <Link 
                to="/account" 
                className="flex items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
              >
                <User size={16} className="mr-2" />
                Account
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link 
                to="/wishlist" 
                className="flex items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
              >
                <Heart size={16} className="mr-2" />
                Wishlist
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="h-px bg-slate-200 dark:bg-slate-600 my-1" />
            <DropdownMenu.Item asChild>
              <Link 
                to="/logout" 
                className="flex items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
              >
                Log out
              </Link>
            </DropdownMenu.Item>
          </>
        ) : (
          <>
            <DropdownMenu.Item asChild>
              <Link 
                to="/login" 
                className="flex items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
              >
                Login
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link 
                to="/register" 
                className="flex items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
              >
                Register
              </Link>
            </DropdownMenu.Item>
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default AccountDropdown;