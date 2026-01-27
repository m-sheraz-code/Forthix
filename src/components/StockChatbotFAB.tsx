import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, TrendingUp } from "lucide-react";
import { getChatResponse } from "../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MODEL = "deepseek/deepseek-r1:free";

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
          <div className="p-4 bg-brand-primary/10 border-b border-brand-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-primary/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Stock AI Assistant</h3>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-[10px] text-gray-400">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-brand-primary text-white rounded-tr-none"
                      : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none">
                  <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
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
          <div className="p-4 border-t border-brand-primary/20 bg-brand-primary/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about stocks..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-primary/50 text-white placeholder:text-gray-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-2 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white rounded-xl transition-all"
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
        className={`p-4 rounded-full shadow-lg transition-all duration-300 group hover:scale-110 active:scale-95 ${
          isOpen ? "bg-red-500 rotate-90" : "bg-brand-primary"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        )}
      </button>
    </div>
  );
}
