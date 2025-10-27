import React, { useState, useEffect, useRef } from "react";
import { X, Send, Mic, MicOff } from "lucide-react";

function FormattedBotMessage({ text, isDesktop }) {
  const formatMessage = (rawText) => {
    const isReport =
      /Executive Summary|Task Status|Documents Update|Site Health|Recommended Actions/i.test(
        rawText
      );

    if (!isReport) {
      return <p className="whitespace-pre-wrap leading-relaxed">{rawText}</p>;
    }

    // Split by sections
    const sections = [];
    const lines = rawText.split("\n").filter((line) => line.trim());

    let currentSection = null;
    let currentContent = [];

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Main headers
      if (
        trimmed.match(
          /^(Executive Summary|Task Status Overview|Documents Update|Site Health Assessment|Recommended Actions|Notes|Project:|Date:|Prepared by:)/
        )
      ) {
        if (currentSection) {
          sections.push({ title: currentSection, content: currentContent });
        }
        currentSection = trimmed;
        currentContent = [];
      }
      // Sub-items with bullets or dashes
      else if (
        trimmed.startsWith("-") ||
        trimmed.startsWith("•") ||
        trimmed.match(/^(Task|Document)\s+\d+/)
      ) {
        currentContent.push({
          type: "bullet",
          text: trimmed.replace(/^[-•]\s*/, ""),
        });
      }
      // Regular content
      else if (trimmed) {
        currentContent.push({ type: "text", text: trimmed });
      }
    });

    // Add last section
    if (currentSection) {
      sections.push({ title: currentSection, content: currentContent });
    }

    return (
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-4">
            {/* Section Title */}
            <div
              className={`font-bold text-gray-900 mb-2 ${
                isDesktop ? "text-base" : "text-xs"
              } 
              ${
                section.title.includes("Summary") ||
                section.title.includes("Project")
                  ? "text-blue-700"
                  : ""
              }`}
            >
              {section.title.replace(/^[-•]\s*/, "")}
            </div>

            {/* Section Content */}
            <div className="space-y-2">
              {section.content.map((item, i) => (
                <div key={i} className={item.type === "bullet" ? "ml-3" : ""}>
                  {item.type === "bullet" ? (
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span
                        className={`flex-1 text-gray-700 ${
                          isDesktop ? "text-sm" : "text-xs"
                        } leading-relaxed`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ) : (
                    <p
                      className={`text-gray-700 ${
                        isDesktop ? "text-sm" : "text-xs"
                      } leading-relaxed`}
                    >
                      {item.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return formatMessage(text);
}

export default function Chatbot({ onClose, mode = "mobile" }) {
  const isDesktop = mode === "desktop";
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi there! Welcome to MAi. I'm here to assist you with everything you need today.",
    },
    {
      from: "bot",  
      type: "options",
      options: [
        "How can I reduce costs without affecting quality?",
        "Which resources are currently underutilized?",
        "How can I prevent delays due to weather conditions?",
        "Summarize today's site progress in a report format",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const recognitionRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTranscript, setRecordingTranscript] = useState("");
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) setIsSpeechSupported(false);

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop && recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendToApi = async (text) => {
    try {
      const token = localStorage.getItem("mai_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (!token) {
        console.warn("No token found in localStorage (key: mai_token).");
      }

      const res = await fetch(
        "https://www.markupdesigns.net/mai-beta/api/ai/chat",
        {
          method: "POST",
          headers,
          body: JSON.stringify({ message: text }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }

      const data = await res.json();
      if (data && typeof data.reply === "string") return data.reply;
      if (data && data.message) return data.message;

      return "Sorry, I couldn't understand the response from the server.";
    } catch (err) {
      console.error("Error calling chat API:", err);
      return "Sorry, there was an error contacting the chat API.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text }]);
    const typingId = Date.now();
    setMessages((prev) => [
      ...prev,
      { from: "bot", text: "Typing...", _id: typingId },
    ]);

    setIsSending(true);
    const reply = await sendToApi(text);
    setIsSending(false);
    setMessages((prev) => {
      const withoutTyping = prev.filter(
        (m) => !(m.from === "bot" && m._id === typingId)
      );
      return [...withoutTyping, { from: "bot", text: reply }];
    });
  };

  const handleOptionClick = async (option) => {
    if (isSending) return;
    setMessages((prev) => [...prev, { from: "user", text: option }]);
    const typingId = Date.now();
    setMessages((prev) => [
      ...prev,
      { from: "bot", text: "Typing...", _id: typingId },
    ]);

    setIsSending(true);
    const reply = await sendToApi(option);
    setIsSending(false);

    setMessages((prev) => {
      const withoutTyping = prev.filter(
        (m) => !(m.from === "bot" && m._id === typingId)
      );
      return [...withoutTyping, { from: "bot", text: reply }];
    });
  };

  const startRecording = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support Speech Recognition.");
      setIsSpeechSupported(false);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop && recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) finalTranscript += res[0].transcript;
        else interim += res[0].transcript;
      }
      setRecordingTranscript((finalTranscript + " " + interim).trim());
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      setTimeout(() => setRecordingTranscript(""), 500);
    };

    recognition.onend = async () => {
      setIsRecording(false);
      const trimmed = (finalTranscript || "").trim();
      if (trimmed) {
        setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
        const typingId = Date.now();
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "Typing...", _id: typingId },
        ]);

        setIsSending(true);
        const reply = await sendToApi(trimmed);
        setIsSending(false);

        setMessages((prev) => {
          const withoutTyping = prev.filter(
            (m) => !(m.from === "bot" && m._id === typingId)
          );
          return [...withoutTyping, { from: "bot", text: reply }];
        });
      } else {
        console.log("No speech recognized.");
      }
      setRecordingTranscript("");
    };

    try {
      recognition.start();
      setIsRecording(true);
      setRecordingTranscript("");
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Error stopping recognition:", e);
        setIsRecording(false);
        setRecordingTranscript("");
      }
    } else {
      setIsRecording(false);
      setRecordingTranscript("");
    }
  };

  const toggleRecording = () => {
    if (!isSpeechSupported) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (isRecording) stopRecording();
    else startRecording();
  };

  return (
    <div
      className={`${
        isDesktop
          ? "fixed inset-0 flex items-center justify-center z-50 binset-0 bg-black/5 backdrop-blur-[2px]"
          : "fixed bottom-20 right-4 z-50"
      }`}
    >
      <div
        className={`bg-white shadow-2xl rounded-2xl border flex flex-col overflow-hidden ${
          isDesktop
            ? "w-full max-w-4xl h-[95vh] border-gray-300"
            : "w-80 h-[480px] border-gray-200"
        }`}
      >
        <style>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>

        {/* Header */}
        <div
          className={`${
            isDesktop ? "m-3" : "m-2"
          } bg-gradient-to-r from-gray-800 to-gray-900 text-white flex items-center justify-between rounded-xl shadow-lg ${
            isDesktop ? "px-6 py-2.5" : "px-4 py-2.5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`${
                isDesktop ? "w-12 h-12" : "w-8 h-8"
              } rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-md`}
            >
              <img
                src="/mai-web/assets/home/logo.png"
                alt="MAI Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p
                className={`${
                  isDesktop ? "text-lg" : "text-sm"
                } font-bold bricolage-grotesque`}
              >
                MAi
              </p>
              <p
                className={`${
                  isDesktop ? "text-xs" : "text-[10px]"
                } text-gray-300 bricolage-grotesque`}
              >
                Usual Time to revert: 1 to 3 minutes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`bg-white rounded-full shadow-md hover:bg-gray-100 hover:shadow-lg transition-all ${
              isDesktop ? "p-2" : "p-1"
            }`}
          >
            <X size={isDesktop ? 16 : 12} className="text-gray-800" />
          </button>
        </div>

        {/* Messages Container */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-y-auto space-y-4 hide-scrollbar ${
            isDesktop ? "px-8 py-6" : "px-4 py-3"
          }`}
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          {messages.map((msg, index) =>
            msg.from === "bot" ? (
              <div
                key={index}
                className="flex items-start gap-3 animate-fadeIn"
              >
                <div
                  className={`${
                    isDesktop ? "w-10 h-10" : "w-8 h-8"
                  } rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md`}
                >
                  <img
                    src="/mai-web/assets/home/logo.png"
                    alt="MAI Logo"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className={`${isDesktop ? "max-w-[70%]" : "max-w-[75%]"}`}>
                  {msg.text && (
                    <div
                      className={`bg-gradient-to-br from-gray-100 to-gray-200 bricolage-grotesque rounded-2xl text-gray-800 shadow-sm ${
                        isDesktop
                          ? "p-4 text-base rounded-tl-sm"
                          : "p-2 text-xs rounded-tl-none mb-2"
                      }`}
                    >
                      <FormattedBotMessage
                        text={msg.text}
                        isDesktop={isDesktop}
                      />
                    </div>
                  )}
                  {msg.type === "options" && (
                    <div
                      className={`border border-gray-200 rounded-xl bg-white shadow-sm ${
                        isDesktop ? "p-4 mt-3" : "p-2"
                      }`}
                    >
                      {msg.options.map((opt, i) => (
                        <p
                          key={i}
                          onClick={() => handleOptionClick(opt)}
                          className={`text-blue-600 bricolage-grotesque hover:text-blue-700 hover:bg-blue-50 cursor-pointer transition-all rounded-lg ${
                            isDesktop
                              ? "text-sm py-2.5 px-3 mb-2"
                              : "text-xs py-1"
                          }`}
                        >
                          {opt}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key={index} className="flex justify-end animate-fadeIn">
                <p
                  className={`bg-gradient-to-br from-blue-500 to-blue-600 text-white bricolage-grotesque rounded-2xl inline-block shadow-md ${
                    isDesktop
                      ? "p-4 text-base max-w-[70%] rounded-tr-sm"
                      : "p-2 rounded-tr-none max-w-[75%]"
                  }`}
                >
                  {msg.text}
                </p>
              </div>
            )
          )}
          <div ref={messagesEndRef} />
          <p
            className={`${
              isDesktop ? "text-xs" : "text-[10px]"
            } text-gray-400 bricolage-grotesque text-center mt-4`}
          >
            Mai, 06:00 PM
          </p>
        </div>

        {/* Input Area */}
        <div
          className={`${
            isDesktop ? "m-4" : "m-2"
          } bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 bricolage-grotesque flex items-center rounded-xl shadow-md ${
            isDesktop ? "px-5 py-2.5" : "px-3 py-2.5"
          }`}
        >
          <button
            onClick={toggleRecording}
            className={`rounded-full transition-all shadow-sm ${
              isRecording
                ? "bg-red-500 text-white shadow-lg scale-110"
                : "bg-white hover:bg-gray-200 text-gray-700 hover:shadow-md"
            } ${isDesktop ? "p-3 mr-3" : "p-2 mr-2"}`}
            title={isRecording ? "Stop recording" : "Record voice message"}
          >
            {isRecording ? (
              <MicOff size={isDesktop ? 20 : 16} />
            ) : (
              <Mic size={isDesktop ? 20 : 16} />
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer..."
            className={`flex-1 outline-none border-none bricolage-grotesque bg-transparent text-gray-800 placeholder-gray-500 ${
              isDesktop ? "text-base" : "text-sm"
            }`}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            onClick={handleSend}
            className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-full hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all shadow-md ${
              isDesktop ? "p-3 ml-3" : "p-1.5 ml-2"
            }`}
          >
            <Send size={isDesktop ? 18 : 14} className="text-white" />
          </button>
        </div>

        {/* Status Messages */}
        {!isSpeechSupported && (
          <div
            className={`${
              isDesktop ? "px-4 pb-4 text-sm" : "px-3 pb-3 text-xs"
            } bricolage-grotesque text-red-600`}
          >
            Speech recognition not supported in this browser.
          </div>
        )}
        {isRecording && (
          <div
            className={`${
              isDesktop ? "px-4 pb-4 text-sm" : "px-3 pb-3 text-xs"
            } bricolage-grotesque text-red-500 flex items-center`}
          >
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            Recording...{" "}
            <span className="ml-2 italic text-gray-600">
              {recordingTranscript}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
