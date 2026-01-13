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
  const handleDecrement = () => {
    if (item.quantity === 1) {
      onDelete(item.id);
    } else {
      onUpdate(item.id, { quantity: item.quantity - 1 });
    }
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

      <div className="item-content">
        <div className="item-main">
          <div className="item-name">{item.name}</div>
        </div>
        <div className="item-details">
          <div className="quantity-controls">
            <button 
              onClick={handleDecrement} 
              className="quantity-btn"
              title={item.quantity === 1 ? "Delete item" : "Decrease quantity"}
            >
              {item.quantity === 1 ? '🗑️' : '−'}
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
    </div>
  );
};

export default ShoppingItemComponent;