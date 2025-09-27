import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, FileCheck, BarChart3, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './layout.css'; // ✅ Custom CSS file for styling

export const Layout = ({ children, title }) => {
  const { logout } = useAuth(); // make sure your context uses "logout"
  const navigate = useNavigate();

  const handleSignOut = async () => {
    logout();
    navigate('/login');
  };


  return (
    <div className="layout-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/dashboard" className="navbar-brand">
            <Home className="icon" />
            <span>{title}</span>
          </Link>
     




     


          <button onClick={handleSignOut} className="signout-btn">
            <LogOut className="icon" /> Sign Out
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main className="main-content">{children}</main>
    </div>
  );
};
