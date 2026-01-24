import React, { useState, useMemo } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import AddNewFood from './AddNewFood';
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
  const [copySuccess, setCopySuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter foods by search term, then sort alphabetically
  const filteredAndSortedFoods = useMemo(() => {
    const filtered = foods.filter(food => 
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [foods, searchTerm]);

  const deleteFood = (foodId: string) => {
    onFoodsChange(foods.filter(food => food.id !== foodId));
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
        <h2>Common Items</h2>
        <span className={`container-expand-icon ${isContainerCollapsed ? '' : 'expanded'}`}>◀</span>
      </div>
      
      <div className={`container-content ${isContainerCollapsed ? 'collapsed' : 'expanded'}`}>
        <p className="drag-instruction">Drag items to your shopping list</p>
        
        <div className="common-foods-controls">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search foods..."
            className="food-search-input"
          />
          
          <AddNewFood 
            foods={foods}
            onFoodsChange={onFoodsChange}
            placeholder="Add new food"
            compact={false}
          />
        </div>
        
        <Droppable droppableId="common-foods" isDropDisabled={true}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="foods-container"
            >
              <div className="foods-grid">
                {filteredAndSortedFoods.map((food, index) => (
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