import React, { useEffect, useState } from "react";
import { fetchWhatContent } from "../../apiServices";

export default function AboutWhat() {
  const [stages, setStages] = useState([]);
  const [active, setActive] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalVideoSrc, setModalVideoSrc] = useState(null); // <-- only src used by iframe
  const [contentHtml, setContentHtml] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Utility: convert various YouTube URLs to embed URL (or return original for non-YouTube)
  function toYouTubeEmbed(url) {
    if (!url) return null;
    try {
      // Normalize missing protocol
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      const u = new URL(url);
      const host = u.hostname.toLowerCase();

      // youtu.be short link
      if (host === "youtu.be") {
        const id = u.pathname.slice(1).split(/[?#]/)[0];
        return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
      }

      // youtube.com
      if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
        // already an embed path
        if (u.pathname.startsWith("/embed/")) {
          const id = u.pathname.split("/embed/")[1].split(/[?#]/)[0];
          return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
        }
        // watch?v=VIDEO_ID
        const v = u.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}?autoplay=1&rel=0`;
      }

      // Not recognized as YouTube — return original url (useful for other providers)
      return url;
    } catch {
      return url;
    }
  }

  function openModal(stage) {
    setModalContent(stage);
    setActive(stage.key);
    // compute embed src (or null)
    const embed = toYouTubeEmbed(stage.video);
    setModalVideoSrc(embed);
    setModalOpen(true);
  }

  function closeModal() {
    // clear src first so playback stops
    setModalVideoSrc(null);
    setModalOpen(false);
    setModalContent(null);
  }

  // lock body scroll while modal open
  useEffect(() => {
    if (modalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev || "";
      };
    }
  }, [modalOpen]);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && modalOpen) closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  useEffect(() => {
    let mounted = true;

    const loadWhatContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const { contentHtml: apiContentHtml, apiStages } = await fetchWhatContent();

        if (!mounted) return;

        if (apiContentHtml) setContentHtml(apiContentHtml);

        if (apiStages && apiStages.length > 0) {
          const mappedStages = apiStages.map((s, idx) => {
            const key = (s.title || `stage-${idx}`)
              .toLowerCase()
              .replace(/\s+/g, "-");
            const pointsArray = Array.isArray(s.points)
              ? s.points.map((p) => p.point).filter(Boolean)
              : [];

            return {
              key,
              label: s.title || `Stage ${idx + 1}`,
              video: s.video || null,
              details: pointsArray,
            };
          });

          setStages(mappedStages);
          setActive(mappedStages[0]?.key ?? null);
        } else {
          setStages([]);
          setActive(null);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load content");
        setStages([]);
        setActive(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadWhatContent();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full relative">
      <div className="relative z-10">
        {loading ? (
          <div className="py-6 flex items-center justify-center">
            <div className="inline-block w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 mb-3">Could not load content. {error}</p>
        ) : contentHtml ? (
          <h3
            className="text-base md:text-lg text-justify font-medium text-[#000000] mb-3"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <h3 className="text-base md:text-lg text-justify font-medium text-[#000000] mb-3">
            MAi is an AI-powered project manager designed to handle the entire
            construction project lifecycle. From initiation to closeout, MAi
            organizes documents, automates submittals and RFIs, tracks
            schedules, and ensures compliance with agency requirements.
          </h3>
        )}

        <p className="mb-4 mt-5 text-sm font-semibold text-gray-800">
          <span className="underline hover:text-gray-900 cursor-pointer">
            Click the project cycle stages below to learn about everything MAi
            can do for you.
          </span>
        </p>

        <div className="flex gap-4 items-center flex-wrap">
          {stages.map((s) => (
            <button
              key={s.key}
              onClick={() => openModal(s)}
              className={`flex items-center justify-center mt-5 px-8 py-2.5 rounded-full border-2 transition-shadow duration-150 text-md 
                  ${
                    active === s.key
                      ? "bg-[#85C46A] text-white border-[#85C46A]"
                      : "bg-[#E9E9E9] text-[#312F30] border-[#CBCBCB]"
                  }`}
              aria-pressed={active === s.key}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && modalContent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6"
        >
          <div className="fixed inset-0 bg-black/80" onClick={closeModal} aria-hidden="true" />

          <div className="relative z-60 w-full max-w-7xl h-[80vh] mx-auto">
            <div className="relative w-full h-full bg-transparent">
              <div className="absolute inset-0 flex flex-col md:flex-row gap-6 items-start md:items-center p-2 md:p-4">
                {/* LEFT: Video */}
                <div className="md:flex-[3] md:min-w-0 flex-1 p-1 md:p-2 flex items-start md:items-center">
                  <div className="relative w-full rounded-md overflow-hidden shadow-lg bg-black">
                    <button
                      onClick={closeModal}
                      aria-label="Close video"
                      className="absolute top-2 right-2 z-50 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    >
                      <img src="/mai-web/assets/About/x-mark.png" alt="Close" className="w-4 h-4 object-contain" />
                    </button>

                    {modalVideoSrc ? (
                      <iframe
                        title={`${modalContent.label} Phase Video`}
                        src={modalVideoSrc}
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        className="w-full md:h-[52vh] block"
                      />
                    ) : (
                      <div className="w-full h-[52vh] flex items-center justify-center text-white">
                        <p>No video available for this stage.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: Details */}
                <div className="w-full md:w-96 flex-shrink-0 flex items-start md:items-start">
                  <div className="w-full bg-[#F6F6F6] rounded-lg shadow-xl max-h-[60vh] overflow-y-auto p-5">
                    <h5 className="text-md font-semibold text-gray-800 mb-3">{modalContent.label}</h5>

                    <div className="space-y-3">
                      {modalContent.details?.length > 0 ? (
                        modalContent.details.map((detail, index) => (
                          <div key={index} className="flex items-start gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-100 flex items-center justify-center mt-1.5 mr-1 flex-shrink-0">
                              <img src="/mai-web/assets/About/check-mark.png" alt="Check" className="w-3 h-3 object-contain" />
                            </div>
                            <p className="text-sm text-[#312F30] leading-relaxed">{detail}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600">No details available.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
