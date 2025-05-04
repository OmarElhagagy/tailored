import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import SellerNavbar from './SellerNavbar';
import SellerSidebar from './SellerSidebar';

interface SellerLayoutProps {
  children?: ReactNode;
}

const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-light">
      <SellerNavbar />
      <div className="container py-4">
        <div className="row">
          <div className="col-md-3">
            <SellerSidebar />
          </div>
          <div className="col-md-9">
            {children || <Outlet />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerLayout; 