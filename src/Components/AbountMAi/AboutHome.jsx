import { useEffect, useState } from "react";
import AboutWhat from "./AboutWhat";
import AboutValues from "./AboutValues";
import {
  fetchWhoContent,
  fetchWhyContent,
  fetchVisionContent,
} from "../../apiServices";

const AboutHome = () => {
  const [activeTab, setActiveTab] = useState("WHO");
  const [whoHtml, setWhoHtml] = useState(null);
  const [whoLoading, setWhoLoading] = useState(false);
  const [whoError, setWhoError] = useState(null);

  const [whyHtml, setWhyHtml] = useState(null);
  const [whyLoading, setWhyLoading] = useState(false);
  const [whyError, setWhyError] = useState(null);

  const [visionHtml, setVisionHtml] = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionError, setVisionError] = useState(null);

  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadAllContent = async () => {
      try {
        setWhoLoading(true);
        setWhyLoading(true);
        setVisionLoading(true);
        setWhoError(null);
        setWhyError(null);
        setVisionError(null);

        const [whoContent, whyContent, visionContent] = await Promise.all([
          fetchWhoContent(),
          fetchWhyContent(),
          fetchVisionContent(),
        ]);

        if (mounted) {
          setWhoHtml(whoContent);
          setWhyHtml(whyContent);
          setVisionHtml(visionContent);
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err.message || "Failed to load content";
          setWhoError(errorMessage);
          setWhyError(errorMessage);
          setVisionError(errorMessage);
        }
      } finally {
        if (mounted) {
          setWhoLoading(false);
          setWhyLoading(false);
          setVisionLoading(false);
        }
      }
    };

    loadAllContent();

    return () => {
      mounted = false;
    };
  }, []);

  // Animation trigger useEffect
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const headings = {
    WHO: (
      <>
        BUILT BY <span className="text-[#312F30]">BUILDERS</span>
      </>
    ),
    WHAT: (
      <>
        BUILT BY <span className="text-[#312F30]">BUILDERS</span>
      </>
    ),
    WHY: (
      <>
        WHY <span className="text-[#312F30]">MODRN</span>
      </>
    ),
    VISION: (
      <>
        OUR <span className="text-[#312F30]">VISION</span>
      </>
    ),
    VALUES: (
      <>
        OUR <span className="text-[#312F30]">VALUES</span>
      </>
    ),
  };

  const renderApiHtml = (html, loading, error) => {
    if (loading) {
      return (
        <div className="py-8 text-center">
          <div className="inline-block w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
          <div className="mt-3 text-sm text-gray-600">Loading...</div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="py-8 text-center text-red-500">
          Could not load content. {error}
        </div>
      );
    }
    if (html) {
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    return (
      <>
        <p>
          We are <strong>BUILDERS FIRST.</strong> Before founding MODRN, we
          worked on the client side of public construction, navigating the same
          challenges contractors, project managers, and administrators face
          every day. From mentor programs to complex agency projects, we saw
          first-hand how paperwork, compliance, and inefficiencies slowed down
          good work and overwhelmed small and minority-owned firms.
        </p>
        <p className="mt-4">
          That experience shaped us. We founded MODRN to bring clarity,
          structure, and support to the construction process. Today, we're
          expanding that mission with MAi — an AI-powered project management
          tool built for the people actually doing the work.
        </p>
      </>
    );
  };

  const tabContent = {
    WHO: renderApiHtml(whoHtml, whoLoading, whoError),
    WHAT: <AboutWhat />,
    WHY: renderApiHtml(whyHtml, whyLoading, whyError),
    VISION: renderApiHtml(visionHtml, visionLoading, visionError),
    VALUES: <AboutValues />,
  };

  const tabs = ["WHO", "WHAT", "WHY", "VISION", "VALUES"];

  return (
    <div className="w-full flex flex-col items-center py-8 px-6">
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
          
        .animate-marquee-active {
          animation: marquee 80s linear infinite;
        }
      `}</style>

      {/* Heading */}
      <div className="relative w-full max-w-6xl">
        {headings[activeTab] && (
          <h2 className="text-4xl bricolage-grotesque md:text-5xl font-bold text-center text-[#A9A9A9] tracking-wide mb-8">
            {headings[activeTab]}
          </h2>
        )}

        <div
          aria-hidden
          className="absolute inset-x-0 top-20 flex justify-center -z-10 pointer-events-none"
        >
          <span className="text-9xl md:text-[12rem] font-black text-gray-300 opacity-5 select-none">
            MA
          </span>
        </div>

        {/* Content Box */}
        {activeTab === "VALUES" ? (
          <div className="relative mx-auto max-w-7xl bg-[#F6F6F6] rounded-lg overflow-hidden">
            {/* Watermark - Now Visible */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-60 opacity-60 pointer-events-none z-0">
              <img
                src="/mai-web/assets/About/Watermark.png"
                alt="Background"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="relative z-10 bricolage-grotesque1 text-[#000000] text-lg leading-relaxed">
              {tabContent[activeTab]}
            </div>
          </div>
        ) : (
          <div className="relative mx-auto max-w-5xl bg-[#F6F6F6] rounded-xl p-8 overflow-hidden">
            {/* Watermark - Now Visible */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-60 opacity-60 pointer-events-none z-0">
              <img
                src="/mai-web/assets/About/Watermark.png"
                alt="Background"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="relative z-10 bricolage-grotesque1 text-[#000000] text-lg leading-relaxed">
              {tabContent[activeTab]}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full border text-sm transition
                ${
                  activeTab === tab
                    ? "bg-black text-[#FFFFFF] border-[#312F30] shadow"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-10 w-full overflow-hidden relative">
          <div
            className={`flex gap-10 ${
              startAnimation ? "animate-marquee-active" : ""
            }`}
            style={{ width: "max-content" }}
          >
            {Array(12)
              .fill(0)
              .map((_, i) => (
                <img
                  key={i}
                  src="/mai-web/assets/About/logoimg.png"
                  alt="Logo"
                  className="h-16 object-contain"
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutHome;
