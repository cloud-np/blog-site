import React from 'react';
import type { ReactNode, ElementType } from 'react';

interface HeadingProps {
    id?: string;
    children: ReactNode;
    title: string;
    [key: string]: any; // For other HTML attributes
}

// Props for the base component with the 'as' prop
interface HeadingWithAnchorProps extends HeadingProps {
    as: ElementType;
}

const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/&/g, '-and-')   // Replace & with 'and'
        .replace(/[^\w\-]+/g, '') // Remove all non-word characters
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing -

};

// Base heading component with anchor functionality
export default function HeadingWithAnchor ({ as: Component, title, children, ...props }: HeadingWithAnchorProps) {
    // Create slug from children if it's simple text
    const id = props.id || slugify(title) || '';
    return (
        <Component
            id={id}
            className="group relative"
            {...props}
        >
            <a
                href={`#${id}`}
                className="
                    absolute
                    right-full
                    p-[5px_10px_5px_5px]
                    invisible
                    group-hover:visible
                    flex
                    flex-col
                    justify-center
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity
                "
                aria-hidden="true"
                tabIndex={-1}
            >#</a>
            {title}{children}
        </Component>
    );
};

export function H1(props: HeadingProps) {
    return <HeadingWithAnchor as="h1" {...props} />;
}

export function H2(props: HeadingProps) {
    return <HeadingWithAnchor as="h2" {...props} />;
}

export function H3(props: HeadingProps) {
    return <HeadingWithAnchor as="h3" {...props} />;
}

export function H4(props: HeadingProps) {
    return <HeadingWithAnchor as="h4" {...props} />;
}

export function H5(props: HeadingProps) {
    return <HeadingWithAnchor as="h5" {...props} />;
}

export function H6(props: HeadingProps) {
    return <HeadingWithAnchor as="h6" {...props} />;
}
