import React, { useState, useCallback } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Recipe } from './RecipeList';
import '../styles/globals.css';
import './WeeklyMeals.css';

interface WeeklyMealsProps {
  className?: string;
  meals: Recipe[];
  onMealsChange: (meals: Recipe[]) => void;
}

const WeeklyMeals: React.FC<WeeklyMealsProps> = ({ className, meals, onMealsChange }) => {
  const [isContainerCollapsed, setIsContainerCollapsed] = useState(false);
  const [showIngredients, setShowIngredients] = useState<{[key: string]: boolean}>({});

  // Limit meals to 7
  const limitedMeals = meals.slice(0, 7);

  const toggleIngredients = useCallback((mealId: string, index: number) => {
    const key = `${mealId}-${index}`;
    setShowIngredients(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const removeMeal = useCallback((mealIndex: number) => {
    const newMeals = meals.filter((_, index) => index !== mealIndex);
    onMealsChange(newMeals);
  }, [meals, onMealsChange]);

  return (
    <div className={`weekly-meals-container ${className || ''} ${isContainerCollapsed ? 'collapsed' : ''}`}>
      <div className="container-header">
        <h2 onClick={() => setIsContainerCollapsed(!isContainerCollapsed)}>Weekly Meals</h2>
        <div className="header-actions">
          <span 
            className={`container-expand-icon ${isContainerCollapsed ? '' : 'expanded'}`}
            onClick={() => setIsContainerCollapsed(!isContainerCollapsed)}
          >
            ◀
          </span>
        </div>
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
                {limitedMeals.length === 0 ? (
                  <div className="empty-meals">
                    <p>No meals planned</p>
                    <p>Drag recipes here to plan your week (max 7)</p>
                  </div>
                ) : (
                  limitedMeals.map((meal, index) => (
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
                              <button 
                                className="show-ingredients-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleIngredients(meal.id, index);
                                }}
                              >
                                <span className={`ingredients-arrow ${showIngredients[`${meal.id}-${index}`] ? 'expanded' : ''}`}>◀</span>
                              </button>
                              {showIngredients[`${meal.id}-${index}`] && (
                                <ul className="meal-ingredients-list">
                                  {meal.ingredients.map((ingredient, idx) => (
                                    <li key={idx}>{ingredient}</li>
                                  ))}
                                </ul>
                              )}
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