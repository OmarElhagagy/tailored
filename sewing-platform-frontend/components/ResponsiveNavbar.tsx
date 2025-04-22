import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useResponsive from '../src/hooks/useResponsive';
import { useAuth } from '../src/contexts/AuthContext';

interface NavLink {
  label: string;
  href: string;
  requiresAuth?: boolean;
  roles?: string[];
}

interface NavbarProps {
  isLoggedIn: boolean;
  userRole?: string;
  userName?: string;
}

const ResponsiveNavbar: React.FC<NavbarProps> = ({ 
  isLoggedIn = false, 
  userRole = '', 
  userName = '' 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile } = useResponsive();
  const router = useRouter();
  const { logout } = useAuth();

  // Close menu when route changes or screen resizes from mobile to desktop
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router, isMobile]);

  // Define navigation links
  const navLinks: NavLink[] = [
    { label: 'Home', href: '/' },
    { label: 'Listings', href: '/listings' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard', requiresAuth: true },
    { label: 'Messages', href: '/messages', requiresAuth: true },
    { label: 'Orders', href: '/orders', requiresAuth: true },
    { label: 'Profile', href: '/profile', requiresAuth: true },
    { label: 'Inventory', href: '/inventory', requiresAuth: true, roles: ['seller'] },
    { label: 'Add Listing', href: '/add-listing', requiresAuth: true, roles: ['seller'] },
    { label: 'Admin', href: '/admin', requiresAuth: true, roles: ['admin'] },
  ];

  // Filter links based on auth status and role
  const filteredLinks = navLinks.filter(link => {
    if (link.requiresAuth && !isLoggedIn) return false;
    if (link.roles && !link.roles.includes(userRole)) return false;
    return true;
  });

  const handleLogout = async () => {
    try {
      await logout();
      // Router navigation is handled inside the logout function
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="shrink-0 flex items-center">
              <Link href="/" className="font-bold text-xl">
                Tailors
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4 md:items-center">
              {filteredLinks.slice(0, 5).map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  {link.label}
                </Link>
              ))}
              
              {/* More dropdown for desktop if needed */}
              {filteredLinks.length > 5 && (
                <div className="relative group">
                  <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
                    More
                  </button>
                  <div className="hidden group-hover:block absolute z-10 right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {filteredLinks.slice(5).map((link) => (
                        <Link 
                          key={link.href}
                          href={link.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Auth buttons */}
          <div className="hidden md:flex md:items-center md:ml-6">
            {isLoggedIn ? (
              <div className="flex items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300 mr-4">
                  Hi, {userName || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center px-5">
            {isLoggedIn ? (
              <div className="flex flex-col w-full">
                <span className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Hi, {userName || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="w-full text-center px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col w-full space-y-2">
                <Link
                  href="/login"
                  className="w-full text-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="w-full text-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ResponsiveNavbar; 