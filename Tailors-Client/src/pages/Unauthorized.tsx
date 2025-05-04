import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              <h1 className="display-4 text-danger mb-4">Access Denied</h1>
              <div className="mb-4">
                <i className="fas fa-lock fa-5x text-danger"></i>
              </div>
              <p className="lead mb-4">
                You don't have permission to access this page.
              </p>
              
              {user ? (
                <div>
                  <p>
                    Your current role is: <strong>{user.role}</strong>
                  </p>
                  <div className="mt-4">
                    <Link to={user.role === 'seller' ? '/seller/dashboard' : '/dashboard'} className="btn btn-primary me-3">
                      Go to Dashboard
                    </Link>
                    <Link to="/" className="btn btn-outline-secondary">
                      Go Home
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <Link to="/login" className="btn btn-primary me-3">
                    Login
                  </Link>
                  <Link to="/" className="btn btn-outline-secondary">
                    Go Home
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 