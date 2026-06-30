import { createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";
import type { Slide } from "~/types";

import "./swiper.css";

interface MountedSlide {
    index: number;
    position: number;
}

interface Props {
    slides: Slide[];
    startIndex?: number;
}

export default function Swiper(props: Props) {
    function init(activeIdx = 0): MountedSlide[] {
        if (props.slides.length === 0) return [];
        else {
            return [
                { index: getPrev(activeIdx), position: -1 },
                { index: activeIdx, position: 0 },
                { index: getNext(activeIdx), position: 1 },
            ];
        }
    }

    const [activeIndex, setActiveIndex] = createSignal(props.startIndex ?? 0);
    const [animatingTo, setAnimatingTo] = createSignal(-1);
    const [slides, setSlides] = createStore(init(activeIndex()));

    function getNext(idx: number) {
        if (idx >= props.slides.length - 1) return 0;
        else return idx + 1;
    }

    function getPrev(idx: number) {
        if (idx > 0) return idx - 1;
        else return props.slides.length - 1;
    }

    async function handleNavigate(goto: number, useAbsoluteDirection?: boolean) {
        if (goto === activeIndex()) return;
        if (animatingTo() !== -1) {
            handleTransitionEnd();
            await waitForNextPaint();
        }
        setAnimatingTo(goto);

        const slides_midIndex = Math.ceil(slides.length / 2) - 1;
        // const newSlideMountIndex = slides.findIndex((s) => s.index === goto);
        const active = activeIndex();

        let direction = 0;
        if (goto === getPrev(active)) {
            direction = -1;
        } else if (goto === getNext(active)) {
            direction = 1;
        }

        if (useAbsoluteDirection || !direction) {
            direction = goto > activeIndex() ? 1 : -1;
        }

        if (slides[slides_midIndex + direction]?.index !== goto) {
            setSlides(slides_midIndex + direction, {
                index: goto,
                position: direction,
            });

            // wait for the next frame to ensure that the new slide is mounted and the transition can be applied
            await waitForNextPaint();
        }

        for (let i = 0; i < slides.length; i++) {
            setSlides(i, "position", (p) => p - direction);
        }
    }

    function handleTransitionEnd(slide?: MountedSlide) {
        if (slide && slide?.position !== 0) return;

        const animating = animatingTo();
        setActiveIndex(animating);
        setSlides(init(animating));
        setAnimatingTo(-1);
    }

    function handleKbInput(e: KeyboardEvent) {
        if (e.key === "ArrowLeft") {
            handleNavigate(getPrev(activeIndex()));
        } else if (e.key === "ArrowRight") {
            handleNavigate(getNext(activeIndex()));
        } else if (e.key === "Home") {
            handleNavigate(0, true);
        } else if (e.key === "End") {
            handleNavigate(props.slides.length - 1, true);
        }
    }

    function waitForNextPaint() {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(resolve);
            });
        });
    }

    return (
        // biome-ignore lint/a11y/noStaticElementInteractions: :)
        <div class="swiper" tabindex={-1} onKeyUp={handleKbInput}>
            <div class="strip">
                <For each={slides}>
                    {(_slide) => {
                        const Slide = props.slides[_slide.index];
                        if (!Slide) throw new Error(`Unexpected error: got ${Slide} instead of a slide component`);

                        return (
                            <div
                                class="slide-wrapper"
                                style={{
                                    transition: "translate 350ms ease-in-out",
                                    // "--position": _slide.position,
                                    translate: `${_slide.position * 100}% 0`,
                                }}
                                onTransitionEnd={() => handleTransitionEnd(_slide)}
                            >
                                <div>
                                    <Slide.component index={_slide.index} isActive={_slide.index === activeIndex()} />
                                </div>
                            </div>
                        );
                    }}
                </For>
            </div>

            <div class="buttons">
                <button type="button" onClick={() => handleNavigate(getPrev(activeIndex()))}>
                    Prev
                </button>

                <div>
                    <For each={props.slides}>
                        {(_, index) => (
                            <button
                                type="button"
                                classList={{ active: index() === activeIndex() }}
                                onClick={() => handleNavigate(index(), true)}
                            >
                                {index() + 1}
                            </button>
                        )}
                    </For>
                </div>

                <button type="button" onClick={() => handleNavigate(getNext(activeIndex()))}>
                    Next
                </button>
            </div>
        </div>
    );
}
