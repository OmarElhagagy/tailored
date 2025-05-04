import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Check for token and user data when component mounts and route changes
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          const userObj = JSON.parse(storedUser);
          setUser(userObj);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for storage events (for multi-tab logout)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [router.asPath]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-blue-600">Tailors</span>
                <span className="ml-1">Platform</span>
              </Link>
              
              <nav className="hidden md:flex ml-10 space-x-8">
                <Link href="/products" className={`px-3 py-2 text-sm font-medium ${router.pathname === '/products' || router.pathname.startsWith('/products/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                  Products
                </Link>
                <Link href="/sellers" className={`px-3 py-2 text-sm font-medium ${router.pathname === '/sellers' || router.pathname.startsWith('/sellers/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                  Find Tailors
                </Link>
                {user && (
                  <Link href="/cart" className={`px-3 py-2 text-sm font-medium ${router.pathname === '/cart' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                    Cart
                  </Link>
                )}
              </nav>
            </div>
            
            <div className="flex items-center">
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 rounded-full border border-gray-300 p-1 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">{user.name?.charAt(0) || user.email?.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.name || user.email?.split('@')[0]}
                    </span>
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-700">
                            Signed in as
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.email}
                          </p>
                          <p className="text-xs font-medium text-blue-600 mt-1">
                            {user.role === 'seller' ? 'Seller Account' : 'Buyer Account'}
                          </p>
                        </div>
                        <Link 
                          href="/dashboard" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          {user.role === 'seller' ? 'Seller Dashboard' : 'My Dashboard'}
                        </Link>
                        {user.role === 'seller' && (
                          <Link 
                            href="/dashboard/products" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Manage Products
                          </Link>
                        )}
                        <Link 
                          href="/dashboard/orders" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          {user.role === 'seller' ? 'Manage Orders' : 'My Orders'}
                        </Link>
                        <Link 
                          href="/dashboard/profile" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/login" className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition">
                    Sign In
                  </Link>
                  <Link href="/register" className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                    Register
                  </Link>
                </div>
              )}
              
              {/* Mobile menu button */}
              <button className="md:hidden ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Banner for navigation context if in dashboard or other admin sections */}
        {router.pathname.startsWith('/dashboard') && (
          <div className="bg-blue-50 border-t border-b border-blue-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-blue-800">
                  {user?.role === 'seller' ? 'Seller Dashboard' : 'Buyer Dashboard'}
                </span>
                <span className="mx-2 text-blue-300">/</span>
                <span className="text-sm text-blue-600">
                  {router.pathname === '/dashboard' ? 'Overview' : 
                   router.pathname === '/dashboard/products' ? 'Products' : 
                   router.pathname === '/dashboard/orders' ? 'Orders' : 
                   router.pathname === '/dashboard/profile' ? 'Profile' : ''}
                </span>
              </div>
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                <span>Back to Website</span>
                <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        )}
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
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Shop</h3>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/products" className="text-gray-300 hover:text-white">Products</Link></li>
                  <li><Link href="/sellers" className="text-gray-300 hover:text-white">Find Tailors</Link></li>
                  {user?.role === 'seller' && (
                    <li><Link href="/dashboard" className="text-gray-300 hover:text-white">Seller Dashboard</Link></li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Support</h3>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/help" className="text-gray-300 hover:text-white">Help Center</Link></li>
                  <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact Us</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Legal</h3>
                <ul className="mt-4 space-y-2">
                  <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
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