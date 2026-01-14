// import React, { useEffect } from "react";
// import Lenis from "lenis";

// const SmoothScroll = ({ children }) => {
//   useEffect(() => {
//     const lenis = new Lenis({
//       duration: 1.8, // Cinematic smoothness
//       easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
//       orientation: "vertical",
//       gestureOrientation: "vertical",
//       smoothWheel: true,
//       wheelMultiplier: 1,
//       touchMultiplier: 2,
//       infinite: false,
//       lerp: 0.04, // Lower = smoother
//     });

//     let rafId;

//     const raf = (time) => {
//       lenis.raf(time);
//       rafId = requestAnimationFrame(raf);
//     };

//     rafId = requestAnimationFrame(raf);

//     return () => {
//       cancelAnimationFrame(rafId);
//       lenis.destroy();
//     };
//   }, []);

//   return <>{children}</>;
// };

// export default SmoothScroll;

import React, { useEffect } from "react";
import Lenis from "lenis";

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    // Detect if user is on mobile device
    const isMobile = window.innerWidth < 768;
    
    const lenis = new Lenis({
      duration: isMobile ? 1.2 : 1.8, // Faster on mobile for better performance
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: isMobile ? 1.5 : 1,
      touchMultiplier: 2,
      infinite: false,
      lerp: isMobile ? 0.08 : 0.04, // Less smooth on mobile = better performance
    });

    let rafId;

    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    // Handle window resize
    const handleResize = () => {
      const isMobileNow = window.innerWidth < 768;
      lenis.options.duration = isMobileNow ? 1.2 : 1.8;
      lenis.options.lerp = isMobileNow ? 0.08 : 0.04;
      lenis.options.wheelMultiplier = isMobileNow ? 1.5 : 1;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;