import React, { useState, useEffect, useRef } from 'react';
import { Document, ChatMessage } from '../types';
import { ArrowLeft, Send, Sparkles, Bot, User, Maximize2, Download } from 'lucide-react';
import { chatWithDocument, analyzeDocument } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface DocumentViewProps {
  document: Document;
  onBack: () => void;
}

export const DocumentView: React.FC<DocumentViewProps> = ({ document, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(document.summary || null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-generate summary if not present
  useEffect(() => {
    const fetchSummary = async () => {
      if (!summary && document.content) {
        setIsSummarizing(true);
        try {
          const result = await analyzeDocument(document.content, 'application/pdf');
          setSummary(result);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSummarizing(false);
        }
      }
    };
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.id]); // Run only when doc changes

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !document.content) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await chatWithDocument(userMessage.text, document.content, 'application/pdf', history);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="font-semibold text-gray-900 leading-tight">{document.name}</h2>
            <span className="text-xs text-gray-500">
               {(document.size / 1024 / 1024).toFixed(2)} MB • Caricato il {document.uploadDate.toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 text-gray-500 hover:text-brand-600 hover:bg-orange-50 rounded-lg transition-colors" title="Download">
            <Download size={20} />
          </button>
          <button className="px-4 py-2 bg-brand-50 text-brand-700 text-sm font-medium rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-2">
            <Sparkles size={16} />
            <span>Azioni AI</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: PDF Preview */}
        <div className="flex-1 bg-gray-100 p-6 flex flex-col overflow-hidden relative border-r border-border">
          <div className="bg-white rounded-lg shadow-lg flex-1 overflow-hidden flex items-center justify-center relative">
             {document.content ? (
                 <iframe 
                  src={`data:application/pdf;base64,${document.content}#toolbar=0&navpanes=0`}
                  className="w-full h-full"
                  title="PDF Preview"
                 />
             ) : (
                <div className="text-gray-400 flex flex-col items-center">
                    <Maximize2 size={48} className="mb-4 opacity-50"/>
                    <p>Anteprima non disponibile</p>
                </div>
             )}
          </div>
        </div>

        {/* Right: AI Analysis & Chat */}
        <div className="w-[450px] flex flex-col bg-white shrink-0">
          {/* Tabs / Analysis Section */}
          <div className="border-b border-border">
            <div className="flex text-sm font-medium text-gray-500">
              <button className="flex-1 py-3 text-brand-600 border-b-2 border-brand-600">Chat & Analisi</button>
              <button className="flex-1 py-3 hover:text-gray-700">Metadati</button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
              
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-brand-700 mb-2">
                  <Sparkles size={16} />
                  <h3 className="font-semibold text-sm uppercase tracking-wide">Analisi Intelligente</h3>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
                  {isSummarizing ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="animate-spin h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full"></div>
                      Analisi del documento in corso...
                    </div>
                  ) : (
                    <ReactMarkdown>{summary || "Nessun riassunto disponibile."}</ReactMarkdown>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-brand-100 text-brand-600'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-gray-900 text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              
               {isLoading && (
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-white">
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Fai una domanda sul documento..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none h-12 min-h-[48px] max-h-32"
                  rows={1}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="mt-2 text-center">
                 <p className="text-[10px] text-gray-400">Gemini può commettere errori. Verifica le informazioni importanti.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
