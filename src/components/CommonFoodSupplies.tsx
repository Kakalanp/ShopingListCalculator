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
  const [newFoodName, setNewFoodName] = useState('');
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
        
        <form onSubmit={addNewFood} className="add-food-form">
          <div className="add-food-row">
            <input
              type="text"
              value={newFoodEmoji}
              onChange={(e) => setNewFoodEmoji(e.target.value)}
              placeholder="🥘"
              className="emoji-input"
              maxLength={2}
            />
            <input
              type="text"
              value={newFoodName}
              onChange={(e) => setNewFoodName(e.target.value)}
              placeholder="Add new food item"
              className="add-food-input"
            />
            <button type="submit" className="add-food-btn">
              +
            </button>
          </div>
        </form>
      
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
      </div>
    </div>
  );
};

export default CommonFoodSupplies;