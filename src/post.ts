export type GeneratePostOptions = {
  id: string;
  title: string;
  postedAt: Date;
  updatedAt: Date;
};

export class Post {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly postedAt: Date,
    public readonly updatedAt: Date
  ) {}

  static generate({
    id,
    title,
    postedAt,
    updatedAt,
  }: GeneratePostOptions): Post {
    return new Post(id, title, postedAt, updatedAt);
  }
}

export type GenerateFullPostOptions = {
  id: string;
  title: string;
  content: string;
  postedAt: Date;
  updatedAt: Date;
};

export class FullPost {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly postedAt: Date,
    public readonly updatedAt: Date
  ) {}

  static generate({
    id,
    title,
    content,
    postedAt,
    updatedAt,
  }: GenerateFullPostOptions): FullPost {
    return new FullPost(id, title, content, postedAt, updatedAt);
  }
}
