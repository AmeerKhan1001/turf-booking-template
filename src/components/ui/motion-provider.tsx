'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MotionConfig, Transition } from 'framer-motion';

// Motion configuration interface
interface MotionContextType {
  reducedMotion: boolean;
  duration: number;
  ease: string | number[];
  staggerDelay: number;
}

// Default motion configuration
const defaultMotionConfig: MotionContextType = {
  reducedMotion: false,
  duration: 0.3,
  ease: [0.4, 0.0, 0.2, 1], // Tailwind's ease-out
  staggerDelay: 0.1,
};

// Create motion context
const MotionContext = createContext<MotionContextType>(defaultMotionConfig);

// Custom hook to use motion context
export const useMotionConfig = () => {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error('useMotionConfig must be used within MotionProvider');
  }
  return context;
};

// Motion provider props
interface MotionProviderProps {
  children: React.ReactNode;
  reducedMotion?: boolean;
  duration?: number;
  ease?: string | number[];
  staggerDelay?: number;
}

// Motion provider component
export const MotionProvider: React.FC<MotionProviderProps> = ({
  children,
  reducedMotion: forcedReducedMotion,
  duration = defaultMotionConfig.duration,
  ease = defaultMotionConfig.ease,
  staggerDelay = defaultMotionConfig.staggerDelay,
}) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for user's reduced motion preference
  useEffect(() => {
    if (forcedReducedMotion !== undefined) {
      setReducedMotion(forcedReducedMotion);
      return;
    }

    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [forcedReducedMotion]);

  // Motion configuration based on reduced motion preference
  const motionConfig: MotionContextType = {
    reducedMotion,
    duration: reducedMotion ? 0 : duration,
    ease: reducedMotion ? 'linear' : ease,
    staggerDelay: reducedMotion ? 0 : staggerDelay,
  };

  // Framer Motion global transition settings
  const transition: Transition = {
    duration: motionConfig.duration,
    ease: motionConfig.ease,
  };

  return (
    <MotionContext.Provider value={motionConfig}>
      <MotionConfig transition={transition} reducedMotion={reducedMotion ? 'always' : 'never'}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
};