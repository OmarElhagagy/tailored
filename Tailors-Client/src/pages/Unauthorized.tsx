import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="unauthorized-page">
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You don't have permission to access this page.</p>
        <div className="flex justify-center gap-4">
          <Link
            to="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Home
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 