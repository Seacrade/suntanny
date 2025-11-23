import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ParallaxText = ({ as: Tag = "p", children, className, ...props }) => {
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      // Get the text content
      const text = element.innerText;
      // Split into words
      const words = text.split(/\s+/).filter((w) => w.length > 0);

      // Clear content
      element.innerHTML = "";

      // Create spans for each word
      words.forEach((word) => {
        const span = document.createElement("span");
        span.textContent = word + "\u00A0"; // Add non-breaking space
        span.style.display = "inline-block";
        span.style.willChange = "transform, opacity";
        element.appendChild(span);
      });

      const spans = element.querySelectorAll("span");

      gsap.fromTo(
        spans,
        {
          y: 100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.05,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: element,
            start: "top bottom-=10%",
            end: "bottom center+=10%",
            scrub: 1,
          },
        }
      );
    }, textRef);

    return () => ctx.revert();
  }, [children]);

  return (
    <Tag ref={textRef} className={className} {...props}>
      {children}
    </Tag>
  );
};

export default ParallaxText;
