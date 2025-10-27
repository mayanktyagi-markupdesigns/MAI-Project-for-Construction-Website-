import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

const ReadMoreBlogPage = () => {
  const { id: slug } = useParams();
  const scrollContainerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [cardsPerView, setCardsPerView] = useState(
    window.innerWidth >= 1024 ? 4 : 1
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const totalCards = related.length;
  const totalPages = Math.max(1, Math.ceil(totalCards / cardsPerView));

  useEffect(() => {
    const handleResize = () =>
      setCardsPerView(window.innerWidth >= 1024 ? 4 : 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getExcerptHTML = (html, maxLength = 300) => {
    if (!html) return "";
    try {
      const firstDecode = new DOMParser().parseFromString(html, "text/html")
        .documentElement.textContent;
      const secondDecode = new DOMParser().parseFromString(
        firstDecode,
        "text/html"
      ).documentElement.textContent;

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = secondDecode;
      const text = tempDiv.textContent || tempDiv.innerText || "";
      const cleaned = text.replace(/\s+/g, " ").trim();

      return cleaned.length > maxLength
        ? cleaned.slice(0, maxLength).trim() + "..."
        : cleaned;
    } catch {
      return "";
    }
  };

  const sanitizeHTML = (html) => {
    if (!html) return "";
    try {
      const firstDecode = new DOMParser().parseFromString(html, "text/html")
        .documentElement.textContent;
      const secondDecode = new DOMParser().parseFromString(
        firstDecode,
        "text/html"
      ).documentElement.textContent;

      let cleanText = secondDecode
        .replace(/\r?\n|\r/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
      cleanText = cleanText.replace(
        /(\d+\.\s*[^0-9]+)/g,
        `<p class="text-gray-700 font-semibold my-4">$1</p>`
      );

      const paragraphs = cleanText
        .split(/(?<=\.|\!|\?)\s{1,}/)
        .filter((p) => p && !p.includes("<p class="))
        .map(
          (p) => `<p class="text-gray-700 text-justify my-2">${p.trim()}</p>`
        )
        .join("");

      return (
        paragraphs +
          cleanText.match(/<p class="text-gray-700.*<\/p>/g)?.join("") || ""
      );
    } catch (e) {
      console.error("HTML sanitize error:", e);
      return html;
    }
  };

  const mapApiToPost = (item, index = 0) => {
    const image = item.featured_image
      ? `https://www.markupdesigns.net/mai-beta/storage/blogs/${item.featured_image}`
      : `/mai-web/assets/Blog/blog${(index % 12) + 1}.png`;

    const createdAt = item.created_at || item.published_at || null;
    const publishedDate = createdAt
      ? new Date(createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Unknown date";

    return {
      id: item.id,
      image,
      publishedDate,
      title: item.title || "Untitled post",
      excerptHTML: getExcerptHTML(item.content, 350),
      contentHTML: sanitizeHTML(item.content),
      link: `/ReadMoreBlogPage2/${item.slug}`,
    };
  };

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://www.markupdesigns.net/mai-beta/api/blogs/${slug}`
        );
        const data = await res.json();

        if (data?.success && data.data) {
          setPost(mapApiToPost(data.data));
          const relatedPosts = data.related?.map(mapApiToPost) || [];
          setRelated(relatedPosts);
        }
      } catch (err) {
        console.error(err);
        setPost(null);
        setRelated([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchBlogData();
  }, [slug]);

  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    const start = i * cardsPerView;
    pages.push(related.slice(start, start + cardsPerView));
  }

  const goToPage = (pageIndex) => {
    if (pageIndex === currentIndex || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(pageIndex);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="text-gray-500 text-sm mb-4">
          {loading ? "Loading..." : post?.publishedDate}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
          {loading ? "Loading post..." : post?.title || "Post Not Found"}
        </h1>

        {post?.image && !loading && (
          <div className="w-full h-[400px] sm:h-[500px] rounded-xl overflow-hidden shadow">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Blog Content */}
      <div className="px-6 bg-white">
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="inline-block w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        ) : post?.contentHTML ? (
          <div
            className="prose max-w-none prose-h2:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700 prose-ol:list-decimal prose-ul:list-disc prose-ol:pl-5 prose-ul:pl-5 prose-headings:font-semibold prose-img:rounded-xl prose-a:text-blue-600 prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.contentHTML }}
          />
        ) : (
          <p className="text-center text-gray-500 py-8">
            No content available.
          </p>
        )}
      </div>

      {/* Related Articles Carousel */}
      {related.length > 0 && (
        <div className="px-4 sm:px-6 py-10 sm:py-12">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-4xl sm:text-5xl font-bold bricolage-grotesque text-[#000000] leading-tight">
              You Might <br /> Also <br /> Like...
            </h2>

            <Link
              to="/BlogHome"
              className="bg-[#000000] text-white text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-full"
            >
              See All →
            </Link>
          </div>

          <div className="relative">
            {totalPages > 1 && (
              <>
                <button
                  onClick={() =>
                    goToPage((currentIndex - 1 + totalPages) % totalPages)
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow"
                >
                  ‹
                </button>
                <button
                  onClick={() => goToPage((currentIndex + 1) % totalPages)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow"
                >
                  ›
                </button>
              </>
            )}

            <div ref={scrollContainerRef} className="overflow-hidden">
              <motion.div
                className="flex w-full"
                animate={{ x: `-${currentIndex * 100}%` }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.6 }}
              >
                {pages.map((pageItems, pageIdx) => (
                  <div key={pageIdx} className="flex-shrink-0 w-full px-2">
                    <div className="flex gap-4 justify-start flex-nowrap items-stretch">
                      {pageItems.map((rpost) => {
                        const cardWidthStyle =
                          cardsPerView === 4
                            ? { width: "calc(25% - 12px)" }
                            : { width: "100%" };
                        return (
                          <div
                            key={rpost.id}
                            className="bg-white overflow-hidden rounded-lg shadow-sm"
                            style={cardWidthStyle}
                          >
                            <div className="h-56 sm:h-64 bg-gray-200">
                              <img
                                src={rpost.image}
                                alt={rpost.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4 sm:p-5">
                              <div className="text-[#312F30] text-xs sm:text-sm mb-2">
                                {rpost.publishedDate}
                              </div>
                              <h3 className="font-bold text-sm sm:text-base mb-2 leading-tight">
                                {rpost.title}
                              </h3>
                              <div className="relative">
                                <p className="text-xs sm:text-sm line-clamp-2 overflow-hidden pr-16">
                                  {rpost.excerptHTML}
                                </p>
                                <Link
                                  to={rpost.link}
                                  className="absolute bottom-0 right-0 bg-white pl-1 text-xs sm:text-sm underline"
                                >
                                  Read More
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadMoreBlogPage;
