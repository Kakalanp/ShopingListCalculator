import React, { useState, useCallback } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Recipe } from './RecipeList';
import './WeeklyMeals.css';

interface WeeklyMealsProps {
  className?: string;
  meals: Recipe[];
  onMealsChange: (meals: Recipe[]) => void;
}

const WeeklyMeals: React.FC<WeeklyMealsProps> = ({ className, meals, onMealsChange }) => {
  const [isContainerCollapsed, setIsContainerCollapsed] = useState(false);

  const removeMeal = useCallback((mealIndex: number) => {
    const newMeals = meals.filter((_, index) => index !== mealIndex);
    onMealsChange(newMeals);
  }, [meals, onMealsChange]);

  return (
    <div className={`weekly-meals-container ${className || ''} ${isContainerCollapsed ? 'collapsed' : ''}`}>
      <div className="container-header" onClick={() => setIsContainerCollapsed(!isContainerCollapsed)}>
        <h2>Weekly Meals</h2>
        <span className={`container-expand-icon ${isContainerCollapsed ? '' : 'expanded'}`}>◀</span>
      </div>
      
      <div className={`container-content ${isContainerCollapsed ? 'collapsed' : 'expanded'}`}>
        <p className="meals-instruction">Drag recipes here for meal planning</p>
        
        <Droppable droppableId="weekly-meals">
          {(provided: any, snapshot: any) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`meals-container ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            >
                {meals.length === 0 ? (
                  <div className="empty-meals">
                    <p>No meals planned</p>
                    <p>Drag recipes here to plan your week</p>
                  </div>
                ) : (
                  meals.map((meal, index) => (
                    <Draggable key={`meal-${meal.id}-${index}`} draggableId={`meal-${meal.id}-${index}`} index={index}>
                    {(provided: any, snapshot: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`meal-item ${snapshot.isDragging ? 'dragging' : ''}`}
                        >
                          <div {...provided.dragHandleProps} className="drag-section">
                            <span className="drag-handle">⋮⋮</span>
                            <span className="meal-emoji">{meal.emoji}</span>
                            <div className="meal-details">
                              <div className="meal-name">{meal.name}</div>
                              <div className="meal-category">{meal.category}</div>
                              <div className="meal-ingredients">
                                {meal.ingredients.join(', ')}
                              </div>
                            </div>
                          </div>
                          <button 
                            className="remove-meal-btn"
                            onClick={() => removeMeal(index)}
                            title="Remove from meal plan"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
      </div>
    </div>
  );
};

export default WeeklyMeals;