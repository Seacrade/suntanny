import React, { useState } from "react";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import ServiceSummary from "./sections/ServiceSummary";
import About from "./sections/About";
import Works from "./sections/Works";
import Contact from "./sections/Contact";
import { LoadingScreen } from "./components/LoadingScreen";

const App = () => {
  const [isReady, setIsReady] = useState(false);

  return (
    <div className="relative w-full min-h-screen z-10">
      <LoadingScreen started={isReady} setStarted={setIsReady} />
      <Navbar />
      <Hero />
      <ServiceSummary />
      <About />
      <Works />
      <Contact />
    </div>
  );
};

export default App;
