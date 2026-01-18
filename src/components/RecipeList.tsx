import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import RecipeModal from './RecipeModal';
import type { Recipe } from './RecipeModal';
import './RecipeList.css';

export type { Recipe } from './RecipeModal';

interface RecipeListProps {
  recipes: Recipe[];
  onRecipesChange: (recipes: Recipe[]) => void;
  selectedRecipes: string[];
  onRecipeSelect: (recipeId: string) => void;
  rainbowColors: string[];
  foods: FoodSupply[];
  onFoodsChange: (foods: FoodSupply[]) => void;
  className?: string;
}

export interface FoodSupply {
  id: string;
  name: string;
  emoji: string;
}

const RecipeList: React.FC<RecipeListProps> = ({ 
  recipes, 
  onRecipesChange, 
  selectedRecipes, 
  onRecipeSelect, 
  rainbowColors,
  foods,
  onFoodsChange,
  className 
}) => {
  const [isContainerCollapsed, setIsContainerCollapsed] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showIngredients, setShowIngredients] = useState<{[key: string]: boolean}>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const deleteRecipe = (recipeId: string) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
    onRecipesChange(updatedRecipes);
  };

  const handleSaveRecipe = (newRecipe: Recipe) => {
    if (editingRecipe) {
      const updatedRecipes = recipes.map(recipe => 
        recipe.id === editingRecipe.id ? newRecipe : recipe
      );
      onRecipesChange(updatedRecipes);
      setEditingRecipe(null);
    } else {
      const updatedRecipes = [...recipes, newRecipe];
      onRecipesChange(updatedRecipes);
    }
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecipe(null);
  };

  const toggleIngredients = (recipeId: string) => {
    setShowIngredients(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }));
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
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="add-recipe-btn"
        >
          + Add New Recipe
        </button>
        
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
                <div className="recipe-buttons">
                  <button 
                    className="edit-recipe-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditRecipe(recipe);
                    }}
                    title="Edit recipe"
                  >
                    ✏️
                  </button>
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
      
      <RecipeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRecipe}
        foods={foods}
        onFoodsChange={onFoodsChange}
        editingRecipe={editingRecipe}
      />
    </div>
  );
};

export default RecipeList;