import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AddNewFood, { FoodSupply } from './AddNewFood';
import './RecipeModal.css';

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  ingredients: string[];
  image?: string;
}

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  foods: FoodSupply[];
  onFoodsChange: (foods: FoodSupply[]) => void;
  editingRecipe?: Recipe | null;
}

const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  foods,
  onFoodsChange,
  editingRecipe
}) => {
  const [recipeName, setRecipeName] = useState('');
  const [recipeEmoji, setRecipeEmoji] = useState('🍽️');
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  // Initialize form with editing data
  React.useEffect(() => {
    if (editingRecipe && isOpen) {
      setRecipeName(editingRecipe.name);
      setRecipeEmoji(editingRecipe.emoji);
      setRecipeImage(editingRecipe.image || null);
      setSelectedIngredients(editingRecipe.ingredients);
    } else if (isOpen && !editingRecipe) {
      // Reset for new recipe
      setRecipeName('');
      setRecipeEmoji('🍽️');
      setRecipeImage(null);
      setSelectedIngredients([]);
      setIngredientSearch('');
    }
  }, [editingRecipe, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRecipeImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleIngredient = (ingredientName: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredientName)
        ? prev.filter(name => name !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  // Initialize form with editing data
  React.useEffect(() => {
    if (editingRecipe && isOpen) {
      setRecipeName(editingRecipe.name);
      setRecipeEmoji(editingRecipe.emoji);
      setRecipeImage(editingRecipe.image || null);
      setSelectedIngredients(editingRecipe.ingredients);
    } else if (isOpen && !editingRecipe) {
      // Reset for new recipe
      setRecipeName('');
      setRecipeEmoji('🍽️');
      setRecipeImage(null);
      setSelectedIngredients([]);
      setIngredientSearch('');
    }
  }, [editingRecipe, isOpen]);

  const handleSave = () => {
    if (recipeName.trim() && selectedIngredients.length > 0) {
      const recipe: Recipe = {
        id: editingRecipe?.id || uuidv4(),
        name: recipeName.trim(),
        emoji: recipeEmoji,
        ingredients: selectedIngredients,
        image: recipeImage || undefined
      };
      
      onSave(recipe);
      handleClose();
    }
  };

  const handleClose = () => {
    setRecipeName('');
    setRecipeEmoji('🍽️');
    setRecipeImage(null);
    setSelectedIngredients([]);
    setIngredientSearch('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Don't close modal if there are any add-food forms open
    const addFoodForms = document.querySelectorAll('.add-food-form');
    if (addFoodForms.length > 0) {
      return;
    }
    
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="recipe-modal-backdrop" onClick={handleBackdropClick}>
      <div className="recipe-modal">
        <div className="recipe-modal-header">
          <h2>{editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}</h2>
          <button className="close-modal-btn" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="recipe-modal-content">
          <div className="recipe-basic-info">
            <div className="recipe-image-section">
              <div 
                className="recipe-image-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                {recipeImage ? (
                  <img src={recipeImage} alt="Recipe" className="recipe-image-preview" />
                ) : (
                  <div className="recipe-image-placeholder">
                    <span className="upload-icon">📸</span>
                    <span className="upload-text">Add Photo</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="recipe-name-section">
              <div className="recipe-emoji-name">
                <input
                  type="text"
                  value={recipeEmoji}
                  onChange={(e) => setRecipeEmoji(e.target.value)}
                  className="recipe-emoji-input-modal"
                  placeholder="🍽️"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="Recipe name"
                  className="recipe-name-input-modal"
                  autoFocus
                />
              </div>
              
              <div className="selected-ingredients-tags">
                {selectedIngredients.length > 0 ? (
                  selectedIngredients.map((ingredient, index) => (
                    <span key={index} className="ingredient-tag">
                      {ingredient}
                      <button 
                        onClick={() => setSelectedIngredients(prev => 
                          prev.filter((_, i) => i !== index)
                        )}
                        className="remove-ingredient-tag"
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="no-ingredients-text">No ingredients selected</span>
                )}
              </div>
            </div>
          </div>

          <div className="ingredients-section-modal">
            <h3>Ingredients</h3>
            
            <input
              type="text"
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
              placeholder="Search ingredients..."
              className="ingredient-search-modal"
            />
            
            <div className="ingredients-grid">
              {filteredFoods.map(food => (
                <label key={food.id} className="ingredient-checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedIngredients.includes(food.name)}
                    onChange={() => toggleIngredient(food.name)}
                  />
                  <span className="ingredient-emoji">{food.emoji}</span>
                  <span className="ingredient-name">{food.name}</span>
                </label>
              ))}
            </div>
            
            <div className="add-new-food-section">
              <AddNewFood 
                foods={foods}
                onFoodsChange={onFoodsChange}
                placeholder="Add ingredient"
                compact={true}
              />
            </div>
          </div>
        </div>
        
        <div className="recipe-modal-footer">
          <button className="cancel-recipe-btn" onClick={handleClose}>
            Cancel
          </button>
          <button 
            className="save-recipe-btn" 
            onClick={handleSave}
            disabled={!recipeName.trim() || selectedIngredients.length === 0}
          >
            {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;