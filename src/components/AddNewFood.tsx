import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './AddNewFood.css';

export interface FoodSupply {
  id: string;
  name: string;
  emoji: string;
}

interface AddNewFoodProps {
  foods: FoodSupply[];
  onFoodsChange: (foods: FoodSupply[]) => void;
  placeholder?: string;
  compact?: boolean;
}

const AddNewFood: React.FC<AddNewFoodProps> = ({ 
  foods, 
  onFoodsChange, 
  placeholder = "Add new food item",
  compact = false 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodEmoji, setNewFoodEmoji] = useState('🥘');

  const addNewFood = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newFoodName.trim()) {
      const newFood: FoodSupply = {
        id: `custom-${Date.now()}-${newFoodName.toLowerCase().replace(/\s+/g, '-')}`,
        name: newFoodName.trim(),
        emoji: newFoodEmoji || '🥘',
      };
      onFoodsChange([...foods, newFood]);
      setNewFoodName('');
      setNewFoodEmoji('🥘');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewFoodName('');
    setNewFoodEmoji('🥘');
  };

  if (!isAdding) {
    return (
      <button 
        className={`add-food-trigger-btn ${compact ? 'compact' : ''}`}
        onClick={() => setIsAdding(true)}
      >
        + {placeholder}
      </button>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <form onSubmit={addNewFood} className={`add-food-form ${compact ? 'compact' : ''}`}>
        <div className="add-food-inputs">
          <input
            type="text"
            value={newFoodEmoji}
            onChange={(e) => setNewFoodEmoji(e.target.value)}
            className="food-emoji-input"
            placeholder="🥘"
            maxLength={2}
            onClick={(e) => e.stopPropagation()}
          />
          <input
            type="text"
            value={newFoodName}
            onChange={(e) => setNewFoodName(e.target.value)}
            placeholder={placeholder}
            className="food-name-input"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            type="submit" 
            className="save-food-btn" 
            disabled={!newFoodName.trim()}
            onClick={(e) => e.stopPropagation()}
          >
            ✓
          </button>
          <button 
            type="button" 
            className="cancel-food-btn" 
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
          >
            ×
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewFood;