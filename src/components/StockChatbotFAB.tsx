import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getChatResponse } from "../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MODEL = "allenai/molmo-2-8b:free";

export default function StockChatbotFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your Stock Market assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await getChatResponse(
        [...messages, userMessage],
        MODEL
      );

      if (apiError) {
        throw new Error(apiError.message || apiError.error || "Failed to fetch response from AI");
      }

      if (!data?.choices?.[0]?.message) {
        throw new Error("Invalid response from AI");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Chat Error:", err);
      setError(err.message || "Sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] bg-brand-dark/95 backdrop-blur-md border border-brand-primary/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-brand-primary to-blue-600 rounded-xl shadow-lg shadow-brand-primary/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white tracking-wide text-sm">Stock AI <span className="text-brand-primary">Pro</span></h3>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] font-medium text-green-400">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90 duration-300"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300 fade-in`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-3xl text-sm shadow-md ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-brand-primary to-blue-600 text-white rounded-br-sm"
                      : "bg-[#1e293b]/80 border border-white/10 text-gray-200 rounded-bl-sm backdrop-blur-sm"
                  }`}
                >
                  <div
                    className={`prose prose-sm max-w-none ${
                        m.role === "user" 
                        ? "prose-invert prose-p:text-white prose-a:text-white/90 prose-strong:text-white" 
                        : "prose-invert prose-p:text-gray-300 prose-a:text-blue-400 prose-headings:text-gray-100 prose-strong:text-white"
                    } prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:p-3 prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in duration-300">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
                  <span className="text-xs text-gray-400 animate-pulse">Analyzing market data...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="text-center text-xs text-red-400 bg-red-400/10 p-2 rounded-lg">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about stocks..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary/50 focus:bg-white/10 focus:ring-1 focus:ring-brand-primary/50 text-white placeholder:text-gray-500 transition-all duration-300"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-3 bg-gradient-to-br from-brand-primary to-blue-600 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl shadow-brand-primary/30 transition-all duration-500 ease-out hover:scale-110 active:scale-95 border border-white/10 overflow-hidden relative group ${
          isOpen ? "bg-red-500 rotate-90" : "bg-gradient-to-br from-brand-primary to-blue-600"
        }`}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full"></div>
        {isOpen ? (
          <X className="w-7 h-7 text-white relative z-10" />
        ) : (
          <MessageCircle className="w-7 h-7 text-white group-hover:rotate-12 transition-transform duration-300 relative z-10" />
        )}
      </button>
    </div>
  );
}
