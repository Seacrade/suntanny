import React, { useEffect, useRef } from "react";
import { socials } from "../constants";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Link } from "react-scroll";

const Navbar = () => {
  const navRef = useRef(null);
  const linksRef = useRef([]);
  const contactRef = useRef(null);
  const topLineRef = useRef(null);
  const bottomLineRef = useRef(null);
  const tl = useRef(null);
  const iconTL = useRef(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [showBurger, setShowBurger] = React.useState(true);

  useGSAP(() => {
    gsap.set(navRef.current, { xPercent: 100 });
    gsap.set([linksRef.current, contactRef.current], { autoAlpha: 0, x: -20 });

    tl.current = gsap
      .timeline({ paused: true })
      .to(navRef.current, {
        xPercent: 0,
        duration: 1,
        ease: "power3.out",
      })
      .to(
        [linksRef.current, contactRef.current],
        {
          autoAlpha: 1,
          x: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
        },
        "<"
      )
      .to(
        contactRef.current,
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "<+0.2"
      );

    iconTL.current = gsap
      .timeline({ paused: true })
      .to(topLineRef.current, {
        rotate: 45,
        y: 3.3,
        duration: 0.5,
        ease: "power2.inOut",
      })
      .to(
        bottomLineRef.current,
        {
          rotate: -45,
          y: -3.3,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "<"
      );
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowBurger(currentScrollY <= lastScrollY || currentScrollY < 10);
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleNavbar = () => {
    if (isOpen) {
      tl.current.reverse();
      iconTL.current.reverse();
    } else {
      tl.current.play();
      iconTL.current.play();
    }
    setIsOpen(!isOpen);
  };
  return (
    <>
      <nav
        ref={navRef}
        className={`fixed z-50 flex flex-col justify-between 
            w-full h-full px-10 uppercase bg-black opacity-70 text-white/60 py-28
            gap-y-10 md:w-1/2 md:left-1/2 ${
              isOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}>
        <div className="flex flex-col text-5xl gap-y-2 md:text-6xl lg:text-8xl">
          {["home", "about", "projects", "contact"].map((section, index) => (
            <div key={index} ref={(el) => (linksRef.current[index] = el)}>
              <Link
                className="transition-all duration-300 cursor-pointer hover:text-white"
                to={`#${section}`}
                smooth
                offset={0}
                duration={200}>
                {section}
              </Link>
            </div>
          ))}
        </div>
        <div
          ref={contactRef}
          className="flex flex-col flex-wrap justify-between gap-8 md:flex-row">
          <div className="font-light">
            <p className="tracking-wider text-white/50">E-mail</p>
            <p className="text-xl tracking-widest lowercase text-pretty">
              mvt.trng@gmail.com
            </p>
          </div>
          <div className="font-light">
            <p className="tracking-wider text-white/50">social media</p>
            <p className="text-xl tracking-widest text-pretty">
              +84 123 456 789
            </p>
            <div className="flex flex-col flex-wrap md:flex-row gap-x-2">
              {socials.map((social, index) => (
                <a
                  key={index}
                  className="text-sm leading-loose tracking-widest 
                uppercase hover:text-white transition-all duration-300 cursor-pointer">
                  {"{ "}
                  {social.name}
                  {" }"}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <div
        className="fixed z-51 flex flex-col items-center 
      justify-center gap-1 transition-all duration-300 bg-black rounded-full cursor-pointer
      w-14 h-14 md:w-20 md:h-20 top-4 right-5 md:right-10 pointer-events-auto"
        onClick={toggleNavbar}
        style={
          showBurger
            ? { clipPath: "circle(50% at 50% 50%)" }
            : { clipPath: "circle(0% at 50% 50%)" }
        }>
        <span
          ref={topLineRef}
          className="block w-8 h-0.5 bg-white/80 rounded-full origin-center"></span>

        <span
          ref={bottomLineRef}
          className="block w-8 h-0.5 bg-white/80 rounded-full origin-center"></span>
      </div>
    </>
  );
};

export default Navbar;
