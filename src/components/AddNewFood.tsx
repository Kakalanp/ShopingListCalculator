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
  placeholder = "Añadir nuevo Artículo",
  compact = false 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodEmoji, setNewFoodEmoji] = useState('🥘');

  const addNewFood = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();

    }
    if (newFoodName.trim()) {
      const newFood: FoodSupply = {
        id: `custom-${Date.now()}-${newFoodName.toLowerCase().replace(/\s+/g, '-')}`,
        name: newFoodName.trim(),
        emoji: newFoodEmoji || '🥘',
      };
      // Use setTimeout to prevent re-render issues
      setTimeout(() => {
        onFoodsChange([...foods, newFood]);
      }, 0);
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
    <div onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
    }}>
      <div className={`add-food-form ${compact ? 'compact' : ''}`}>
        <div className="add-food-inputs">
          <input
            type="text"
            value={newFoodEmoji}
            onChange={(e) => {
              e.stopPropagation();
              setNewFoodEmoji(e.target.value);
            }}
            className="food-emoji-input"
            placeholder="🥘"
            maxLength={2}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
          <input
            type="text"
            value={newFoodName}
            onChange={(e) => {
              e.stopPropagation();
              setNewFoodName(e.target.value);
            }}
            placeholder={placeholder}
            className="food-name-input"
            autoFocus
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                e.preventDefault();
                addNewFood(e);
              }
            }}
          />
          <button 
            type="button" 
            className="save-food-btn" 
            disabled={!newFoodName.trim()}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              addNewFood(e);
            }}
          >
            ✓
          </button>
          <button 
            type="button" 
            className="cancel-food-btn" 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleCancel();
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewFood;