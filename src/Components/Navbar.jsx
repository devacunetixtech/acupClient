import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ onLogout, onToggleSidebar }) => {
  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center">
      <h2 className="text-2xl font-bold text-foreground">My App</h2>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={onLogout}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;