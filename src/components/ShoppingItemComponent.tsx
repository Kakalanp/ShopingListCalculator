import React, { useState } from 'react';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { ShoppingItem } from '../types/types';
import './ShoppingItemComponent.css';

interface ShoppingItemComponentProps {
  item: ShoppingItem;
  onUpdate: (id: string, updates: Partial<ShoppingItem>) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
}

const ShoppingItemComponent: React.FC<ShoppingItemComponentProps> = ({
  item,
  onUpdate,
  onDelete,
  onToggleComplete,
  dragHandleProps,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    name: item.name,
    quantity: item.quantity,
  });

  const handleSave = () => {
    onUpdate(item.id, {
      name: editValues.name,
      quantity: editValues.quantity,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      name: item.name,
      quantity: item.quantity,
    });
    setIsEditing(false);
  };

  return (
    <div className={`shopping-item ${item.completed ? 'completed' : ''}`}>
      <div className="drag-handle" {...dragHandleProps}>
        <span className="drag-icon">⋮⋮</span>
      </div>

      <div className="item-checkbox">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={() => onToggleComplete(item.id)}
        />
      </div>

      {isEditing ? (
        <div className="item-edit">
          <div className="edit-row">
            <input
              type="text"
              value={editValues.name}
              onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Item name"
              className="edit-name"
            />
            <input
              type="number"
              value={editValues.quantity}
              onChange={(e) => setEditValues(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              min="1"
              className="edit-quantity"
            />
          </div>
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="item-content">
          <div className="item-main">
            <div className="item-name">{item.name}</div>
          </div>
          <div className="item-details">
            <div className="quantity-controls">
              <button 
                onClick={() => onUpdate(item.id, { quantity: Math.max(1, item.quantity - 1) })} 
                className="quantity-btn"
                disabled={item.quantity <= 1}
              >
                −
              </button>
              <span className="quantity">{item.quantity}</span>
              <button 
                onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })} 
                className="quantity-btn"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="item-actions">
          <button 
            onClick={() => setIsEditing(true)} 
            className="edit-btn"
            title="Edit item"
          >
            ✏️
          </button>
          <button 
            onClick={() => onDelete(item.id)} 
            className="delete-btn"
            title="Delete item"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};

export default ShoppingItemComponent;