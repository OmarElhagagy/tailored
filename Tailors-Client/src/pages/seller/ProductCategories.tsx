import React, { useState } from 'react';
import { Card, Button, Form, Table } from 'react-bootstrap';

interface Category {
  id: string;
  name: string;
  description: string;
  count: number;
}

const ProductCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Men\'s Wear', description: 'All men\'s clothing items', count: 12 },
    { id: '2', name: 'Women\'s Wear', description: 'All women\'s clothing items', count: 15 },
    { id: '3', name: 'Custom Suits', description: 'Tailored suits for special occasions', count: 8 },
    { id: '4', name: 'Wedding Attire', description: 'Wedding dresses and suits', count: 5 }
  ]);
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  });
  
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = (Math.max(...categories.map(c => parseInt(c.id))) + 1).toString();
    
    setCategories([
      ...categories,
      {
        id: newId,
        name: newCategory.name,
        description: newCategory.description,
        count: 0
      }
    ]);
    
    setNewCategory({ name: '', description: '' });
  };
  
  const handleEdit = (category: Category) => {
    setEditing(category.id);
    setEditForm({
      name: category.name,
      description: category.description
    });
  };
  
  const handleSaveEdit = (id: string) => {
    setCategories(categories.map(category => 
      category.id === id 
        ? { ...category, name: editForm.name, description: editForm.description } 
        : category
    ));
    setEditing(null);
  };
  
  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(category => category.id !== id));
    }
  };
  
  return (
    <div>
      <h2 className="mb-4">Product Categories</h2>
      
      <Card className="mb-4">
        <Card.Header>Add New Category</Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddCategory}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control 
                type="text" 
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
              />
            </Form.Group>
            
            <Button variant="primary" type="submit">
              Add Category
            </Button>
          </Form>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header>Categories</Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>
                    {editing === category.id ? (
                      <Form.Control 
                        type="text" 
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td>
                    {editing === category.id ? (
                      <Form.Control 
                        type="text" 
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      />
                    ) : (
                      category.description
                    )}
                  </td>
                  <td>{category.count}</td>
                  <td>
                    {editing === category.id ? (
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => handleSaveEdit(category.id)}
                      >
                        Save
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleEdit(category)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductCategories; 