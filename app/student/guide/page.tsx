import Slider from "@/components/slider";
import HeroGuide1 from "@/components/slides/HeroGuide1";
import HeroGuide2 from "@/components/slides/HeroGuide2";
export default function StudentGuide() {
  const slides = [
    <HeroGuide1 key="guide1" />,
    <HeroGuide2 key="guide2" />
  ];
  return (
    <main className="min-h-screen flex flex-col items-center justify-center w-screen">
      <Slider slides={slides} />
    </main>
  );
}
