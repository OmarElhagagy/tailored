import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="mb-4">Welcome to the Tailors Platform Admin Dashboard.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h2 className="font-bold text-lg mb-2">Users</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h2 className="font-bold text-lg mb-2">Orders</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h2 className="font-bold text-lg mb-2">Products</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-bold text-lg mb-2">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Manage Users
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              View Orders
            </button>
            <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              Manage Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 