"use client";
import React, { useEffect, useRef, useState } from "react";
import "./slider.css";

interface SliderProps {
    categories: string[];
    initialXOffset?: number;
    slideTimer?: number;
}

interface SliderState {
    currentCategory: string;
    xTransition: number;
}

export const Slider: React.FC<SliderProps> = ({ categories, initialXOffset = 0, slideTimer = 10_000 }) => {
    const [sliderState, setSliderState] = useState<SliderState>({
        currentCategory: categories[0],
        xTransition: initialXOffset,
    });
    const sliderWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentIndex = categories.indexOf(sliderState.currentCategory);
            const nextIndex = (currentIndex + 1) % categories.length;
            goToCategory(categories[nextIndex], nextIndex);
        }, slideTimer);

        return () => clearInterval(interval);
    }, [sliderState.currentCategory, categories, slideTimer]);

    const goToCategory = (destinationCategory: string, targetIndex: number) => {
        const currentIndex = categories.indexOf(sliderState.currentCategory);
        if (currentIndex === targetIndex) return;
        if (!sliderWrapperRef.current) return;

        const ulEl = sliderWrapperRef.current.children[0];
        const lis = Array.from(ulEl.children) as HTMLLIElement[];

        const screenCenterX = window.innerWidth / 2;
        const rect = lis[targetIndex].getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const dist = elementCenterX - screenCenterX;
        const newX = sliderState.xTransition + (-1 * dist);

        setSliderState(prevSliderState => 
            ({
                ...prevSliderState,
                xTransition: newX,
                currentCategory: destinationCategory,
                isDragging: false
            })
        );
    };

    return (
        <>
            <div 
                ref={sliderWrapperRef}
                style={{ transform: `translate3d(${sliderState.xTransition}px, 0, 0)` }}
                className="slider-wrapper flex items-center justify-center my-0 mx-auto"
            >
                <ul className="flex flex-row gap-10">
                    {categories.map((cat, index) =>
                        <li key={cat}>
                            <h2 onClick={() => goToCategory(cat, index)} className="whitespace-nowrap cursor-pointer">{cat}</h2>
                        </li>
                    )}
                </ul>
            </div>
        </>
    );
};

export default Slider;