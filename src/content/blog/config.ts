import { defineCollection, z } from 'astro:content';
import { CATEGORIES } from '../../data/categories.const.ts';


const blog = defineCollection({
    schema: ({ image }) =>
        z.object({ 
            title: z.string().max(80),
            description: z.string().max(200),
            // Transform string to Date object
            pubDate: z
            .string()
            .or(z.date())
            .transform((val: Date) => new Date(val)),
            heroImage: image(),
            category: z.enum(CATEGORIES),
        })
})


export const collections = { blog };
