import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import './RecipeList.css';

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  ingredients: string[];
}

interface RecipeListProps {
  recipes: Recipe[];
  onRecipesChange: (recipes: Recipe[]) => void;
  className?: string;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onRecipesChange, className }) => {
  const [isContainerCollapsed, setIsContainerCollapsed] = useState(false);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeEmoji, setNewRecipeEmoji] = useState('🍽️');
  const [newRecipeIngredients, setNewRecipeIngredients] = useState('');

  const deleteRecipe = (recipeId: string) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
    onRecipesChange(updatedRecipes);
  };

  const addNewRecipe = () => {
    if (newRecipeName.trim()) {
      const ingredients = newRecipeIngredients
        .split(',')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient.length > 0);
      
      const newRecipe: Recipe = {
        id: uuidv4(),
        name: newRecipeName.trim(),
        emoji: newRecipeEmoji,
        ingredients
      };
      
      const updatedRecipes = [...recipes, newRecipe];
      onRecipesChange(updatedRecipes);
      
      // Reset form
      setNewRecipeName('');
      setNewRecipeEmoji('🍽️');
      setNewRecipeIngredients('');
      setIsAddingRecipe(false);
    }
  };

  return (
    <div className={`recipe-container ${className || ''} ${isContainerCollapsed ? 'collapsed' : ''}`}>
      <div className="container-header" onClick={() => setIsContainerCollapsed(!isContainerCollapsed)}>
        <h2>Recipes</h2>
        <span className={`container-expand-icon ${isContainerCollapsed ? '' : 'expanded'}`}>◀</span>
      </div>
      
      <div className={`container-content ${isContainerCollapsed ? 'collapsed' : 'expanded'}`}>
        <p className="recipe-instruction">Drag recipes to weekly meals →</p>
        
        {!isAddingRecipe ? (
          <button 
            onClick={() => setIsAddingRecipe(true)}
            className="add-recipe-btn"
          >
            + Add New Recipe
          </button>
        ) : (
          <div className="add-recipe-form">
            <input
              type="text"
              value={newRecipeEmoji}
              onChange={(e) => setNewRecipeEmoji(e.target.value)}
              className="recipe-emoji-input"
              placeholder="🍽️"
              maxLength={2}
            />
            <input
              type="text"
              value={newRecipeName}
              onChange={(e) => setNewRecipeName(e.target.value)}
              placeholder="Recipe name"
              className="recipe-name-input"
              autoFocus
            />
            <textarea
              value={newRecipeIngredients}
              onChange={(e) => setNewRecipeIngredients(e.target.value)}
              placeholder="Ingredients (comma-separated)"
              className="recipe-ingredients-input"
              rows={3}
            />
            <div className="recipe-form-buttons">
              <button onClick={addNewRecipe} className="save-btn">Save</button>
              <button onClick={() => {
                setIsAddingRecipe(false);
                setNewRecipeName('');
                setNewRecipeEmoji('🍽️');
                setNewRecipeIngredients('');
              }} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}
        
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