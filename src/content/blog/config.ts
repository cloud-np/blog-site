import { defineCollection, z } from 'astro:content';


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
        })
})


export const collections = { blog };
