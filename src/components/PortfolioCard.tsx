import { useState } from 'react';
import { motion } from 'motion/react';

interface PortfolioCardProps {
  title: string;
  description: string;
  link: string;
  accentColor: string;
  bgImage: string;
  titleStyle: string;
  isFocused?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}

export function PortfolioCard({ title, description, link, accentColor, bgImage, titleStyle, isFocused = false, onHover, onLeave }: PortfolioCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = isHovered || isFocused;

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onLeave?.();
  };

  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative flex flex-col justify-between overflow-hidden bg-zinc-950 transition-all duration-200 ease-out cursor-pointer text-left min-h-0 w-full md:h-full -mt-[4px] first:mt-0 md:mt-0 md:-ml-[4px] md:first:ml-0 scale-x-[1.01] md:scale-x-[1.02] outline-none ${isActive ? 'z-50' : 'z-0'}`}
      style={{
        boxShadow: isActive ? `0 0 40px 10px ${accentColor}40` : 'none',
      }}
      initial={{ flex: 1 }}
      animate={{ flex: isActive ? 1.4 : 1 }}
      transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 md:inset-[-25%] z-0 skew-x-0 md:skew-x-12 overflow-hidden pointer-events-none">
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ${isActive ? 'scale-110' : ''}`}
          style={{ backgroundImage: bgImage }}
        />
      </div>
      
      {/* Dark overlay */}
      <div className={`absolute inset-0 z-0 transition-colors duration-500 pointer-events-none ${isActive ? 'bg-zinc-950/40' : 'bg-zinc-950/60'}`} />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent pointer-events-none" />

      {/* Background glow effect */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${isActive ? 'opacity-10' : 'opacity-0'}`}
        style={{ background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)` }}
      />
      
      <div className="relative z-50 flex flex-col h-full p-4 md:py-12 md:px-16 lg:px-20 skew-x-0 md:skew-x-12 text-white antialiased">
        <div className="min-w-[260px] md:min-w-[320px] skew-x-0 md:-skew-x-12 origin-left pl-2 md:pl-8 lg:pl-12">
          <div className="transform-gpu backface-hidden antialiased will-change-transform w-max" style={{ transform: 'translateZ(0)' }}>
            <div className="flex items-center justify-between">
              <h2 className={`${titleStyle} text-lg md:text-2xl text-zinc-100 whitespace-nowrap transition-shadow duration-200 ease-out`} style={{ textShadow: isActive ? `0 0 15px ${accentColor}80` : 'none' }}>
                {title}
              </h2>
            </div>
          </div>
        </div>
          
        <div className="mt-auto mb-1 md:mb-6 w-full md:max-w-[70%] pl-2 md:pl-8 lg:pl-12 skew-x-0 md:-skew-x-12 origin-left">
          <div className="transform-gpu backface-hidden antialiased will-change-transform w-[220px] md:w-[260px]" style={{ transform: 'translateZ(0)' }}>
            <p className="font-mono text-[11px] md:text-xs tracking-wide text-zinc-300 uppercase leading-snug line-clamp-3 md:line-clamp-none">
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.a>
  );
}
