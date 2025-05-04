import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  // Define public and restricted pages
  const publicPages = [
    '/', 
    '/login', 
    '/register', 
    '/products', 
    '/products/[id]', 
    '/sellers', 
    '/sellers/[id]',
    '/seller',
    '/seller/[id]',
    '/seller/[id]/index',
    '/seller/[id]/product',
    '/seller/[id]/product/[productId]',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/help',
    '404'
  ];
  
  const sellerOnlyPages = [
    '/admin',
    '/dashboard/products',
    '/dashboard/orders',
    '/dashboard/sales',
    '/dashboard/analytics',
    '/dashboard/inventory'
  ];
  
  const adminOnlyPages = [
    '/admin/users',
    '/admin/settings'
  ];
  
  // Handle auth validation on client-side
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Get token and user data from localStorage
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token) {
          setAuthenticated(false);
          setUserRole(null);
          
          // If on restricted page, redirect to login
          const pathRequiresAuth = !publicPages.includes(router.pathname);
          if (pathRequiresAuth) {
            router.push({
              pathname: '/login',
              query: { redirect: router.asPath }
            });
          }
        } else {
          try {
            // Parse user data from localStorage
            const user = userData ? JSON.parse(userData) : null;
            setAuthenticated(true);
            setUserRole(user?.role || null);
            
            // Handle role-based access control
            const isSellerPage = sellerOnlyPages.some(page => router.pathname.startsWith(page));
            const isAdminPage = adminOnlyPages.some(page => router.pathname.startsWith(page));
            
            if (isSellerPage && user?.role !== 'seller') {
              router.push('/unauthorized');
            } else if (isAdminPage && user?.role !== 'admin') {
              router.push('/unauthorized');
            }
            
            // Redirect from login/register if already authenticated
            if ((router.pathname === '/login' || router.pathname === '/register') && authenticated) {
              const redirect = router.query.redirect || (user?.role === 'seller' ? '/admin' : '/dashboard');
              router.push(redirect);
            }
          } catch (err) {
            console.error('Error parsing user data:', err);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setAuthenticated(false);
            setUserRole(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router.pathname]);
  
  // Handle route change to redirect old routes to new format
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Check if it's an old format product URL
      const productUrlMatch = url.match(/\/products\/(\d+)/);
      if (productUrlMatch) {
        const productId = productUrlMatch[1];
        
        // This is example data - in a real app, you might need to fetch this information
        const productMappings = {
          "1": { sellerId: "premium-tailors" },
          "2": { sellerId: "fashion-studio" },
          "3": { sellerId: "urban-threads" },
          "4": { sellerId: "elite-tailors" },
          "7": { sellerId: "bridal-elegance" },
          "9": { sellerId: "premium-tailors" },
          "10": { sellerId: "premium-tailors" },
          "11": { sellerId: "fashion-studio" }
        };
        
        const productInfo = productMappings[productId];
        if (productInfo && productInfo.sellerId) {
          // Redirect to new URL format - use push instead of replace to ensure proper navigation
          console.log(`Redirecting to /seller/${productInfo.sellerId}/product/${productId}`);
          router.push(`/seller/${productInfo.sellerId}/product/${productId}`);
          return;
        }
      }
      
      // Check if it's a seller profile URL using the incorrect format
      const sellerUrlMatch = url.match(/^\/seller\/([^\/]+)$/);
      if (sellerUrlMatch) {
        const sellerId = sellerUrlMatch[1];
        console.log(`Redirecting from /seller/${sellerId} to /sellers/${sellerId}`);
        router.push(`/sellers/${sellerId}`);
        return;
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    
    // Clean up event listener
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);
  
  // Apply page props with auth state
  const pagePropsWithAuth = {
    ...pageProps,
    authenticated,
    userRole
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Layout>
      <Component {...pagePropsWithAuth} />
    </Layout>
  );
}

export default MyApp; 