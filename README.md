# Markdown Publish

Markdown Publish enables you to publish your local Markdown files as a website.

## Publish your local files

### 1. Install

```bash
npm install markdown-publish
```

### 2. Rename files you want to publish

If you want to publish `test.md`, rename it to `test@.md`. Put "@" just before the extension.

### 3. Copy local files to your project

```bash
npm run mp-sync
```

### 4. Read files from your project

```bash
// Get all files as Post.
const posts = getPosts();

// Get a file as FullPost.
const post = getPost("postId");
```

## License

MIT
