// import React, { useEffect } from "react";
// import "../../index.css";

// import Navbar from "./Navbar";
// import Hero from "./Hero";
// import WhyGhost from "./WhyGhost";
// import DemoFlow from "./DemoFlow";
// import About from "./About";
// import WhoItIsFor from "./WhoItIsFor";
// import HowItWorks from "./HowItWorks";
// import Pricing from "./Pricing";
// import Footer from "./Footer";

// import SmoothScroll from "./SmoothScroll"; // adjust path if needed

// const Homee = () => {

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             entry.target.classList.add('reveal-visible');
//             observer.unobserve(entry.target);
//           }
//         });
//       },
//       { threshold: 0.15 }
//     );

//     const elements = document.querySelectorAll('.reveal-hidden');
//     elements.forEach((el) => observer.observe(el));

//     return () => observer.disconnect();
//   }, []);

//   return (
//     <SmoothScroll>
//       <div className="min-h-screen bg-black font-sans">
//         <Navbar />
//         <Hero />
//         <WhyGhost />
//         <DemoFlow />
//         <About />
//         <WhoItIsFor />
//         <HowItWorks />
//         <Pricing />
//         <Footer />
//       </div>
//     </SmoothScroll>
//   );
// };

// export default Homee;

import React, { useEffect } from "react";
import "../../index.css";

import Navbar from "./Navbar";
import Hero from "./Hero";
import WhyGhost from "./WhyGhost";
import DemoFlow from "./DemoFlow";
import About from "./About";
import WhoItIsFor from "./WhoItIsFor";
import HowItWorks from "./HowItWorks";
import Pricing from "./Pricing";
import Footer from "./Footer";

import SmoothScroll from "./SmoothScroll";

const Homee = () => {

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1, // Reduced threshold for better mobile trigger
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is in view
      }
    );

    const elements = document.querySelectorAll('.reveal-hidden');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <SmoothScroll>
      <div className="bg-black font-sans overflow-x-hidden">
        <Navbar />
        <main className="w-full">
          <Hero />
          <WhyGhost />
          <DemoFlow />
          <About />
          <WhoItIsFor />
          <HowItWorks />
          <Pricing />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
};

export default Homee;