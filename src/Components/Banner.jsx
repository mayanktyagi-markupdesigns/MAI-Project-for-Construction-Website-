import { useState, useEffect, useRef } from "react";
import FollowAuth from "./AuthScreens/FollowAuth";
import MaiEarlyAccessForm from "./AuthScreens/MaiEarlyAccessForm";

const Banner = () => {
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const desktopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);

  useEffect(() => {
    if (showEarlyAccess) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showEarlyAccess]);

  // detect iOS (robust-ish)
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const iOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(!!iOS);
  }, []);

  useEffect(() => {
    if (isIOS) return;

    const setupVideo = (videoElement) => {
      if (!videoElement) return;

      videoElement.setAttribute("playsinline", "");
      videoElement.setAttribute("webkit-playsinline", "");
      videoElement.setAttribute("muted", "");
      videoElement.muted = true;

      const handleLoadedData = () => {
        videoElement.play().catch((err) => {
          console.log("Video autoplay failed:", err);
          setTimeout(() => {
            videoElement.play().catch((e) => console.log("Retry failed:", e));
          }, 100);
        });
        setVideosLoaded(true);
      };

      videoElement.addEventListener("loadeddata", handleLoadedData);
      videoElement.load();

      return () => {
        videoElement.removeEventListener("loadeddata", handleLoadedData);
      };
    };

    const desktopCleanup = setupVideo(desktopVideoRef.current);
    const mobileCleanup = setupVideo(mobileVideoRef.current);

    return () => {
      if (desktopCleanup) desktopCleanup();
      if (mobileCleanup) mobileCleanup();
    };
  }, [isIOS]);

  // User interaction ke baad video play karne ke liye
  const handleUserInteraction = () => {
    if (!isIOS) {
      if (desktopVideoRef.current && desktopVideoRef.current.paused) {
        desktopVideoRef.current.play().catch((e) => console.log(e));
      }
      if (mobileVideoRef.current && mobileVideoRef.current.paused) {
        mobileVideoRef.current.play().catch((e) => console.log(e));
      }
    }
  };

  // Poster image path (aap apna still frame yaha den)
  const posterSrc = "/mai-web/assets/home/fallback.png";

  return (
    <div
      className="relative w-full flex flex-col items-center justify-center bg-white overflow-hidden mb-12"
      onClick={handleUserInteraction}
    >
      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4">
        <div
          className="relative md:-mt-4 w-full"
          style={{ height: "48vh", minHeight: 320, overflow: "hidden" }}
        >
          {/* Desktop SVG */}
          <svg
            viewBox="0 0 1200 300"
            preserveAspectRatio="xMidYMid slice"
            className="hidden md:block w-full h-full"
            role="img"
            aria-label="JUST BUILD animated video text"
          >
            <defs>
              <style>{`
                .bigText {
                  font-weight: 900 !important;
                  font-size: 190px !important;
                  letter-spacing: -10px !important;
                }
              `}</style>
              <clipPath id="text-clip-desktop">
                <text
                  className="bigText"
                  x="50%"
                  y="70%"
                  textAnchor="middle"
                  fontSize="220"
                >
                  JUST BUILD
                </text>
              </clipPath>
            </defs>

            <text
              className="bigText"
              x="50%"
              y="70%"
              textAnchor="middle"
              fontSize="220"
              fill="#e6e6e6"
            >
              JUST BUILD
            </text>

            <g clipPath="url(#text-clip-desktop)">
              <foreignObject x="0" y="0" width="1200" height="300">
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isIOS ? (
                    <img
                      src={posterSrc}
                      alt="JUST BUILD"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        pointerEvents: "none",
                      }}
                    />
                  ) : (
                    <video
                      ref={desktopVideoRef}
                      src="/mai-web/assets/video.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              </foreignObject>
            </g>
          </svg>

          {/* Mobile SVG */}
          <svg
            viewBox="0 0 800 300"
            preserveAspectRatio="xMidYMid slice"
            className="block md:hidden w-full h-full"
            role="img"
            aria-label="JUST BUILD animated video text"
          >
            <defs>
              <style>{`
                .mobileText {
                  font-weight: 900 !important;
                  font-size: 95px !important;
                  letter-spacing: -2px !important;
                }
              `}</style>

              <clipPath id="text-clip-mobile">
                <text
                  className="mobileText"
                  x="50%"
                  y="42%"
                  textAnchor="middle"
                  fontSize="100"
                >
                  JUST
                </text>
                <text
                  className="mobileText"
                  x="50%"
                  y="78%"
                  textAnchor="middle"
                  fontSize="100"
                >
                  BUILD
                </text>
              </clipPath>
            </defs>

            {/* Gray outline text */}
            <text
              className="mobileText"
              x="50%"
              y="42%"
              textAnchor="middle"
              fontSize="100"
              fill="#e6e6e6"
            >
              JUST
            </text>
            <text
              className="mobileText"
              x="50%"
              y="78%"
              textAnchor="middle"
              fontSize="100"
              fill="#e6e6e6"
            >
              BUILD
            </text>

            {/* Video / Image fill inside text */}
            <g clipPath="url(#text-clip-mobile)">
              <foreignObject x="0" y="0" width="800" height="300">
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isIOS ? (
                    <img
                      src={posterSrc}
                      alt="JUST BUILD"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        pointerEvents: "none",
                      }}
                    />
                  ) : (
                    <video
                      ref={mobileVideoRef}
                      src="/mai-web/assets/video.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              </foreignObject>
            </g>
          </svg>

          {/* Subtitle */}
          <p className="text-sm sm:text-xs md:text-xl lg:text-3xl font-futura -mt-10 md:-mt-16 text-[#312F30] px-4">
            With the world's first AI Project Manager For Public Construction
          </p>
        </div>

        {/* Button (popup trigger) */}
        <button
          onClick={() => setShowEarlyAccess(true)}
          className="mt-6 md:mt-8 inline-block cursor-pointer font-futura px-5 py-1.5 bg-gray-800 text-white rounded-full shadow-md hover:bg-gray-900 transition text-sm md:text-base"
        >
          Get Early Access
        </button>
      </div>

      {/* Footer */}
      <div className="mt-20 md:mt-40 bottom-0 font-futura left-0 w-full flex justify-center z-20">
        <p className="text-[#312F30] text-xl md:text-2xl">BUILT FOR WORK</p>
      </div>

      {/* Popup Modal */}
      {showEarlyAccess && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-md"
            onClick={() => setShowEarlyAccess(false)}
          />
          {/* Popup Box */}
          <div className="relative bg-white rounded-3xl max-w-5xl w-full p-4 md:p-6 shadow-2xl max-h-[90vh] overflow-y-auto transform transition ease-out duration-150 z-10">
            {/* Close button */}
            <button
              onClick={() => setShowEarlyAccess(false)}
              className="absolute top-4 right-4 md:right-8 text-gray-600 hover:text-gray-800"
              aria-label="Close early access"
            >
              <img
                src="/mai-web/assets/login/x-mark.png"
                alt="Close"
                className="w-5 h-5"
              />
            </button>

            {/* Early Access Form */}
            <MaiEarlyAccessForm onClose={() => setShowEarlyAccess(false)} />
          </div>
        </div>
      )}

      {/* Mobile Follow Auth */}
      <div className="block md:hidden">
        <FollowAuth />
      </div>
    </div>
  );
};

export default Banner;
