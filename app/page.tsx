import Slider from "@/components/slider";
import FirstPage from "@/components/slides/first-page";

export default function Home() {
  const slides = [
    <FirstPage key={1} />,
    <div className="p-10 bg-green-200 rounded-lg" key={2}>
      Slide 2: About
    </div>,
    <div className="p-10 bg-pink-200 rounded-lg" key={3}>
      Slide 3: Contact
    </div>,
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <Slider slides={slides} />
    </main>
  );
}
