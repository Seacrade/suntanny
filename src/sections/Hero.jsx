import AnimatedHeaderSection from "../components/AnimatedHeaderSection";
import ParticleSection from "../components/ParticleSection";
import Particles from "../components/Particles";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative flex flex-col justify-end min-h-screen pb-10">
      <AnimatedHeaderSection
        title={"Michael Truong"}
        textColor={"text-[#fcc200]"}
        titleClassName="font-migha font-bold md:!flex md:!flex-col"
        subTitle={"Portfolio by"}
        withScrollTrigger={false}
      />
      <div className="absolute bottom-10 right-10 hidden md:block">
        <AnimatedHeaderSection
          title={"Entropy"}
          textColor={"text-[#fcc200]"}
          titleClassName="font-migha font-bold !text-6xl !leading-tight md:!gap-0 !items-end"
          withScrollTrigger={false}
        />
      </div>
      <figure
        className="absolute inset-0 -z-50"
        style={{ width: "100%", height: "100%" }}>
        <ParticleSection />
      </figure>{" "}
      ;
    </section>
  );
};

export default Hero;
