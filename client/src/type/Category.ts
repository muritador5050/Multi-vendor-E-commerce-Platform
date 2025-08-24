export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CategoriesData {
  categories: Category[];
}

export interface CategoryFormData {
  name: string;
  image?: string;
}
