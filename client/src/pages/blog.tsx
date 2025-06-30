import ProductCard from '@/components/reuseable/ProductComponentCard.tsx';
import type { Product } from '@/type/product';
import React from 'react';

function Blog() {
  // Replace this with a real product object as needed
  const dummyProduct: Product = {
    // Fill in the required ProductList fields here
    _id: '1',
    name: 'Sample Product',
    price: 23,
    images: ['http://ahfgufudsudsh'],
  };

  return (
    <div>
      <ProductCard product={dummyProduct} />
    </div>
  );
}

export default Blog;
