import "./app.css";
import Swiper from "./components/ui/swiper";
import type { SlideProps } from "./types";

export default function App() {
    return (
        <main>
            <Swiper
                slides={[
                    { component: ExampleSlide },
                    { component: ExampleSlide },
                    { component: ExampleSlide },
                    { component: ExampleSlide },
                    { component: ExampleSlide },
                    { component: ExampleSlide },
                    { component: ExampleSlide },
                    { component: ExampleSlide },
                    { component: ExampleSlide },
                    { component: ExampleSlide },
                    { component: ExampleSlide },
                    { component: ExampleSlide },
                    { component: ExampleSlide },
                ]}
            />
        </main>
    );
}

function ExampleSlide(props: SlideProps) {
    return (
        <div>
            <h1>Slide {props.index + 1}</h1>
            <span>isActive: {props.isActive ? "True" : "False"}</span>
        </div>
    );
}
