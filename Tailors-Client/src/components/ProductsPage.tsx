import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: '#P-001', name: 'Tailored Suit', category: 'Men\'s Wear', price: 299.99, stock: 15 },
    { id: '#P-002', name: 'Evening Dress', category: 'Women\'s Wear', price: 189.99, stock: 8 },
    { id: '#P-003', name: 'Casual Shirt', category: 'Men\'s Wear', price: 59.99, stock: 25 },
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Men\'s Wear',
    price: 0,
    stock: 0
  });
  
  const handleAddNew = () => {
    setShowAddForm(true);
    setEditingProduct(null);
    setNewProduct({
      name: '',
      category: 'Men\'s Wear',
      price: 0,
      stock: 0
    });
  };
  
  const handleEdit = (product: Product) => {
    setShowAddForm(true);
    setEditingProduct(product);
    setNewProduct({ ...product });
  };
  
  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...p, ...newProduct } : p
      ));
    } else {
      // Add new product
      const id = `#P-${Math.floor(1000 + Math.random() * 9000)}`;
      setProducts([...products, { id, ...newProduct as Product }]);
    }
    
    setShowAddForm(false);
    setEditingProduct(null);
  };
  
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingProduct(null);
  };
  
  return (
    <div className="card">
      <div className="card-header">
        <h3>Products</h3>
      </div>
      <div className="card-body">
        {!showAddForm ? (
          <>
            <div className="mb-3">
              <button className="btn btn-primary" onClick={handleAddNew}>Add New Product</button>
            </div>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-info me-2" 
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h4>{editingProduct ? 'Edit Product' : 'Add New Product'}</h4>
            <div className="mb-3">
              <label className="form-label">Product Name</label>
              <input 
                type="text" 
                className="form-control" 
                name="name"
                value={newProduct.name} 
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <select 
                className="form-select" 
                name="category"
                value={newProduct.category} 
                onChange={handleChange}
              >
                <option value="Men's Wear">Men's Wear</option>
                <option value="Women's Wear">Women's Wear</option>
                <option value="Accessories">Accessories</option>
                <option value="Fabrics">Fabrics</option>
              </select>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Price ($)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  name="price"
                  value={newProduct.price} 
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Stock</label>
                <input 
                  type="number" 
                  className="form-control" 
                  name="stock"
                  value={newProduct.stock} 
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>
            <div>
              <button type="submit" className="btn btn-primary me-2">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductsPage; 