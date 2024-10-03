"use client";
import React, { useRef, useState } from "react";
import "./swipper.css";

interface SwipperProps {
    images: string[];
    categories: string[];
}

export const Swipper: React.FC<SwipperProps> = ({ images, categories }) => {
    const [currentCategory, setCurrentCategory] = useState<string>(categories[0]);
    const swipperWrapperRef = useRef<HTMLDivElement>(null);

    const clickedCategory = (categoryClicked: string, targetIndex: number) => {
        const currentIndex = categories.indexOf(currentCategory);
        if (currentIndex === targetIndex) return;

        setCurrentCategory(categoryClicked);
        if (!swipperWrapperRef.current) return;

        // 1) Will need to get the current translatevalue
        const regex = /translate3d\(([^,]+), ([^,]+), ([^)]+)\)/;
        const x = swipperWrapperRef.current.style.transform.match(regex)?.[1];
        // 2) Then will need to get the max widths/sizes for the children in between where clicked now
        const ulEl = swipperWrapperRef.current.children[0];

        const lis = Array.from(ulEl.children) as HTMLLIElement[];
        const elementsInBetween = currentIndex - targetIndex + 2; // +2 for to factor the 0s
        // console.log(elementsInBetween, currentIndex, index);
        const direction = elementsInBetween >= 0 ? 1 : -1;
        console.log("currentIndex", currentIndex, "targetIndex: ", targetIndex);
        for (let i = currentIndex; i < Math.abs(elementsInBetween); i++) {
            console.log("curr i: ", i);
        }
        const width = Array.from({ length: Math.abs(elementsInBetween) }).reduce((acc: number, _, i) => {
            const nonNormalIndex = currentIndex + (direction * i);
            let normalIndex = nonNormalIndex;
            if (nonNormalIndex >= categories.length) {
                normalIndex = categories.length - 1;
            } else if (nonNormalIndex < 0) {
                normalIndex = 0;
            }
            console.log("slide added: ", i);
            const ep = acc + lis[normalIndex].offsetWidth;
            return ep;
        }, 0) as number;
        console.log("ee ", direction, width);
        // 3) Based on were we clicked you add or substract the width difference
        // const widthOfElClicked = (Array.from(ulEl.children)[index] as HTMLLIElement).offsetWidth;

        // 4) Do we need to find the middle of the width of the element we are going to?
        // const ulEl = swipperWrapperRef.current.children[0];
        // const widthOfEl = (Array.from(ulEl.children)[index] as HTMLLIElement).offsetWidth;
        swipperWrapperRef.current.style.transform = `translate3d(${-1 * width}px, 0, 0)`;
    }

    return (
        <>
            <div ref={swipperWrapperRef} className="swipper-wrapper flex items-center justify-center my-0 mx-auto">
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

export default Swipper;