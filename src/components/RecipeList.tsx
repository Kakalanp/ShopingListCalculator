import React, { useState } from 'react';
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
  selectedRecipes: string[];
  onRecipeSelect: (recipeId: string) => void;
  rainbowColors: string[];
  className?: string;
}

const RecipeList: React.FC<RecipeListProps> = ({ 
  recipes, 
  onRecipesChange, 
  selectedRecipes, 
  onRecipeSelect, 
  rainbowColors, 
  className 
}) => {
  const [isContainerCollapsed, setIsContainerCollapsed] = useState(false);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showIngredients, setShowIngredients] = useState<{[key: string]: boolean}>({});
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

  const copyRecipesJSON = async () => {
    try {
      const recipesJSON = JSON.stringify(recipes, null, 2);
      await navigator.clipboard.writeText(recipesJSON);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy recipes: ', err);
    }
  };

  const toggleIngredients = (recipeId: string) => {
    setShowIngredients(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }));
  };

  return (
    <div className={`recipe-container ${className || ''} ${isContainerCollapsed ? 'collapsed' : ''}`}>
      <div className="container-header" onClick={() => setIsContainerCollapsed(!isContainerCollapsed)}>
        <h2>Recipes</h2>
        <span className={`container-expand-icon ${isContainerCollapsed ? '' : 'expanded'}`}>◀</span>
      </div>
      
      <div className={`container-content ${isContainerCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="selected-meals-counter">
          Selected Meals: {selectedRecipes.length}/7
          {selectedRecipes.length > 0 && (
            <div className="selected-meals-preview">
              {selectedRecipes.map((recipeId, index) => {
                const recipe = recipes.find(r => r.id === recipeId);
                if (!recipe) return null;
                return (
                  <span 
                    key={recipeId} 
                    className="meal-preview"
                    style={{ color: rainbowColors[index] }}
                  >
                    {recipe.emoji} {recipe.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        
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
        
        <div className="recipes-grid expanded">
          {recipes.map((recipe, index) => {
            const isSelected = selectedRecipes.includes(recipe.id);
            const selectionIndex = selectedRecipes.indexOf(recipe.id);
            const borderColor = isSelected ? rainbowColors[selectionIndex % rainbowColors.length] : 'transparent';
            
            return (
              <div
                key={recipe.id}
                className={`recipe-item ${isSelected ? 'selected' : ''}`}
                style={{ borderColor: borderColor }}
                onClick={() => onRecipeSelect(recipe.id)}
              >
                <div className="recipe-content">
                  <span className="recipe-emoji">{recipe.emoji}</span>
                  <div className="recipe-details">
                    <div className="recipe-name">{recipe.name}</div>
                    <div 
                      className="recipe-count clickable"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleIngredients(recipe.id);
                      }}
                      title="Click to show/hide ingredients"
                    >
                      {recipe.ingredients.length} ingredients {showIngredients[recipe.id] ? '▲' : '▼'}
                    </div>
                    {showIngredients[recipe.id] && (
                      <div className="ingredients-list">
                        {recipe.ingredients.map((ingredient, idx) => (
                          <div key={idx} className="ingredient-item">
                            • {ingredient}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <div 
                    className="selection-number"
                    style={{ backgroundColor: borderColor }}
                  >
                    {selectionIndex + 1}
                  </div>
                )}
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
            );
          })}
        </div>
        
        {recipes.length > 0 && (
          <button 
            className={`copy-recipes-btn ${copySuccess ? 'success' : ''}`}
            onClick={copyRecipesJSON}
            title={copySuccess ? 'Copied!' : 'Copy recipes JSON to clipboard'}
          >
            {copySuccess ? '✓ Copied' : '📋 Export Recipes'}
          </button>
        )}
      </div>
    </div>
  );
};

export default RecipeList;