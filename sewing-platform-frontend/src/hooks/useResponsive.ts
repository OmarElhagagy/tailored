import { useEffect, useState } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsive() {
  // Initialize with desktop values
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg');

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Set current breakpoint
      if (window.innerWidth < breakpoints.sm) {
        setCurrentBreakpoint('xs');
      } else if (window.innerWidth < breakpoints.md) {
        setCurrentBreakpoint('sm');
      } else if (window.innerWidth < breakpoints.lg) {
        setCurrentBreakpoint('md');
      } else if (window.innerWidth < breakpoints.xl) {
        setCurrentBreakpoint('lg');
      } else if (window.innerWidth < breakpoints['2xl']) {
        setCurrentBreakpoint('xl');
      } else {
        setCurrentBreakpoint('2xl');
      }
    };

    // Initial calculation
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < breakpoints.md;
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg;

  const isLandscape = windowSize.width > windowSize.height;
  const isPortrait = !isLandscape;

  return {
    windowSize,
    breakpoint: currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
    breakpoints,
  };
}

export default useResponsive; 