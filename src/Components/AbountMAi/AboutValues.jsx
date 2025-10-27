import React, { useEffect, useState } from "react";
import { fetchValuesApi } from "../../apiServices";

export default function AboutValues() {
  const fallbackValues = [
    {
      title: "SIMPLICITY",
      description:
        "Construction is complicated enough. MAI keeps tools clear, intuitive, and focused so you can get to work without distractions.",
    },
    {
      title: "INTEGRITY",
      description:
        "We built MAI for the people actually doing the work: contractors, project managers, and admins. Every decision is made with their success in mind.",
    },
    {
      title: "INNOVATION",
      description:
        "We use technology not for hype, but to solve real industry problems: compliance, paperwork, deadlines, and communication.",
    },
    {
      title: "ACCESSIBILITY",
      description:
        "Powerful tools shouldn't just be for the biggest firms. MAI gives small and minority-owned businesses the same advantages as the industry giants.",
    },
    {
      title: "ACCOUNTABILITY",
      description:
        "Just like construction, success is measured by results. MAI helps you deliver projects on time, on budget, c.",
    },
  ];

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadValues = async () => {
      try {
        setLoading(true);
        setError(null);
        const cardsData = await fetchValuesApi();
        if (mounted) setCards(cardsData);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load values");
        setCards([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadValues();

    return () => {
      mounted = false;
    };
  }, []);
  const listToRender = cards.length > 0 ? cards : fallbackValues;

  return (
    <div className="w-full py-3">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="py-6 text-center text-red-500">
          Could not load values. {error}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {listToRender.map((value, index) => {
            const isDark = index % 2 === 0;
            return (
              <div
                key={value.id ?? index}
                className={`flex flex-col justify-start h-64 p-6 text-left rounded-lg transition-transform transform hover:scale-105
                  ${
                    isDark ? "bg-zinc-800 text-white" : "bg-white text-zinc-800"
                  }
                `}
              >
                {/* Title */}
                <h2 className="text-xl bricolage-grotesque font-semibold mb-2">
                  {value.title}
                </h2>

                {/* Description */}
                <p className="text-sm bricolage-grotesque flex-grow">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
