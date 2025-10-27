import React from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const FollowUsOn = () => {
  return (
    <div>
      {" "}
      {/* Social Icons */}
      <div className="absolute right-20 mt-46 top-1/2 transform -translate-y-1/2 flex flex-col items-center z-20">
        <span className="text-gray-400 font-futura text-sm rotate-90 whitespace-nowrap mb-8">
          FOLLOW US ON
        </span>
        <div className="h-16 w-px bg-gray-400 mb-2 mt-4" />
        <Link
          to="#"
          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition mb-2"
        >
          <Facebook size={16} />
        </Link>
        <Link
          to="#"
          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition mb-2"
        >
          <Instagram size={16} />
        </Link>
        <Link
          to="#"
          className="flex items-center justify-center w-6 h-6  rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
        >
          <Twitter size={16} />
        </Link>
      </div>
    </div>
  );
};

export default FollowUsOn;
