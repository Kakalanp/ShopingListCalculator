import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ShoppingItem } from '../types/types';
import ShoppingItemComponent from './ShoppingItemComponent';
import CommonFoodSupplies, { FoodSupply } from './CommonFoodSupplies';
import RecipeList, { Recipe } from './RecipeList';
import WeeklyMeals from './WeeklyMeals';
import './ShoppingList.css';
import allRecipesData from '../data/recipes.json';
import commonFoodsData from '../data/common-foods.json';

// Local storage keys
const FOODS_STORAGE_KEY = 'shopping-app-foods';
const RECIPES_STORAGE_KEY = 'shopping-app-recipes';

// Local storage utilities
const loadFoodsFromStorage = (): FoodSupply[] => {
  try {
    const stored = localStorage.getItem(FOODS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : commonFoodsData;
  } catch {
    return commonFoodsData;
  }
};

const saveFoodsToStorage = (foods: FoodSupply[]) => {
  try {
    localStorage.setItem(FOODS_STORAGE_KEY, JSON.stringify(foods));
  } catch (error) {
    console.warn('Failed to save foods to localStorage:', error);
  }
};

const loadRecipesFromStorage = (): Recipe[] => {
  try {
    const stored = localStorage.getItem(RECIPES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : allRecipesData;
  } catch {
    return allRecipesData;
  }
};

const saveRecipesToStorage = (recipes: Recipe[]) => {
  try {
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  } catch (error) {
    console.warn('Failed to save recipes to localStorage:', error);
  }
};

interface ShoppingListProps {
  listName?: string;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ listName = 'My Shopping List' }) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [meals, setMeals] = useState<Recipe[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [foods, setFoods] = useState<FoodSupply[]>(() => loadFoodsFromStorage());
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadRecipesFromStorage());

  // Save to localStorage whenever foods or recipes change
  useEffect(() => {
    saveFoodsToStorage(foods);
  }, [foods]);

  useEffect(() => {
    saveRecipesToStorage(recipes);
  }, [recipes]);

  const handleFoodsChange = useCallback((newFoods: FoodSupply[]) => {
    setFoods(newFoods);
    // Force re-render of drag context by triggering a state update
    setItems(prev => [...prev]);
  }, []);

  const handleRecipesChange = useCallback((newRecipes: Recipe[]) => {
    setRecipes(newRecipes);
    // Force re-render of drag context by triggering a state update  
    setMeals(prev => [...prev]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<ShoppingItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  }, []);

  const clearCompleted = useCallback(() => {
    setItems(prev => prev.filter(item => !item.completed));
  }, []);

  const copyShoppingList = useCallback(async () => {
    const shoppingList = items
      .map(item => `- ${item.name}${item.quantity > 1 ? ` x ${item.quantity}` : ''}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(shoppingList);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }, [items]);

  const handleMealsChange = useCallback((newMeals: Recipe[]) => {
    // Calculate the difference in ingredients between old and new meals
    const oldIngredients: { [key: string]: number } = {};
    const newIngredients: { [key: string]: number } = {};
    
    // Count ingredients from current meals
    meals.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        oldIngredients[ingredient] = (oldIngredients[ingredient] || 0) + 1;
      });
    });
    
    // Count ingredients from new meals
    newMeals.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        newIngredients[ingredient] = (newIngredients[ingredient] || 0) + 1;
      });
    });
    
    // Update meals state
    setMeals(newMeals);
    
    // Apply the changes to shopping list
    setItems(prev => {
      const updatedItems = [...prev];
      
      // Get all unique ingredients that changed
      const allIngredients = new Set([
        ...Object.keys(oldIngredients),
        ...Object.keys(newIngredients)
      ]);
      
      allIngredients.forEach(ingredient => {
        const oldCount = oldIngredients[ingredient] || 0;
        const newCount = newIngredients[ingredient] || 0;
        const difference = newCount - oldCount;
        
        if (difference !== 0) {
          // Find existing item (case-insensitive)
          const existingIndex = updatedItems.findIndex(item => 
            item.name.toLowerCase() === ingredient.toLowerCase()
          );
          
          if (existingIndex >= 0) {
            // Update existing item quantity
            const newQuantity = updatedItems[existingIndex].quantity + difference;
            
            if (newQuantity > 0) {
              updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                quantity: newQuantity,
                name: ingredient // Use meal's exact naming
              };
            } else {
              // Remove item if quantity becomes 0 or negative
              updatedItems.splice(existingIndex, 1);
            }
          } else if (difference > 0) {
            // Add new item if it doesn't exist and we need to add it
            updatedItems.push({
              id: uuidv4(),
              name: ingredient,
              quantity: difference,
              completed: false,
            });
          }
        }
      });
      
      return updatedItems;
    });
  }, [meals]);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    }

    // Handle drag from recipes to weekly meals
    if (result.source.droppableId === 'recipes' && result.destination.droppableId === 'weekly-meals') {
      const draggedRecipeId = result.draggableId.replace('recipe-', '');
      
      const draggedRecipe = recipes.find((recipe: Recipe) => recipe.id === draggedRecipeId);
      if (draggedRecipe) {
        const newMeals = [...meals, draggedRecipe];
        handleMealsChange(newMeals);
      }
      return;
    }

    // Handle reordering within weekly meals
    if (result.source.droppableId === 'weekly-meals' && result.destination.droppableId === 'weekly-meals') {
      const newMeals = Array.from(meals);
      const [reorderedMeal] = newMeals.splice(result.source.index, 1);
      newMeals.splice(result.destination.index, 0, reorderedMeal);
      handleMealsChange(newMeals);
      return;
    }

    // Handle drag from common foods to shopping list
    if (result.source.droppableId === 'common-foods' && result.destination.droppableId === 'shopping-list') {
      const draggedId = result.draggableId.replace('common-', '');
      
      const foodItem = foods.find((food: FoodSupply) => food.id === draggedId);
      if (foodItem) {
        // Check if item already exists in shopping list
        const existingItem = items.find(item => item.name.toLowerCase() === foodItem.name.toLowerCase());
        
        if (existingItem) {
          // If exists, increase quantity
          updateItem(existingItem.id, { quantity: existingItem.quantity + 1 });
        } else {
          // If doesn't exist, add new item
          const newItem: ShoppingItem = {
            id: uuidv4(),
            name: foodItem.name,
            quantity: 1,
            completed: false,
          };
          
          const newItems = Array.from(items);
          newItems.splice(result.destination.index, 0, newItem);
          setItems(newItems);
        }
      }
      return;
    }

    // Handle reordering within shopping list
    if (result.source.droppableId === 'shopping-list' && result.destination.droppableId === 'shopping-list') {
      const newItems = Array.from(items);
      const [reorderedItem] = newItems.splice(result.source.index, 1);
      newItems.splice(result.destination.index, 0, reorderedItem);
      setItems(newItems);
    }
  }, [items, meals, foods, recipes, updateItem, handleMealsChange]);

  const completedItems = items.filter(item => item.completed).length;

  return (
    <div className="shopping-list-container">
      <div className="main-content">
        <div className="header">
          <h1>{listName}</h1>
          <div className="header-actions">
            <div className="stats">
              <span className="item-count">{completedItems}/{items.length} completed</span>
            </div>
            {items.length > 0 && (
              <button 
                className={`copy-btn ${copySuccess ? 'success' : ''}`}
                onClick={copyShoppingList}
                title={copySuccess ? 'Copied!' : 'Copy shopping list to clipboard'}
              >
                {copySuccess ? '✓' : '📋'}
              </button>
            )}
          </div>
        </div>

        <div className="actions">
          {items.some(item => item.completed) && (
            <button 
              className="clear-completed-btn"
              onClick={clearCompleted}
            >
              Clear Completed
            </button>
          )}
        </div>

        <DragDropContext 
        onDragEnd={onDragEnd}
        key={`${foods.length}-${recipes.length}`}
      >
          <div className="lists-container">
            <div className="recipes-sidebar">
              <RecipeList recipes={recipes} onRecipesChange={handleRecipesChange} />
            </div>
            
            <div className="meals-sidebar">
              <WeeklyMeals meals={meals} onMealsChange={handleMealsChange} />
            </div>
            
            <div className="foods-sidebar">
              <CommonFoodSupplies foods={foods} onFoodsChange={handleFoodsChange} />
            </div>
            
            <div className="shopping-list-section">
              <Droppable droppableId="shopping-list">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`items-container ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {items.length === 0 ? (
                      <div className="empty-state">
                        <p>Your shopping list is empty</p>
                        <p>Add items above or drag from the common foods →</p>
                      </div>
                    ) : (
                      items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`draggable-item ${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                              <ShoppingItemComponent
                                item={item}
                                onUpdate={updateItem}
                                onDelete={deleteItem}
                                onToggleComplete={toggleComplete}
                                dragHandleProps={provided.dragHandleProps}
                              />
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
        </DragDropContext>
      </div>
    </div>
  );
};

export default ShoppingList;