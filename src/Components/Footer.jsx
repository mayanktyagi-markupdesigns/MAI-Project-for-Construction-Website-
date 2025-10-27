import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {



  
  return (
    <footer className="bg-gray-100 text-xs border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-4 py-4 sm:py-3">
        
        {/* Left Side */}
        <p className="text-gray-600 text-center sm:text-left mb-3 sm:mb-0">
          ©2025 MAi. All Rights Reserved.
        </p>

        {/* Right Side */}
        <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4 text-gray-600">
          <Link to="/GetTouch" className="hover:text-black transition-colors">Contact Us</Link>
          <Link to="/Privacy" className="hover:text-black transition-colors">Privacy</Link>
          <Link to="/Legal" className="hover:text-black transition-colors">Legal</Link>
          <Link to="/Policy" className="hover:text-black transition-colors">Policy</Link>
          <Link to="/BlogHome" className="hover:text-black transition-colors">Updates</Link>
          <Link to="/BlogHome" className="hover:text-black transition-colors">Worldwide</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
