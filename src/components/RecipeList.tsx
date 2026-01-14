import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import './RecipeList.css';
import initialRecipes from '../data/recipes.json';

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  ingredients: string[];
  category: string;
}

interface RecipeListProps {
  className?: string;
}

const RecipeList: React.FC<RecipeListProps> = ({ className }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [isContainerCollapsed, setIsContainerCollapsed] = useState(false);

  const deleteRecipe = (recipeId: string) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
  };

  return (
    <div className={`recipe-container ${className || ''} ${isContainerCollapsed ? 'collapsed' : ''}`}>
      <div className="container-header" onClick={() => setIsContainerCollapsed(!isContainerCollapsed)}>
        <h2>Recipes</h2>
        <span className={`container-expand-icon ${isContainerCollapsed ? '' : 'expanded'}`}>◀</span>
      </div>
      
      <div className={`container-content ${isContainerCollapsed ? 'collapsed' : 'expanded'}`}>
        <p className="recipe-instruction">Drag recipes to weekly meals →</p>
        
        <Droppable droppableId="recipes" isDropDisabled={true}>
          {(provided: any) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="recipes-grid expanded"
            >
              {recipes.map((recipe, index) => (
                <Draggable
                  key={recipe.id}
                  draggableId={`recipe-${recipe.id}`}
                  index={index}
                >
                  {(provided: any, snapshot: any) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`recipe-item ${snapshot.isDragging ? 'dragging' : ''}`}
                    >
                      <div className="recipe-content">
                        <span className="recipe-emoji">{recipe.emoji}</span>
                        <div className="recipe-details">
                          <div className="recipe-name">{recipe.name}</div>
                          <div className="recipe-count">{recipe.ingredients.length} items</div>
                        </div>
                      </div>
                      <button 
                        className="delete-recipe-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRecipe(recipe.id);
                        }}
                        title="Remove recipe"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default RecipeList;