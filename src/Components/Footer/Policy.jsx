import React, { useState } from "react";
import { X } from "lucide-react";

export default function Policy() {
  const [showPopup, setShowPopup] = useState(true);

  const handleAccept = () => {
    setShowPopup(false);
    document.cookie = "termsAccepted=true; max-age=31536000; path=/";
  };

  const handleDecline = () => {
    setShowPopup(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f1eb]">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-6 ">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Terms Title at Top */}
          <h1 className=" flex text-2xl justify-center items-center font-blod text-sky-600 mb-2">
          Policy
          </h1>

          {/* Last Updated */}
          <p className="text-sky-600 text-sm mb-8">
            Last updated: Feb 21th 2019
          </p>

          {/* Content */}
          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
              sed bibendum dolor, non condimentum diam. Sed non odio placerat,
              tempus erat id, hendrerit justo. Morbi orci dui, facilisis nec
              consectetur maximus, semper at leo. Nunc vel efficitur ipsum, at
              commodo erat. In eu condimentum enim. Nulla nisl leo, mattis in
              iaculis ac, tristique non felis.
            </p>

            <p>
              Cras ornare, arcu ut molestie vehicula, nisl tortor tempor eros,
              id eleifend velit leo ac sem. Suspendisse potenti. Maecenas quis
              arcu nunc.
            </p>

            <h3 className="text-gray-600 font-medium pt-4">Sed a enim diam</h3>

            <p>
              Morbi vestibulum consectetur metus, at lacinia ipsum ullamcorper
              sit amet. In interdum risus in sagittis consectetur. Ut
              sollicitudin congue mauris, quis vulputate metus accumsan et. Nunc
              ut tortor magna. Sed a enim diam. Suspendisse fringilla quam vitae
              sollicitudin rhoncus. Maecenas eu dignissim neque. Proin eu dolor
              purus. Class aptent taciti sociosqu ad litora torquent.
            </p>

            <h3 className="text-gray-600 font-medium pt-4">Morbi orci dui</h3>

            <p>
              Ut at tellus ac sapien tincidunt mattis interdum et elit. Sed ac
              tempor risus, at volutpat nunc. Pellentesque venenatis, arcu a
              hendrerit volutpat, ligula est condimentum magna, non varius
              tellus mi eu urna. Donec vel fringilla urna. Vestibulum lobortis
              elit in posuere fermentum. Vestibulum.
            </p>
          </div>
        </div>
      </main>

      {/* Cookie Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={handleDecline}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Policy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We use cookies to enhance your browsing experience and analyze
                our traffic. By clicking "Accept", you consent to our use of
                cookies.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Accept
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 bg-white hover:bg-gray-50 text-sky-600 font-medium py-3 px-6 rounded-xl border-2 border-sky-600 transition-all duration-200 transform hover:scale-105"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
