import { type CollectionEntry, getCollection } from "astro:content";
import readingTime from "reading-time";

// const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

export const getPosts = async (limit: number | undefined): Promise<Post[]> => {

    const rawPosts = await getCollection("blog");
    const sortedPosts = rawPosts.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())

    const posts = sortedPosts.map((rawPost, index) => {
        const postData = rawPost.data as RawPostData;
        let readingTimeMinutes = Math.floor(readingTime(rawPost.body).minutes);

        if (readingTimeMinutes < 1) {
            readingTimeMinutes = 1;
        }

        const post: Post = {
            ...postData,
            id: rawPost.id,
            slug: rawPost.slug,
            collection: rawPost.collection,
            href: getRawPostHref(rawPost),
            minutesRead: `${readingTimeMinutes}min`,
        };

        const prevPost = sortedPosts[index + 1];

        if (prevPost) {
            post.next = {
                href: getRawPostHref(prevPost),
                title: prevPost.data.title,
            }
        }

        const nextPost = sortedPosts[index - 1];

        if (nextPost) {
            post.prev = {
                href: getRawPostHref(nextPost),
                title: nextPost.data.title,
            }
        }

        return post;
    })

    if (limit) {
        return posts.slice(0, limit);
    }
    return posts;

};

const getRawPostHref = (rawPost: CollectionEntry<'blog'>): string => {
    return `/blog/${rawPost.slug}`;
};

type RawPostWithOutData = Omit<CollectionEntry<'blog'>, 'data' | 'body' | 'render'>;

interface RawPostData {
    layout: string;
    title: string;
    titleImage: LoadedImage;
    previewImage: LoadedImage;
    publishedAt: Date;
    category: string;
    searchCategories: string[];
    personal: boolean;
};

export interface Post extends RawPostData, RawPostWithOutData { 
    href: string;
    minutesRead: string;
    next?: PostLink;
    prev?: PostLink;
};

export interface PostLink {
    title: string;
    href: string;
};

export interface LoadedImage { 
    src: string;
    width: number;
    height: number;
    format: "png" | "jpg" | "jpeg" | "tiff" | "webp" | "gif" | "svg" | "avif"; 
}