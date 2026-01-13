import React, { useState } from 'react';
import './AddItemForm.css';

interface AddItemFormProps {
  onAddItem: (name: string, quantity: number) => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddItem(
        formData.name.trim(),
        formData.quantity
      );
      setFormData({
        name: '',
        quantity: 1,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-item-form">
      <div className="form-row">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Item name"
          className="item-name-input"
          required
        />
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
          min="1"
          className="quantity-input"
          required
        />
        <button type="submit" className="add-btn">
          Add Item
        </button>
      </div>
    </form>
  );
};

export default AddItemForm;