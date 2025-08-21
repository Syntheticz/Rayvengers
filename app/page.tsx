
import Slider from "../components/slider";
import TitleSlide from "../components/slides/TitleSlide";
import StorySlide from "../components/slides/StorySlide";
import GuideSlide from "../components/slides/GuideSlide";

export default function Home() {
  const slides = [
    <TitleSlide key="title" />,
    <StorySlide key="story" />,
    <GuideSlide key="guide" />,
  ];
  return (
    <main className="min-h-screen flex flex-col items-center justify-center w-screen">
      <Slider slides={slides} />
    </main>
  );
}
