import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import MainNavbar from './MainNavbar';

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-light">
      <MainNavbar />
      <div className="container py-4">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default MainLayout; 