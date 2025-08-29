export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CategoryFormData {
  name: string;
  image?: string;
}

export interface UpdateCategoryData {
  name?: string;
  image?: string;
}
