import React, { useState, useMemo } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import './CommonFoodSupplies.css';
import initialFoods from '../data/common-foods.json';

export interface FoodSupply {
  id: string;
  name: string;
  emoji: string;
}

interface CommonFoodSuppliesProps {
  className?: string;
}

const CommonFoodSupplies: React.FC<CommonFoodSuppliesProps> = ({ className }) => {
  const [foods, setFoods] = useState<FoodSupply[]>(initialFoods);
  const [isContainerCollapsed, setIsContainerCollapsed] = useState(false);

  // Sort foods alphabetically by name
  const sortedFoods = useMemo(() => {
    return [...foods].sort((a, b) => a.name.localeCompare(b.name));
  }, [foods]);

  const deleteFood = (foodId: string) => {
    setFoods(prev => prev.filter(food => food.id !== foodId));
  };

  return (
    <div className={`common-foods-container ${className || ''} ${isContainerCollapsed ? 'collapsed' : ''}`}>
      <div className="container-header" onClick={() => setIsContainerCollapsed(!isContainerCollapsed)}>
        <h2>Common Foods</h2>
        <span className={`container-expand-icon ${isContainerCollapsed ? '' : 'expanded'}`}>◀</span>
      </div>
      
      <div className={`container-content ${isContainerCollapsed ? 'collapsed' : 'expanded'}`}>
        <p className="drag-instruction">Drag items to your shopping list</p>
      
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