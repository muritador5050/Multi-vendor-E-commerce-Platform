import React, { useState } from 'react';
import { Plus, X, Package } from 'lucide-react';

const DynamicProductForm = () => {
  const [products, setProducts] = useState([
    { name: '', price: '', description: '', categoryId: '', stock: '' },
  ]);

  const [categories] = useState([
    { id: '1', name: 'Electronics' },
    { id: '2', name: 'Clothing' },
    { id: '3', name: 'Books' },
  ]);

  const addProduct = () => {
    setProducts([
      ...products,
      { name: '', price: '', description: '', categoryId: '', stock: '' },
    ]);
  };

  const removeProduct = (index) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index, field, value) => {
    const updated = products.map((product, i) =>
      i === index ? { ...product, [field]: value } : product
    );
    setProducts(updated);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.count} product(s) created successfully!`);
        // Reset form
        setProducts([
          { name: '', price: '', description: '', categoryId: '', stock: '' },
        ]);
      }
    } catch (error) {
      alert('Error creating products');
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <div className='flex items-center gap-2 mb-6'>
        <Package className='w-6 h-6 text-blue-600' />
        <h2 className='text-2xl font-bold text-gray-800'>Create Products</h2>
        <span className='ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full'>
          {products.length} product{products.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div>
        <div className='space-y-6'>
          {products.map((product, index) => (
            <div
              key={index}
              className='border border-gray-200 rounded-lg p-4 bg-gray-50'
            >
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-gray-700'>
                  Product {index + 1}
                </h3>
                {products.length > 1 && (
                  <button
                    type='button'
                    onClick={() => removeProduct(index)}
                    className='text-red-500 hover:text-red-700 p-1'
                  >
                    <X className='w-5 h-5' />
                  </button>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Product Name *
                  </label>
                  <input
                    type='text'
                    value={product.name}
                    onChange={(e) =>
                      updateProduct(index, 'name', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Price *
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={product.price}
                    onChange={(e) =>
                      updateProduct(index, 'price', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Category *
                  </label>
                  <select
                    value={product.categoryId}
                    onChange={(e) =>
                      updateProduct(index, 'categoryId', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  >
                    <option value=''>Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Stock
                  </label>
                  <input
                    type='number'
                    value={product.stock}
                    onChange={(e) =>
                      updateProduct(index, 'stock', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Description
                  </label>
                  <textarea
                    value={product.description}
                    onChange={(e) =>
                      updateProduct(index, 'description', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    rows='3'
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='flex justify-between items-center mt-6'>
          <button
            type='button'
            onClick={addProduct}
            className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors'
          >
            <Plus className='w-4 h-4' />
            Add Another Product
          </button>

          <button
            type='button'
            onClick={handleSubmit}
            className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Create {products.length} Product{products.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicProductForm;
