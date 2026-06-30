import type { JSX } from "solid-js";

export interface Slide {
    component: (props: SlideProps) => JSX.Element;
}

export interface SlideProps {
    index: number;
    isActive: boolean;
}
