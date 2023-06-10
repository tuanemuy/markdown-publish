import path from "path";
import { promises as fs } from "fs";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { Post, FullPost } from "./post.js";

export * from "./post.js";

export async function getFullPost(id: string) {
  try {
    const files = (await fs.readdir("vault")).filter((file) =>
      file.includes(id)
    );

    if (files.length <= 0) {
      return null;
    }

    const file = path.resolve("vault", files[0]);
    const match = files[0].match(
      /^(?<created>[0-9]+)%(?<updated>[0-9]+)%(?<title>.+)@(?<id>.+)\.md$/
    );

    if (!match?.groups) {
      throw new Error("Unexpected Error");
    }

    const mdContent = await fs.readFile(file, { encoding: "utf8" });
    const renderer = new marked.Renderer();
    renderer.table = (header, body) => {
      if (header) header = "<thead>" + header + "</thead>";
      if (body) body = "<tbody>" + body + "</tbody>";

      return (
        '<div class="table">\n<table>\n' + header + body + "</table>\n</div>\n"
      );
    };
    marked.setOptions({ renderer });
    const content = DOMPurify.sanitize(marked.parse(mdContent));

    return FullPost.generate({
      id,
      title: match.groups.title,
      postedAt: new Date(parseInt(match.groups.created, 10)),
      updatedAt: new Date(parseInt(match.groups.updated, 10)),
      content,
    });
  } catch (e: any) {
    throw new Error(`Failed to get FullPost: ${e.message}`);
  }
}

export async function getPosts(perPage: number, page: number) {
  let posts = [];
  try {
    const files = await fs.readdir("vault");
    posts = await Promise.all(
      files
        .filter((file: string) => {
          return file.match(/^[0-9]+%[0-9]+%.+@.+\.md$/) !== null;
        })
        .map(async (file: string) => {
          const match = file.match(
            /^(?<created>[0-9]+)%(?<updated>[0-9]+)%(?<title>.+)@(?<id>.+)\.md$/
          );

          if (!match?.groups) {
            throw new Error("Unexpected Error");
          }

          return Post.generate({
            id: match.groups.id,
            title: match.groups.title,
            postedAt: new Date(parseInt(match.groups.created, 10)),
            updatedAt: new Date(parseInt(match.groups.updated, 10)),
          });
        })
    );
  } catch (e: any) {
    throw new Error(`Failed to get posts: ${e.message}`);
  }

  if (perPage < 1) {
    return posts;
  }

  return posts
    .sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1))
    .slice(perPage * (page - 1), perPage * page);
}

export async function getAllPosts() {
  return getPosts(-1, 1);
}

export function getPages(total: number, perPage: number) {
  return Math.ceil(total / perPage);
}
