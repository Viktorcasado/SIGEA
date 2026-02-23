"use client";

import { useState, useEffect } from 'react';

export type Platform = 'ios' | 'android' | 'desktop';

export const usePlatform = () => {
  const [platform, setPlatform] = useState<Platform>('desktop');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkPlatform = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const mobileQuery = window.matchMedia('(max-width: 1023px)').matches;
      
      if (isIos) {
        setPlatform('ios');
      } else if (isAndroid) {
        setPlatform('android');
      } else {
        setPlatform('desktop');
      }

      setIsMobile(mobileQuery || isIos || isAndroid);
    };

    checkPlatform();
    window.addEventListener('resize', checkPlatform);
    return () => window.removeEventListener('resize', checkPlatform);
  }, []);

  return { 
    platform, 
    isMobile, 
    isIos: platform === 'ios', 
    isAndroid: platform === 'android', 
    isDesktop: platform === 'desktop' 
  };
};