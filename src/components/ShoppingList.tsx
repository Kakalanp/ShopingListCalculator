import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ShoppingItem } from '../types/types';
import ShoppingItemComponent from './ShoppingItemComponent';
import CommonFoodSupplies, { FoodSupply } from './CommonFoodSupplies';
import RecipeList, { Recipe } from './RecipeList';
import NotificationSystem from './NotificationSystem';
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

const ShoppingList: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [meals, setMeals] = useState<Recipe[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyMealsSuccess, setCopyMealsSuccess] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [foods, setFoods] = useState<FoodSupply[]>(() => loadFoodsFromStorage());
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadRecipesFromStorage());

  // Rainbow colors for selected recipes (ROYGBIV)
  const rainbowColors = [
    '#FF0000', // Red
    '#FF8C00', // Orange
    '#FFD700', // Yellow
    '#32CD32', // Green
    '#1E90FF', // Blue
    '#4B0082', // Indigo
    '#8A2BE2'  // Violet
  ];

  // localStorage is now saved manually in change handlers to prevent scroll resets

  const handleFoodsChange = useCallback((newFoods: FoodSupply[]) => {
    setFoods(newFoods);
    saveFoodsToStorage(newFoods);
  }, []);

  const handleRecipesChange = useCallback((newRecipes: Recipe[]) => {
    setRecipes(newRecipes);
    saveRecipesToStorage(newRecipes);
  }, []);

  const handleModalClose = useCallback(() => {
    // Force refresh foods from localStorage when modal closes
    // This ensures new foods added in modal are visible in CommonFoodSupplies
    const refreshedFoods = loadFoodsFromStorage();
    setFoods(refreshedFoods);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<ShoppingItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const addItemFromNotification = useCallback((itemName: string) => {
    // Check if item already exists in shopping list
    const existingItem = items.find(item => item.name.toLowerCase() === itemName.toLowerCase());
    
    if (existingItem) {
      // If exists, increase quantity
      updateItem(existingItem.id, { quantity: existingItem.quantity + 1 });
    } else {
      // If doesn't exist, add new item
      const newItem: ShoppingItem = {
        id: uuidv4(),
        name: itemName,
        quantity: 1,
        completed: false,
      };
      setItems(prev => [...prev, newItem]);
    }
  }, [items, updateItem]);

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

  const toggleAllComplete = useCallback(() => {
    const allCompleted = items.length > 0 && items.every(item => item.completed);
    setItems(prev => prev.map(item => ({ ...item, completed: !allCompleted })));
  }, [items]);

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

  const copyMealList = useCallback(async () => {
    try {
      const limitedMeals = meals.slice(0, 7);
      const mealText = limitedMeals.map((meal, index) => `${index + 1}. ${meal.name}`).join('\n');
      await navigator.clipboard.writeText(mealText);
      setCopyMealsSuccess(true);
      setTimeout(() => setCopyMealsSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy meal list: ', err);
    }
  }, [meals]);

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

  const handleRecipeSelect = useCallback((recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const isSelected = selectedRecipes.includes(recipeId);
    
    if (isSelected) {
      // Remove from selection and meals
      setSelectedRecipes(prev => prev.filter(id => id !== recipeId));
      const newMeals = meals.filter(meal => meal.id !== recipeId);
      handleMealsChange(newMeals);
    } else {
      // Add to selection and meals (max 7)
      if (selectedRecipes.length < 7) {
        setSelectedRecipes(prev => [...prev, recipeId]);
        const newMeals = [...meals, recipe];
        handleMealsChange(newMeals);
      }
    }
  }, [recipes, selectedRecipes, meals, handleMealsChange]);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
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
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="lists-container">
            <div className="recipes-sidebar">
              <RecipeList 
                recipes={recipes} 
                onRecipesChange={handleRecipesChange} 
                selectedRecipes={selectedRecipes}
                onRecipeSelect={handleRecipeSelect}
                rainbowColors={rainbowColors}
                foods={foods}
                onFoodsChange={handleFoodsChange}
                onModalClose={handleModalClose}
                meals={meals}
                copyMealList={copyMealList}
                copyMealsSuccess={copyMealsSuccess}
              />
            </div>
            
            <div className="foods-sidebar">
              <CommonFoodSupplies foods={foods} onFoodsChange={handleFoodsChange} />
            </div>
            
            <div className="shopping-list-section">
              <div className="shopping-list-header">
                <div className="header-actions">
                  <div className="select-all-section">
                    <label className="select-all-label">
                      <input
                        type="checkbox"
                        checked={items.length > 0 && items.every(item => item.completed)}
                        onChange={toggleAllComplete}
                        disabled={items.length === 0}
                        className="select-all-checkbox"
                      />
                      <span className="item-count">{completedItems}/{items.length}</span>
                    </label>
                  </div>
                  <div className="copy-buttons">
                    {items.some(item => item.completed) && (
                      <button 
                        className="clear-completed-btn"
                        onClick={clearCompleted}
                        title="Eliminar artículos completados"
                      >
                        🗑️
                      </button>
                    )}
                    {items.length > 0 && (
                      <button 
                        className={`copy-btn ${copySuccess ? 'success' : ''}`}
                        onClick={copyShoppingList}
                        title={copySuccess ? '¡Copiado!' : 'Copiar lista de compras al portapapeles'}
                      >
                        {copySuccess ? '✓' : '📋'} Compras
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <Droppable droppableId="shopping-list">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`items-container ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {items.length === 0 ? (
                      <div className="empty-state">
                        <p>Tu lista de compras está vacía</p>
                        <p>Añade artículos arriba o arrástralos desde los alimentos comunes →</p>
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
      
      {/* Notification System */}
      <NotificationSystem 
        foods={foods} 
        onAddToShoppingList={addItemFromNotification}
      />
    </div>
  );
};

export default ShoppingList;