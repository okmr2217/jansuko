import fs from "fs";
import path from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

const docsDirectory = path.join(process.cwd(), "docs");

export async function getHelpContentHtml(): Promise<string> {
  const fullPath = path.join(docsDirectory, "help.md");

  const content = fs.readFileSync(fullPath, "utf8");

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkToc, { heading: "目次", maxDepth: 2 })
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(content);

  return processedContent.toString();
}
