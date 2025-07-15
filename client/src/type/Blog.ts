export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  author: string;
  tags: string[];
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  relatedProducts?: any[];
}

export interface BlogsResponse {
  data: Blog[];
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
  published?: boolean;
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  image?: string;
  author?: string;
  tags?: string[];
  published?: boolean;
}
