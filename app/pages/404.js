import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-6">The page you are looking for does not exist or has been moved.</p>
      <div className="space-y-3">
        <div className="text-center">
          <Link href="/" className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
            Return to Home
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-6">Here are some helpful links instead:</p>
        <ul className="space-y-2 text-blue-600">
          <li>
            <Link href="/products" className="hover:underline">
              Browse Products
            </Link>
          </li>
          <li>
            <Link href="/sellers" className="hover:underline">
              Find Tailors
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:underline">
              Contact Us
            </Link>
          </li>
          <li>
            <Link href="/help" className="hover:underline">
              Help Center
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
} 