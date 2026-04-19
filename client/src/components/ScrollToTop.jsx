import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Reset window scroll immediately
    window.scrollTo(0, 0);

    // 2. A more aggressive reset using requestAnimationFrame to capture after-render state
    const resetScroll = () => {
      window.scrollTo(0, 0);
      
      // Also target the main layout containers just in case they are the scrollable element
      const scrollables = document.querySelectorAll('.main-content, .content-wrapper, .dashboard-layout');
      scrollables.forEach(el => {
        el.scrollTop = 0;
      });
    };

    const rafId = requestAnimationFrame(resetScroll);
    
    // 3. Fallback for slower renders
    const timerId = setTimeout(resetScroll, 100);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [pathname]);

  return null;
}
