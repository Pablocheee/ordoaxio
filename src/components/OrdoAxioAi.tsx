import React, { useState, useEffect, useRef } from 'react';

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

export function OrdoAxioAi({ 
  currentLang, 
  isTransparent = false 
}: { 
  currentLang: string; 
  isTransparent?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(isVisible);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [blink, setBlink] = useState(false);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  
  // Typing effect states
  const [textToType, setTextToType] = useState('');
  const [currentTypingText, setCurrentTypingText] = useState('');
  const [isPausedAtLineEnd, setIsPausedAtLineEnd] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  // Tamagotchi eye blink animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 220);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ASCII Faces
  const faceIdle = blink ? '/\\_/\\\n( -.- )' : '/\\_/\\\n( o.o )';
  const faceTyping = '/\\_/\\\n( >.< )';

  useEffect(() => {
    let isLocked = false;
    let lockTimeout: NodeJS.Timeout | null = null;

    const lockTransition = () => {
      isLocked = true;
      if (lockTimeout) clearTimeout(lockTimeout);
      lockTimeout = setTimeout(() => {
        isLocked = false;
      }, 550);
    };

    // Wheel handling (mouse wheel & trackpad momentum)
    const handleWheel = (e: WheelEvent) => {
      if (isLocked) return;

      const isMobile = window.innerWidth < 768;

      if (!isVisibleRef.current) {
        // On mobile, never open by background scroll events
        if (isMobile) return;

        // When closed: any deliberate scroll opens it cleanly on desktop
        if (Math.abs(e.deltaY) > 20) {
          setIsVisible(true);
          lockTransition();
        }
      } else {
        // When open: scrolling down over ANY part of the chat closes it
        if (e.deltaY > 20) {
          setIsVisible(false);
          lockTransition();
        }
      }
    };

    // Touch swipe handling
    let touchStartY = 0;
    let touchStartX = 0;
    let touchOnPager = false;
    let gestureHandled = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      const target = e.target as HTMLElement | null;
      touchOnPager = !!target?.closest('.tamagotchi-pager');
      gestureHandled = false;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY || isLocked) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - touchStartY; // positive = swipe DOWN, negative = swipe UP
      const deltaX = Math.abs(currentX - touchStartX);

      // Require primarily vertical gesture
      if (Math.abs(deltaY) < deltaX * 1.2) return;

      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // Mobile version: interactive dragging on the pager itself
        if (!touchOnPager) return;

        if (!isVisibleRef.current) {
          // While closed: pulling UP (deltaY < 0) pulls the pager out in real time!
          if (deltaY < 0) {
            if (e.cancelable) e.preventDefault();
            const clamped = Math.max(-260, deltaY);
            dragOffsetRef.current = clamped;
            setDragOffset(clamped);
            if (!isDraggingRef.current) {
              isDraggingRef.current = true;
              setIsDragging(true);
            }
          }
        } else {
          // While open: pulling DOWN (deltaY > 0) pulls the pager down in real time!
          if (deltaY > 0) {
            const target = e.target as HTMLElement | null;
            const chatMessages = target?.closest('.chat-messages') as HTMLElement | null;
            if (!chatMessages || chatMessages.scrollTop <= 0) {
              if (e.cancelable) e.preventDefault();
              const clamped = Math.min(260, deltaY);
              dragOffsetRef.current = clamped;
              setDragOffset(clamped);
              if (!isDraggingRef.current) {
                isDraggingRef.current = true;
                setIsDragging(true);
              }
            }
          }
        }
      } else {
        // Desktop behavior unchanged
        if (!isVisibleRef.current) {
          if (Math.abs(deltaY) > 30 && !gestureHandled) {
            gestureHandled = true;
            setIsVisible(true);
            lockTransition();
          }
        } else {
          if (deltaY > 30 && !gestureHandled) {
            gestureHandled = true;
            setIsVisible(false);
            lockTransition();
          }
        }
      }
    };

    const handleTouchEnd = () => {
      const isMobile = window.innerWidth < 768;

      if (isMobile && touchOnPager && isDraggingRef.current) {
        const offset = dragOffsetRef.current;
        if (!isVisibleRef.current) {
          // If pulled up by more than 40px, snap open!
          if (offset < -40) {
            setIsVisible(true);
            lockTransition();
          }
        } else {
          // If pulled down by more than 40px, snap closed!
          if (offset > 40) {
            setIsVisible(false);
            lockTransition();
          }
        }
      }

      touchStartY = 0;
      touchOnPager = false;
      gestureHandled = false;
      dragOffsetRef.current = 0;
      isDraggingRef.current = false;
      setDragOffset(0);
      setIsDragging(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!isVisibleRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-lang-toggle]') || target?.closest('.tamagotchi-pager')) {
        return;
      }
      setIsVisible(false);
      lockTransition();
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      if (lockTimeout) clearTimeout(lockTimeout);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousedown', handleClickOutside);
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
      onClick={() => {
        if (!isVisible && !isDragging) {
          setIsVisible(true);
        }
      }}
      style={{
        transform: isDragging && dragOffset !== 0
          ? isVisible
            ? `translateY(calc(-20px + ${dragOffset}px))`
            : `translateY(calc(100% - 58px + ${dragOffset}px))`
          : undefined,
        transition: isDragging ? 'none' : undefined,
      }}
      className={`tamagotchi-pager fixed bottom-0 right-4 sm:right-8 z-[1000] ${
        isDragging ? '' : 'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
      } ${
        isTransparent 
          ? 'opacity-15 hover:opacity-100 pointer-events-auto cursor-pointer' 
          : 'opacity-100'
      } ${
        isVisible 
          ? 'translate-y-[-20px] sm:translate-y-[-24px]' 
          : 'translate-y-[calc(100%-58px)] cursor-pointer'
      }`}
    >
      {/* Tamagotchi / Pager Casing */}
      <div 
        className={`w-72 sm:w-80 bg-zinc-900 border-[3px] border-zinc-800 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.1)] flex flex-col gap-4 font-mono relative ${
          !isVisible ? 'cursor-pointer hover:border-cyan-700/60 transition-colors' : ''
        }`}
      >
        {/* Antenna decoration */}
        <div className="absolute -top-[3px] right-6 -translate-y-full flex flex-col items-center pointer-events-none">
          <div className="w-2 h-6 bg-zinc-800 rounded-t-full border-x border-t border-zinc-700 -mb-px" />
          <div className="w-6 h-3 bg-zinc-800 rounded-t-md border-x border-t border-zinc-700" />
        </div>
        
        {/* LCD Screen */}
        <div className="bg-[#051008] border-4 border-zinc-950 rounded-xl p-3 h-56 flex flex-col relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
          {/* CRT Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 z-10" />
          
          {/* AI Face Header */}
          <div 
            onClick={(e) => {
              if (isVisible) {
                e.stopPropagation();
                setIsVisible(false);
              }
            }}
            className={`text-cyan-500/80 whitespace-pre text-center text-xs leading-tight mb-3 transition-all duration-200 select-none ${
              isVisible ? 'cursor-pointer hover:text-cyan-300' : ''
            }`}
            title={isVisible ? (currentLang === 'RU' ? 'Нажмите или смахните вниз, чтобы свернуть' : 'Click or swipe down to minimize') : undefined}
          >
            {isTyping ? faceTyping : faceIdle}
          </div>
          
          {/* Chat Area */}
          <div className={`chat-messages flex-1 overflow-y-auto flex flex-col gap-2 text-[10px] sm:text-xs z-20 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-opacity duration-300 ${!isVisible ? 'opacity-0' : 'opacity-100'}`}>
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
        <form onSubmit={handleSend} className={`flex gap-2 transition-opacity duration-300 ${!isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
