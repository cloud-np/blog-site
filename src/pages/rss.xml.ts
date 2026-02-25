import rss from "@astrojs/rss";
import { getPosts, generateSlug } from "../libs/post";
import { settings } from "../i18n/settings.const";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
	const posts = await getPosts(undefined);
	const publicPosts = posts.filter(post => !post.data.personal);

	return rss({
		title: settings.title.en,
		description: settings.description.en,
		site: context.site ?? "www.cloud-np.com",
		items: publicPosts.map(post => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishedAt,
			link: `/blog/${generateSlug(post.data.title)}/`,
		})),
	});
}
