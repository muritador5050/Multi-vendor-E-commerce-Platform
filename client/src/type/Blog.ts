export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  excerpt: string;
  readingTime: number;
  author: string;
  tags: string[];
  published: boolean;
  publishedAt: Date;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogsResponse {
  blogs: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BlogFilters {
  published?: boolean;
  author?: string;
  tags?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateBlogData {
  title: string;
  content: string;
  image?: string;
  author: string;
  tags?: string[];
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  image?: string;
  author?: string;
  tags?: string[];
  published?: boolean;
}
