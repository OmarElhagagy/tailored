import React, { useEffect } from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children, title = 'TailorMatch', description = 'Find skilled tailors for custom clothing, repairs, and alterations' }) => {
  // Initialize dark mode if enabled in local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
      if (darkModeEnabled) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <main className="flex-grow pt-16"> {/* Add padding top to account for fixed navbar */}
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default MainLayout; 