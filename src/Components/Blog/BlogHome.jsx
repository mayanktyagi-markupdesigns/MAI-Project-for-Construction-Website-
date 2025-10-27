import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBlogsApi } from "../../apiServices";

const BlogHome = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Map API data
  const mapApiToPost = (item, index) => {
    const image = item.featured_image
      ? `https://www.markupdesigns.net/mai-beta/storage/blogs/${item.featured_image}`
      : `/mai-web/assets/Blog/blog${(index % 12) + 1}.png`;

    const createdAt = item.created_at || null;
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
      link: `/ReadMoreBlogPage/${item.slug}`,
    };
  };
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
    } catch (error) {
      console.error("Error decoding HTML:", error);
      return "";
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiData = await fetchBlogsApi();

        if (Array.isArray(apiData) && apiData.length > 0) {
          const mapped = apiData.map(mapApiToPost);
          setPosts(mapped);
        } else {
          setError("No blogs found.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto relative">
        {/* Enhanced Watermark */}
        <img
          src="/mai-web/assets/About/Watermark.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute z-0 -top-10 right-6 md:right-96 w-28 md:w-56 lg:w-72 h-auto object-contain opacity-30 md:opacity-20"
          style={{ mixBlendMode: "multiply" }}
        />

        {/* Enhanced Header */}
        <div className="text-center mb-12 relative z-10">
          <div className="inline-block">
            <h1 className="text-4xl md:text-4xl lg:text-6xl bricolage-grotesque font-bold text-[#A9A9A9] tracking-tight mb-6 relative">
              THE HARD HAT{" "}
              <span className="text-4xl md:text-4xl lg:text-6xl bricolage-grotesque font-bold text-[#312F30] tracking-tight">
                BLOG
              </span>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#A9A9A9] via-[#312F30] to-[#A9A9A9] rounded-full opacity-30"></div>
            </h1>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl text-gray-600  bricolage-grotesque leading-relaxed font-light">
              The Hard Hat Blog is where construction meets clarity. From
              navigating public agency compliance to streamlining submittals,
              RFIs, and closeouts, we share practical insights to help
              contractors, project managers, and admins stay ahead. Whether
              you're a small MWBE firm or an experienced GC, our goal is to give
              you tools, tips, and perspectives that make building easier.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-[#312F30] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-[#312F30] rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-red-50 border border-red-200 rounded-full text-red-600 shadow-sm">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            >
              <Link to={post.link}>
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-64 object-cover transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>

              <div className="p-6 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-[#A9A9A9] font-medium tracking-wide uppercase bricolage-grotesque">
                    {post.publishedDate}
                  </div>
                </div>

                <h2 className="text-base font-bold bricolage-grotesque text-[#312F30] mb-2 line-clamp-3 leading-tight group-hover:text-black transition-colors duration-300">
                  {post.title}
                </h2>

                {/* Render short HTML preview safely */}
                <p className="text-gray-700 text-sm line-clamp-4 bricolage-grotesque leading-relaxed mb-3 font-light">
                  {post.excerptHTML}
                </p>

                <Link
                  to={post.link}
                  className="inline-flex items-center group-hover:gap-2 gap-1 text-[#312F30] hover:text-black text-sm font-semibold transition-all duration-300 bricolage-grotesque"
                >
                  Read More
                  <svg
                    className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                <div className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-[#312F30] via-[#A9A9A9] to-[#312F30] rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Decoration */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center space-x-2 text-[#A9A9A9]">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#A9A9A9] to-transparent"></div>
            <div className="w-2 h-2 bg-[#312F30] rounded-full"></div>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#A9A9A9] to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogHome;
