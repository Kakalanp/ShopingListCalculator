import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ShoppingItem } from '../types/types';
import ShoppingItemComponent from './ShoppingItemComponent';
import AddItemForm from './AddItemForm';
import CommonFoodSupplies, { FoodSupply } from './CommonFoodSupplies';
import RecipeList, { Recipe } from './RecipeList';
import WeeklyMeals from './WeeklyMeals';
import './ShoppingList.css';
import allRecipesData from '../data/recipes.json';
import commonFoodsData from '../data/common-foods.json';

interface ShoppingListProps {
  listName?: string;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ listName = 'My Shopping List' }) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [meals, setMeals] = useState<Recipe[]>([]);

  const addItem = useCallback((name: string, quantity: number) => {
    const newItem: ShoppingItem = {
      id: uuidv4(),
      name,
      quantity,
      completed: false,
    };
    setItems(prev => [...prev, newItem]);
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

  const handleMealsChange = useCallback((newMeals: Recipe[]) => {
    setMeals(newMeals);
    
    // Calculate all ingredients needed from current meals
    const neededIngredients: { [key: string]: number } = {};
    
    newMeals.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        neededIngredients[ingredient] = (neededIngredients[ingredient] || 0) + 1;
      });
    });

    // Update shopping list to match needed ingredients
    setItems(prev => {
      // Keep manually added items (those not from meals)
      const manualItems = prev.filter(item => !Object.keys(neededIngredients).some(ing => 
        ing.toLowerCase() === item.name.toLowerCase()
      ));
      
      // Add/update meal-based ingredients
      const mealItems = Object.entries(neededIngredients).map(([ingredientName, quantity]) => {
        const existingItem = prev.find(item => 
          item.name.toLowerCase() === ingredientName.toLowerCase()
        );
        
        if (existingItem) {
          return { ...existingItem, quantity };
        } else {
          return {
            id: uuidv4(),
            name: ingredientName,
            quantity,
            completed: false,
          };
        }
      });
      
      return [...manualItems, ...mealItems];
    });
  }, []);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    }

    // Handle drag from recipes to weekly meals
    if (result.source.droppableId === 'recipes' && result.destination.droppableId === 'weekly-meals') {
      const draggedRecipeId = result.draggableId.replace('recipe-', '');
      
      const draggedRecipe = allRecipesData.find((recipe: Recipe) => recipe.id === draggedRecipeId);
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
      
      const foodItem = commonFoodsData.find((food: FoodSupply) => food.id === draggedId);
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
  }, [items, updateItem]);

  const completedItems = items.filter(item => item.completed).length;

  return (
    <div className="shopping-list-container">
      <div className="main-content">
        <div className="header">
          <h1>{listName}</h1>
          <div className="stats">
            <span className="item-count">{completedItems}/{items.length} completed</span>
          </div>
        </div>

        <AddItemForm onAddItem={addItem} />

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

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="lists-container">
            <div className="recipes-sidebar">
              <RecipeList />
            </div>
            
            <div className="meals-sidebar">
              <WeeklyMeals meals={meals} onMealsChange={handleMealsChange} />
            </div>
            
            <div className="foods-sidebar">
              <CommonFoodSupplies />
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