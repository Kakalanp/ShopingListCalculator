import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import './CommonFoodSupplies.css';
import initialFoods from '../data/common-foods.json';

export interface FoodSupply {
  id: string;
  name: string;
  category: string;
  emoji: string;
}

interface CommonFoodSuppliesProps {
  className?: string;
}

const CommonFoodSupplies: React.FC<CommonFoodSuppliesProps> = ({ className }) => {
  const [foods, setFoods] = useState<FoodSupply[]>(initialFoods);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Bakery', 'Pantry'])
  );
  const [isContainerCollapsed, setIsContainerCollapsed] = useState(false);

  const categories = Array.from(new Set(foods.map(food => food.category)));

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

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
            className="categories-container"
          >
            {categories.map(category => {
              const categoryFoods = foods.filter(food => food.category === category);
              const isExpanded = expandedCategories.has(category);
              
              if (categoryFoods.length === 0) return null;
              
              return (
                <div key={category} className="category-section">
                  <h3 
                    className="category-title clickable" 
                    onClick={() => toggleCategory(category)}
                  >
                    <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
                    {category} ({categoryFoods.length})
                  </h3>
                  <div className={`foods-grid ${isExpanded ? 'expanded' : 'collapsed'}`}>
                    {isExpanded && categoryFoods.map((food, index) => {
                      const globalIndex = foods.findIndex(f => f.id === food.id);
                      return (
                        <Draggable
                          key={food.id}
                          draggableId={`common-${food.id}`}
                          index={globalIndex}
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
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      </div>
    </div>
  );
};

export default CommonFoodSupplies;