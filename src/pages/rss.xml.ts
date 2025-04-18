import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

export async function GET(context: any) {
  const posts = await getCollection("blog");
  return rss({
    title: "Zahrawi Dental Learner | Blog",
    description: "Your source for learning about the world of dentistry.",
    site: context.site,
    stylesheet: "/pretty-feed-v3.xsl",
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      content: sanitizeHtml(parser.render(post.body || ''), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
      }),
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
