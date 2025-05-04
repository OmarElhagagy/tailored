import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css'; // We'll create this file next

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f0' }}>
      <header style={{ 
        background: 'linear-gradient(to right, #ff8c00, #3a8f8f)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tailoring-thread">Tailors Platform</h1>
          <div className="flex space-x-4">
            {isAuthenticated ? (
              <Link 
                to="/dashboard" 
                className="px-4 py-2 rounded-md bg-white text-primary font-medium hover:bg-gray-100 hover:shadow-md transition-all duration-300 tailoring-button"
                style={{ color: '#ff8c00' }}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-md border border-white text-white font-medium hover:bg-white hover:bg-opacity-10 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded-md bg-white font-medium hover:bg-gray-100 hover:shadow-md transition-all duration-300 tailoring-button"
                  style={{ color: '#ff8c00' }}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main>
        <div style={{ 
          background: 'linear-gradient(to right, #ff8c00, #e61e78)',
          position: 'relative',
          padding: '4rem 0' 
        }} className="tailoring-fabric">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold text-white tailoring-thread">
                The Art of Perfect Fit
              </h1>
              <p className="mt-6 text-xl text-white opacity-90">
                Connect with skilled tailors for personalized, custom-made clothing that makes you look and feel amazing.
              </p>
              <div className="mt-10 tailoring-stitch">
                <Link 
                  to={isAuthenticated ? "/dashboard" : "/explore"} 
                  className="inline-block px-6 py-3 rounded-md bg-white font-medium hover:bg-gray-100 hover:shadow-lg transition-all duration-300 tailoring-button"
                  style={{ color: '#ff8c00' }}
                >
                  {isAuthenticated ? "Go to Dashboard" : "Browse Tailors"}
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="ml-4 inline-block px-6 py-3 rounded-md font-medium hover:bg-opacity-90 hover:shadow-lg transition-all duration-300 tailoring-button"
                  style={{ backgroundColor: '#3a8f8f', color: 'white' }}
                >
                  How It Works
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#3d2e20' }}>How Our Platform Works</h2>
            <p className="mt-4 text-xl max-w-3xl mx-auto" style={{ color: '#7d6e5c' }}>
              We connect you with skilled tailors to create custom clothing that fits perfectly and reflects your unique style.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow transition-all duration-300 hover:shadow-lg tailoring-card">
              <div className="w-12 h-12 rounded-md text-white flex items-center justify-center mb-4" style={{ backgroundColor: '#ff8c00' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium" style={{ color: '#3d2e20' }}>Browse & Choose</h3>
              <p className="mt-2" style={{ color: '#7d6e5c' }}>
                Explore profiles of professional tailors, view their work, and select the perfect match for your needs.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow transition-all duration-300 hover:shadow-lg tailoring-card">
              <div className="w-12 h-12 rounded-md text-white flex items-center justify-center mb-4" style={{ backgroundColor: '#e61e78' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium" style={{ color: '#3d2e20' }}>Collaborate</h3>
              <p className="mt-2" style={{ color: '#7d6e5c' }}>
                Discuss your requirements, share ideas, and receive professional advice directly from your chosen tailor.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow transition-all duration-300 hover:shadow-lg tailoring-card">
              <div className="w-12 h-12 rounded-md text-white flex items-center justify-center mb-4" style={{ backgroundColor: '#3a8f8f' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.5 20.25h-3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h3.375c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium" style={{ color: '#3d2e20' }}>Custom Designs</h3>
              <p className="mt-2" style={{ color: '#7d6e5c' }}>
                Share your design ideas and collaborate with tailors to create the perfect custom garment.
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link 
              to={isAuthenticated ? "/dashboard" : "/register"} 
              className="px-6 py-3 rounded-md text-white font-medium hover:shadow-lg transition-all duration-300 tailoring-button"
              style={{ backgroundColor: '#ff8c00' }}
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Today"}
            </Link>
          </div>
        </div>
      </main>
      
      <footer style={{ backgroundColor: '#3d2e20' }} className="text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Tailors</h3>
              <p className="text-gray-400">
                Connecting skilled tailors with customers worldwide, revolutionizing the way custom clothing is created.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link to="/explore" className="text-gray-400 hover:text-white">Find Tailors</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQs</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Connect With Us</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
              <p className="text-gray-400">
                Subscribe to our newsletter for updates
              </p>
            </div>
          </div>
          
          <div style={{ borderTopColor: 'rgba(255,255,255,0.1)' }} className="border-t mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Tailors. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 