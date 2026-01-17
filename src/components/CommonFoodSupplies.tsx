import React, { useState, useMemo } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import './CommonFoodSupplies.css';

export interface FoodSupply {
  id: string;
  name: string;
  emoji: string;
}

interface CommonFoodSuppliesProps {
  className?: string;
  foods: FoodSupply[];
  onFoodsChange: (foods: FoodSupply[]) => void;
}

const CommonFoodSupplies: React.FC<CommonFoodSuppliesProps> = ({ className, foods, onFoodsChange }) => {
  const [isContainerCollapsed, setIsContainerCollapsed] = useState(false);
  const [isAddingFood, setIsAddingFood] = useState(false);  const [copySuccess, setCopySuccess] = useState(false);  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodEmoji, setNewFoodEmoji] = useState('🥘');

  // Sort foods alphabetically by name
  const sortedFoods = useMemo(() => {
    return [...foods].sort((a, b) => a.name.localeCompare(b.name));
  }, [foods]);

  const deleteFood = (foodId: string) => {
    onFoodsChange(foods.filter(food => food.id !== foodId));
  };

  const addNewFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFoodName.trim()) {
      const newFood: FoodSupply = {
        id: `custom-${Date.now()}-${newFoodName.toLowerCase().replace(/\s+/g, '-')}`,
        name: newFoodName.trim(),
        emoji: newFoodEmoji || '🥘',
      };
      onFoodsChange([...foods, newFood]);
      setNewFoodName('');
      setNewFoodEmoji('🥘');
      setIsAddingFood(false);
    }
  };

  const copyFoodsJSON = async () => {
    try {
      const foodsJSON = JSON.stringify(foods, null, 2);
      await navigator.clipboard.writeText(foodsJSON);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy foods: ', err);
    }
  };

  return (
    <div className={`common-foods-container ${className || ''} ${isContainerCollapsed ? 'collapsed' : ''}`}>
      <div className="container-header" onClick={() => setIsContainerCollapsed(!isContainerCollapsed)}>
        <h2>Common Foods</h2>
        <span className={`container-expand-icon ${isContainerCollapsed ? '' : 'expanded'}`}>◀</span>
      </div>
      
      <div className={`container-content ${isContainerCollapsed ? 'collapsed' : 'expanded'}`}>
        <p className="drag-instruction">Drag items to your shopping list</p>
        
        {!isAddingFood ? (
          <button 
            onClick={() => setIsAddingFood(true)}
            className="add-food-btn"
          >
            + Add New Food
          </button>
        ) : (
          <div className="add-food-form">
            <input
              type="text"
              value={newFoodEmoji}
              onChange={(e) => setNewFoodEmoji(e.target.value)}
              className="food-emoji-input"
              placeholder="🥘"
              maxLength={2}
            />
            <input
              type="text"
              value={newFoodName}
              onChange={(e) => setNewFoodName(e.target.value)}
              placeholder="Food name"
              className="food-name-input"
              autoFocus
            />
            <div className="food-form-buttons">
              <button onClick={addNewFood} className="save-btn">Save</button>
              <button onClick={() => {
                setIsAddingFood(false);
                setNewFoodName('');
                setNewFoodEmoji('🥘');
              }} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}
      
        <Droppable droppableId="common-foods" isDropDisabled={true}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="foods-container"
            >
              <div className="foods-grid">
                {sortedFoods.map((food, index) => (
                  <Draggable
                    key={food.id}
                    draggableId={`common-${food.id}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`food-item ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        <div 
                          {...provided.dragHandleProps}
                          className="drag-section"
                        >
                          <span className="food-emoji">{food.emoji}</span>
                          <div className="food-name">{food.name}</div>
                        </div>
                        <button 
                          className="delete-food-btn"
                          onClick={() => deleteFood(food.id)}
                          title="Remove from list"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        
        {foods.length > 0 && (
          <button 
            className={`copy-foods-btn ${copySuccess ? 'success' : ''}`}
            onClick={copyFoodsJSON}
            title={copySuccess ? 'Copied!' : 'Copy foods JSON to clipboard'}
          >
            {copySuccess ? '✓ Copied' : '📋 Export Foods'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CommonFoodSupplies;