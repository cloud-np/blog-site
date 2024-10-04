"use client";
import React, { useEffect, useRef, useState } from "react";
import "./slider.css";
import { Helpers } from "../../utils/helpers";

interface SliderProps {
    images: string[];
    categories: string[];
    initialXOffset: number;
}

export const Slider: React.FC<SliderProps> = ({ images, categories, initialXOffset }) => {
    const [currentCategory, setCurrentCategory] = useState<string>(categories[0]);
    const [xSlide, setXSlide] = useState<number>(initialXOffset);
    
    const sliderWrapperRef = useRef<HTMLDivElement>(null);

    const clickedCategory = (categoryClicked: string, targetIndex: number) => {
        const currentIndex = categories.indexOf(currentCategory);
        if (currentIndex === targetIndex) return;
        if (!sliderWrapperRef.current) return;

        const ulEl = sliderWrapperRef.current.children[0];
        const lis = Array.from(ulEl.children) as HTMLLIElement[];

        const screenCenterX = window.innerWidth / 2;
        const rect = lis[targetIndex].getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const dist = elementCenterX - screenCenterX;

        setCurrentCategory(categoryClicked);
        setXSlide(xSlide + (-1 * dist));
    }

    return (
        <>
            <div ref={sliderWrapperRef} style={{ transform: `translate3d(${xSlide}px, 0, 0)` }} className="slider-wrapper flex items-center justify-center my-0 mx-auto">
                <ul className="flex flex-row gap-10">
                    {categories.map((cat, index) =>
                        <li key={cat}>
                            <h2 onClick={() => clickedCategory(cat, index)} className="whitespace-nowrap">{cat}</h2>
                        </li>
                    )}
                </ul>
                {/* <button onClick={goToPrevious}>Previous</button>
            <button onClick={goToNext}>Next</button> */}
                {/* <img className="max-w-full h-auto" src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} /> */}
            </div>
            <h1> {currentCategory} </h1>
        </>
    );
};

export default Slider;