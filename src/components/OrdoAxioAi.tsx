import { useState, useEffect, useRef } from 'react';

const screenTranslations = {
  RU: {
    part1: '> ИНИЦИАЛИЗАЦИЯ ПОДКЛЮЧЕНИЯ...',
    part2: '> ORDOAXIOAI.',
    part3: '> ГОТОВ К ОБСУЖДЕНИЮ ВАШЕГО ПРОЕКТА. ^_^',
  },
  EN: {
    part1: '> INITIALIZING CONNECTION...',
    part2: '> ORDOAXIOAI.',
    part3: '> READY TO DISCUSS YOUR PROJECT. ^_^',
  }
} as const;

type ScreenLang = keyof typeof screenTranslations;

export function OrdoAxioAi({ currentLang, isGlitching }: { currentLang: string; isGlitching?: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Typing effect states
  const [textToType, setTextToType] = useState('');
  const [currentTypingText, setCurrentTypingText] = useState('');
  const [isPausedAtLineEnd, setIsPausedAtLineEnd] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // ASCII Faces
  const faceIdle = '/\\_/\\\n( o.o )';
  const faceTyping = '/\\_/\\\n( >.< )';

  useEffect(() => {
    // Reveal component on scroll down (wheel or touch swipe)
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 30) setIsVisible(true);
      if (e.deltaY < -30) setIsVisible(false);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY) return;
      const touchEndY = e.touches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (diff > 40) setIsVisible(true);
      if (diff < -40) setIsVisible(false);
    };

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, currentTypingText]);

  useEffect(() => {
    if (!textToType) return;

    let timeoutId: NodeJS.Timeout;

    if (currentTypingText.length < textToType.length) {
      const nextChar = textToType[currentTypingText.length];
      const isNewline = nextChar === '\n';

      if (isNewline) {
        setIsPausedAtLineEnd(true);
        timeoutId = setTimeout(() => {
          setIsPausedAtLineEnd(false);
          setCurrentTypingText(prev => prev + nextChar);
        }, 500);
      } else {
        timeoutId = setTimeout(() => {
          setCurrentTypingText(prev => prev + nextChar);
        }, 20);
      }
    } else {
      setMessages(prev => [...prev, { role: 'ai', text: textToType }]);
      setTextToType('');
      setCurrentTypingText('');
      setIsTyping(false);
    }

    return () => clearTimeout(timeoutId);
  }, [currentTypingText, textToType]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue;
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages, language: currentLang }),
      });
      
      if (!response.ok) {
        throw new Error('API Error');
      }
      
      const data = await response.json();
      setTextToType(data.text.toUpperCase());
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'ERROR: CONNECTION LOST. RETRYING...' }]);
      setIsTyping(false);
    }
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[100] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
      }`}
    >
      {/* Tamagotchi / Pager Casing */}
      <div className="w-72 sm:w-80 bg-zinc-900 border-[3px] border-zinc-800 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1)] flex flex-col gap-4 font-mono relative">
        
        {/* Antenna decoration */}
        <div className="absolute -top-[3px] right-6 -translate-y-full flex flex-col items-center">
          <div className="w-2 h-6 bg-zinc-800 rounded-t-full border-x border-t border-zinc-700 -mb-px" />
          <div className="w-6 h-3 bg-zinc-800 rounded-t-md border-x border-t border-zinc-700" />
        </div>
        
        {/* LCD Screen */}
        <div className={`bg-[#051008] border-4 border-zinc-950 rounded-xl p-3 h-56 flex flex-col relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] ${isGlitching ? 'lcd-interference' : ''}`}>
          <style>{`
            @keyframes lcdInterference {
              0%, 100% { transform: translate(0, 0); filter: contrast(1) brightness(1) invert(0); }
              20% { transform: translate(-2px, 1px); filter: contrast(1.5) brightness(1.2) invert(0.1); }
              40% { transform: translate(2px, -1px); filter: contrast(0.8) brightness(0.8) invert(0); }
              60% { transform: translate(-1px, -2px); filter: contrast(1.2) brightness(1.5) invert(0.2); }
              80% { transform: translate(1px, 2px); filter: contrast(1.1) brightness(0.9) invert(0); }
            }
            .lcd-interference {
              animation: lcdInterference 0.1s steps(2, end) infinite;
            }
          `}</style>
          {/* CRT Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 z-10" />
          
          {/* AI Face Header */}
          <div className="text-cyan-500/80 whitespace-pre text-center text-xs leading-tight mb-3 transition-all duration-200">
            {isTyping ? faceTyping : faceIdle}
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 text-[10px] sm:text-xs z-20 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="text-green-500/90 self-start text-left drop-shadow-[0_0_5px_rgba(34,197,94,0.4)] max-w-[90%] break-words leading-snug whitespace-pre-wrap">
              {screenTranslations[currentLang as ScreenLang]?.part1}
            </div>
            <div className="text-green-500/90 self-start text-left drop-shadow-[0_0_5px_rgba(34,197,94,0.4)] max-w-[90%] break-words leading-snug whitespace-pre-wrap">
              {screenTranslations[currentLang as ScreenLang]?.part2}
            </div>
            <div className="text-green-500/90 self-start text-left drop-shadow-[0_0_5px_rgba(34,197,94,0.4)] max-w-[90%] break-words leading-snug whitespace-pre-wrap">
              {screenTranslations[currentLang as ScreenLang]?.part3}
            </div>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${msg.role === 'user' ? 'text-zinc-500 self-end text-right' : 'text-green-500/90 self-start text-left drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]'} max-w-[90%] break-words leading-snug whitespace-pre-wrap`}>
                {msg.role === 'ai' ? '> ' : ''}{msg.text}
              </div>
            ))}
            {currentTypingText && (
              <div className="text-green-500/90 self-start text-left drop-shadow-[0_0_5px_rgba(34,197,94,0.4)] max-w-[90%] break-words leading-snug whitespace-pre-wrap">
                {'> '}{currentTypingText}
                {isPausedAtLineEnd && <span className="animate-pulse">●</span>}
              </div>
            )}
            {(isTyping && !currentTypingText) && (
              <div className="text-cyan-500/90 self-start animate-pulse drop-shadow-[0_0_5px_rgba(6,182,212,0.4)]">
                {'>'} [TYPING...]
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="CMD_>"
            className="flex-1 bg-zinc-950 border-2 border-zinc-800 rounded-lg px-3 py-2 text-xs text-green-500 font-bold focus:outline-none focus:border-cyan-700 transition-colors placeholder:text-zinc-700 shadow-inner"
          />
          <button 
            type="submit"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg border-2 border-zinc-700 hover:border-cyan-700 hover:text-cyan-400 transition-colors text-xs font-bold uppercase active:scale-95"
          >
            TX
          </button>
        </form>
      </div>
    </div>
  );
}
