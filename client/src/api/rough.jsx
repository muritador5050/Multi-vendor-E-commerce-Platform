// Fetch all products
const fetchProducts = async (params?: GetAllProductsParams): Promise<GetAllProductsResponse> => {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`/api/products?${queryString}`);
  return response.json();
};

// Create product
const createProduct = async (data: CreateProductRequest): Promise<CreateProductResponse> => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

// React component with proper typing
const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  pagination, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div>
      {products.map(product => (
        <ProductCard 
          key={product._id} 
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {pagination && (
        <div>
          Page {pagination.page} of {pagination.pages}
        </div>
      )}
    </div>
  );
};