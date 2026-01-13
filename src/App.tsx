import React from 'react';
import ShoppingList from './components/ShoppingList';
import './App.css';

function App() {
  return (
    <div className="App">
      <ShoppingList listName="My Draggable Shopping List" />
    </div>
  );
}

export default App;