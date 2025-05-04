import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Unauthorized({ userRole }) {
  const router = useRouter();

  const handleGoToDashboard = () => {
    if (userRole === 'seller') {
      router.push('/admin');
    } else if (userRole === 'buyer') {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <div className="mb-6 text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-4a8 8 0 11-16 0 8 8 0 0116 0z"
              />
            </svg>
          </div>
          <p className="text-gray-700 mb-6">
            You don't have permission to access this page.
          </p>
          
          {userRole ? (
            <div>
              <p className="text-gray-600 mb-4">
                Your current role is: <span className="font-semibold">{userRole}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGoToDashboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Go to Dashboard
                </button>
                <Link href="/" legacyBehavior>
                  <a className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
                    Go Home
                  </a>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" legacyBehavior>
                <a className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  Login
                </a>
              </Link>
              <Link href="/" legacyBehavior>
                <a className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
                  Go Home
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 