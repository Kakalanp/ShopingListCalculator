import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import './RecipeList.css';

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  ingredients: string[];
  category: string;
}

const initialRecipes: Recipe[] = [
  // Breakfast
  { 
    id: 'pancakes', 
    name: 'Pancakes', 
    emoji: '🥞', 
    ingredients: ['Milk', 'Eggs', 'Butter', 'Bread'],
    category: 'Breakfast'
  },
  { 
    id: 'scrambled-eggs', 
    name: 'Scrambled Eggs', 
    emoji: '🍳', 
    ingredients: ['Eggs', 'Butter', 'Milk'],
    category: 'Breakfast'
  },
  { 
    id: 'toast', 
    name: 'Buttered Toast', 
    emoji: '🍞', 
    ingredients: ['Bread', 'Butter'],
    category: 'Breakfast'
  },

  // Lunch
  { 
    id: 'grilled-cheese', 
    name: 'Grilled Cheese', 
    emoji: '🧀', 
    ingredients: ['Bread', 'Cheese', 'Butter'],
    category: 'Lunch'
  },
  { 
    id: 'chicken-salad', 
    name: 'Chicken Salad', 
    emoji: '🥗', 
    ingredients: ['Chicken Breast', 'Lettuce', 'Tomatoes', 'Carrots'],
    category: 'Lunch'
  },
  { 
    id: 'pasta-simple', 
    name: 'Simple Pasta', 
    emoji: '🍝', 
    ingredients: ['Pasta', 'Olive Oil', 'Cheese'],
    category: 'Lunch'
  },

  // Dinner
  { 
    id: 'beef-stir-fry', 
    name: 'Beef Stir Fry', 
    emoji: '🥘', 
    ingredients: ['Ground Beef', 'Bell Peppers', 'Onions', 'Rice'],
    category: 'Dinner'
  },
  { 
    id: 'chicken-rice', 
    name: 'Chicken & Rice', 
    emoji: '🍗', 
    ingredients: ['Chicken Breast', 'Rice', 'Carrots', 'Onions'],
    category: 'Dinner'
  },

  // Snacks
  { 
    id: 'fruit-bowl', 
    name: 'Fruit Bowl', 
    emoji: '🍇', 
    ingredients: ['Apples', 'Bananas', 'Grapes', 'Oranges'],
    category: 'Snacks'
  },
  { 
    id: 'cheese-crackers', 
    name: 'Cheese & Crackers', 
    emoji: '🧀', 
    ingredients: ['Cheese', 'Bread'],
    category: 'Snacks'
  },
];

interface RecipeListProps {
  className?: string;
}

const RecipeList: React.FC<RecipeListProps> = ({ className }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Breakfast', 'Lunch', 'Dinner', 'Snacks'])
  );
  const [isContainerCollapsed, setIsContainerCollapsed] = useState(false);

  const categories = Array.from(new Set(recipes.map(recipe => recipe.category)));

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
              className="categories-container"
            >
          {categories.map(category => {
            const categoryRecipes = recipes.filter(recipe => recipe.category === category);
            const isExpanded = expandedCategories.has(category);
            
            if (categoryRecipes.length === 0) return null;
            
            return (
              <div key={category} className="category-section">
                <h3 
                  className="category-title clickable" 
                  onClick={() => toggleCategory(category)}
                >
                  <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▶</span>
                  {category} ({categoryRecipes.length})
                </h3>
                <div className={`recipes-grid ${isExpanded ? 'expanded' : 'collapsed'}`}>
                  {isExpanded && categoryRecipes.map((recipe, index) => {
                    const globalIndex = recipes.findIndex(r => r.id === recipe.id);
                    return (
                      <Draggable
                        key={recipe.id}
                        draggableId={`recipe-${recipe.id}`}
                        index={globalIndex}
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

export default RecipeList;