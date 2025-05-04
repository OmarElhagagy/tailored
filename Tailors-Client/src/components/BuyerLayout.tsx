import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import BuyerNavbar from './BuyerNavbar';
import BuyerSidebar from './BuyerSidebar';

interface BuyerLayoutProps {
  children?: ReactNode;
}

const BuyerLayout: React.FC<BuyerLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-light">
      <BuyerNavbar />
      <div className="container py-4">
        <div className="row">
          <div className="col-md-3">
            <BuyerSidebar />
          </div>
          <div className="col-md-9">
            {children || <Outlet />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerLayout; 