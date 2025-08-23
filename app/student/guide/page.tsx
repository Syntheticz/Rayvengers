import Slider from "@/components/slider";
import HeroGuide1 from "@/components/slides/HeroGuide1";
import HeroGuide2 from "@/components/slides/HeroGuide2";
import HeroGuide3 from "@/components/slides/HeroGuide3";
import HeroGuide4 from "@/components/slides/HeroGuide4";
import HeroGuide5 from "@/components/slides/HeroGuide5";
export default function StudentGuide() {
  const slides = [
    <HeroGuide1 key="guide1" />,
    <HeroGuide2 key="guide2" />,
    <HeroGuide3 key="guide3" />,
    <HeroGuide4 key="guide4" />,
    <HeroGuide5 key="guide5" />
  ];
  return (
    <main className="min-h-screen flex flex-col items-center justify-center w-screen">
      <Slider slides={slides} />
    </main>
  );
}
