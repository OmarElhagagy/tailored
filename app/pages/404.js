import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Custom404() {
  const router = useRouter();
  const [redirectPath, setRedirectPath] = useState(null);
  
  useEffect(() => {
    // Check if this is a seller path that should be fixed
    const path = router.asPath;
    const sellerMatch = path.match(/^\/seller\/([^\/]+)$/);
    
    if (sellerMatch) {
      const sellerId = sellerMatch[1];
      setRedirectPath(`/sellers/${sellerId}`);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      {redirectPath && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 mb-2">
            Did you mean to visit:
          </p>
          <Link 
            href={redirectPath} 
            legacyBehavior
          >
            <a className="text-blue-600 font-medium hover:underline">{redirectPath}</a>
          </Link>
        </div>
      )}
      
      <div className="flex space-x-4">
        <Link href="/" legacyBehavior>
          <a className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Go Home</a>
        </Link>
        <Link href="/sellers" legacyBehavior>
          <a className="hover:underline">Browse Products</a>
        </Link>
      </div>
      <div className="space-y-3">
        <p className="text-sm text-gray-500 mt-6">Here are some helpful links instead:</p>
        <ul className="space-y-2 text-blue-600">
          <li>
            <Link href="/sellers" legacyBehavior>
              <a className="hover:underline">Browse Products</a>
            </Link>
          </li>
          <li>
            <Link href="/sellers" legacyBehavior>
              <a className="hover:underline">Find Tailors</a>
            </Link>
          </li>
          <li>
            <Link href="/contact" legacyBehavior>
              <a className="hover:underline">Contact Us</a>
            </Link>
          </li>
          <li>
            <Link href="/help" legacyBehavior>
              <a className="hover:underline">Help Center</a>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
} 