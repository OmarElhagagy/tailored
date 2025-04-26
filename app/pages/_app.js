import '../styles/globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // Handle client-side auth validation and redirects
  useEffect(() => {
    // Public pages that don't require authentication
    const publicPages = ['/', '/login', '/register', '/products', '/products/[id]', '/sellers', '/sellers/[id]'];
    const authPages = ['/login', '/register'];
    
    // Check if the current page requires authentication
    const requiresAuth = !publicPages.includes(router.pathname);
    
    // Get authentication token from localStorage
    const token = localStorage.getItem('token');
    
    // If page requires auth and user is not logged in, redirect to login
    if (requiresAuth && !token) {
      router.push({
        pathname: '/login',
        query: { redirect: router.asPath }
      });
    }
    
    // If user is logged in and tries to access login/register pages, redirect to dashboard
    if (token && authPages.includes(router.pathname)) {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role) {
          router.push(user.role === 'seller' ? '/admin' : '/dashboard');
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, [router]);
  
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp; 