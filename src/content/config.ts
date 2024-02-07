import { defineCollection, z } from 'astro:content';
import { CATEGORIES } from '../data/categories.const';

const blog = defineCollection({
	type: 'content',
	schema: ({ image }) =>
		z.object({
			title: z.string().max(80),
			titleImage: image(),
			previewImage: image(),
			// description: z.string().max(200),
			// Transform string to Date object
			publishedAt: z
				.string()
				.or(z.date())
				.transform((val: Date) => new Date(val)),
			category: z.enum(CATEGORIES),
			searchCategories: z.array(z.string()),
			personal: z.boolean()
		}),
});

export const collections = { blog };
