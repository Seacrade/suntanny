import React, { useLayoutEffect, useRef } from "react";

const ParallaxText = ({ as: Tag = "p", children, className, ...props }) => {
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;

    // Simple check to avoid double-splitting if re-renders happen
    if (element.dataset.split) return;

    // Handle mixed content (text + spans) by just processing textContent for now
    // Ideally we'd traverse nodes, but for this specific use case, we can simplify
    // or expect the user to pass plain text to this component.

    // If children is a string, we can split it safely.
    // If it's complex, we might break structure.
    // Let's assume for now we are wrapping leaf text blocks.

    const text = element.innerText;
    const words = text.split(/\s+/).filter((w) => w.length > 0);

    element.innerHTML = "";
    words.forEach((word) => {
      const span = document.createElement("span");
      span.textContent = word + "\u00A0";
      span.className =
        "word inline-block opacity-0 translate-y-8 will-change-transform";
      element.appendChild(span);
    });

    element.dataset.split = "true";
  }, [children]);

  return (
    <Tag ref={textRef} className={className} {...props}>
      {children}
    </Tag>
  );
};

export default ParallaxText;
