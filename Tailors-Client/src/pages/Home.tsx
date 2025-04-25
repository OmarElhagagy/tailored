import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Tailors Platform</h1>
          <div className="flex space-x-4">
            {isAuthenticated ? (
              <Link 
                to="/dashboard" 
                className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Tailors Platform</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Connect with Skilled Tailors
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Find the perfect tailor for your needs, manage orders, and get custom-tailored clothing.
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 rounded-md bg-blue-500 text-white flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Find Skilled Tailors</h3>
              <p className="mt-2 text-gray-600">
                Browse profiles of skilled tailors in your area, read reviews, and find the perfect match for your project.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 rounded-md bg-blue-500 text-white flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Order Management</h3>
              <p className="mt-2 text-gray-600">
                Easily place orders, track progress, and communicate with your tailor throughout the process.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="w-12 h-12 rounded-md bg-blue-500 text-white flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.5 20.25h-3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h3.375c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Custom Designs</h3>
              <p className="mt-2 text-gray-600">
                Share your design ideas and collaborate with tailors to create the perfect custom garment.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link 
              to={isAuthenticated ? "/dashboard" : "/register"} 
              className="px-6 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 inline-block"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Today"}
            </Link>
          </div>
        </div>
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
                  <li><a href="#" className="text-gray-300 hover:text-white">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Legal</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Cookie Policy</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Company</h3>
                <ul className="mt-4 space-y-2">
                  <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Careers</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Blog</a></li>
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
};

export default Home; 