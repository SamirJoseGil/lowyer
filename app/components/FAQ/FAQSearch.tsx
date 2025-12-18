import { useState, useEffect, useRef } from "react";
import { Form, useNavigation } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQSearchProps {
  initialQuery?: string;
  categoria?: string;
}

export default function FAQSearch({ initialQuery = "", categoria }: FAQSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [showSugerencias, setShowSugerencias] = useState(false);
  const navigation = useNavigation();
  const isSearching = navigation.state === "submitting";
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSugerencias([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/faq/sugerencias?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSugerencias(data.sugerencias || []);
        }
      } catch (error) {
        console.error("Error obteniendo sugerencias:", error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <Form method="get" className="relative">
        <input type="hidden" name="categoria" value={categoria || ""} />
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSugerencias(true)}
            onBlur={() => setTimeout(() => setShowSugerencias(false), 200)}
            placeholder="Buscar en preguntas frecuentes..."
            disabled={isSearching}
            className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-12 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute inset-y-0 right-0 px-4 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="font-semibold">Buscar</span>
            )}
          </button>
        </div>
      </Form>

      {/* Sugerencias */}
      <AnimatePresence>
        {showSugerencias && sugerencias.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-2">
              {sugerencias.map((sugerencia, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(sugerencia);
                    setShowSugerencias(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                >
                  <svg className="h-4 w-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">{sugerencia}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
