import React from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const FollowAuth = () => {
  return (
    <div className="fixed bottom-12 right-18 flex items-center z-20">
      <span className="text-gray-400 font-futura text-sm whitespace-nowrap mr-4">
        FOLLOW US ON
      </span>
      {/* Horizontal Line */}
      <div className="w-16 h-px bg-gray-400 mx-4" />
      <div className="flex items-center space-x-2">
        <Link
          to="#"
          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
        >
          <Facebook size={16} />
        </Link>
        <Link
          to="#"
          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
        >
          <Instagram size={16} />
        </Link>
        <Link
          to="#"
          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
        >
          <Twitter size={16} />
        </Link>
      </div>
    </div>
  );
};

export default FollowAuth;
