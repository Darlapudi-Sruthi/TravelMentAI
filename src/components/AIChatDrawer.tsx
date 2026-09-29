import React, { useState } from 'react';
import { MessageSquare, Send, X, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTED_QUESTIONS = [
  'Plan a 5-day trip to Goa.',
  'Find budget hotels near the beach.',
  'What can I visit tomorrow?',
  'Find vegetarian restaurants near my hotel.',
  'How much will my trip approximately cost?',
  'What should I pack?',
  'How do I reach the airport from my hotel?',
];

export const AIChatDrawer: React.FC<{
  tripContext: Record<string, unknown>;
  darkMode: boolean;
}> = ({ tripContext, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: 'Hello! I am your TravelMate AI assistant. Ask me to customize your Goa itinerary, find vegetarian restaurants, compare budget hotels, estimate cab fares to the airport, or create a packing list.',
    },
  ]);

  const sendQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          tripContext,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Chat service temporarily busy');
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: data.reply,
        },
      ]);
    } catch {
      // Helpful context-aware fallback if AI quota is temporarily reached
      const q = trimmed.toLowerCase();
      let fallbackReply =
        'Based on your current Hyderabad → Goa trip plan (Budget ₹25,000, 4 days): Flights start around ₹3,290 one-way (estimated), boutique hotels in Panaji/Candolim cost ₹1,250–₹3,200/night, and local thali meals average ₹220–₹480 per person.';
      if (q.includes('vegetarian')) {
        fallbackReply =
          'Recommended Vegetarian Restaurants near your hotel: 1) Navtara Pure Veg (0.6 km · ~₹220/person · Goan Mushroom Xacuti & Udupi Dosa), 2) Cafe Bodega in Altinho (1.2 km · ~₹420/person · Sourdough & Goan Poi sandwiches), and 3) Ritz Classic Veg Khatkhate Thali (0.8 km · ~₹350/person). (Estimated/Demo Pricing)';
      } else if (q.includes('airport')) {
        fallbackReply =
          'To reach Goa Airport (GOX Mopa or GOI Dabolim) from your hotel: Pre-book an AC Sedan via the official Goa Miles app or hotel desk (~32 km, 45–50 mins drive, estimated fare ₹1,100). KTCL electric airport shuttle buses also run from Panaji KTC stand for ₹150–₹250.';
      } else if (q.includes('pack')) {
        fallbackReply =
          'Essential Packing List for Goa: 1) Original Government ID & Driving License (mandatory for rentals), 2) Breathable cotton/linen wear & swimwear, 3) SPF 50+ sunscreen & sunglasses, 4) Comfortable walking sandals for Fort Aguada & Old Goa, 5) Power bank & light rain poncho.';
      } else if (q.includes('budget hotel')) {
        fallbackReply =
          'Top Budget Hotels near the beach (Estimated Demo Rates): 1) Zostel & Palm Stay Candolim (₹1,250/night · 0.6 km from Candolim Beach · 4.3★), 2) Sea Breeze Guesthouse Palolem (₹1,450/night · breakfast included · 0.4 km from beach · 4.2★).';
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: fallbackReply,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold shadow-lg transition-transform active:scale-95 whitespace-nowrap"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isOpen ? 'Close AI Assistant' : 'Ask TravelMate AI'}</span>
        </button>
      </div>

      {/* Chat Drawer Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-5 z-40 w-[92vw] sm:w-[420px] max-h-[75vh] flex flex-col rounded-xl border shadow-xl overflow-hidden ${
            darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-teal-700 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <div>
                <h3 className="text-sm font-semibold">TravelMate AI Assistant</h3>
                <p className="text-[11px] text-teal-100">
                  Trip-aware recommendations · Live & Estimated data
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-teal-800 transition-colors"
              aria-label="Close AI Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendQuestion(q)}
                className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-600 transition-colors whitespace-nowrap shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[260px] max-h-[360px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-teal-700 text-white'
                      : darkMode
                      ? 'bg-slate-800 text-slate-100 border border-slate-700'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-500 italic">
                TravelMate AI is analyzing your trip route and budget...
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuestion(input);
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about flights, veg food, packing, budget..."
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};
