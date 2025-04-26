import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is logged in on initial load and route changes
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
    
    // Listen for storage events (for multi-tab logout)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router.asPath]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold text-gray-900">Tailors Platform</a>
          </Link>
          <div className="flex space-x-4">
            <Link href="/products">
              <a className="px-4 py-2 text-gray-700 font-medium hover:underline">Products</a>
            </Link>
            <Link href="/sellers">
              <a className="px-4 py-2 text-gray-700 font-medium hover:underline">Find Tailors</a>
            </Link>
            {!loading && user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'buyer' && (
                  <Link href="/cart">
                    <a className="px-4 py-2 text-gray-700 font-medium hover:underline flex items-center">
                      <span>Cart</span>
                      <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        2
                      </span>
                    </a>
                  </Link>
                )}
                <div className="relative">
                  <div className="flex items-center">
                    <Link href={user.role === 'seller' ? '/admin' : '/dashboard'}>
                      <a className="flex items-center">
                        <span className="inline-flex h-8 w-8 rounded-full bg-gray-500 items-center justify-center">
                          <span className="text-sm font-medium leading-none text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </span>
                        <span className="ml-2 text-gray-700">{user.name}</span>
                      </a>
                    </Link>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login">
                  <a className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">Sign In</a>
                </Link>
                <Link href="/register">
                  <a className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">Register</a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold">Tailors Platform</h3>
              <p className="mt-2 text-gray-400">Connecting tailors and clients seamlessly.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Support</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white">Help Center</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Contact Us</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Legal</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Tailors Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 