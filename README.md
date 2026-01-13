# Shopping List Calculator

A draggable React shopping list application with TypeScript.

## Features

- ✅ **Drag and Drop**: Reorder items by dragging them up or down
- ✅ **Add Items**: Add new items with name, quantity, price, and optional category
- ✅ **Edit Items**: Click the edit button to modify existing items
- ✅ **Complete Items**: Check off items as you shop
- ✅ **Delete Items**: Remove items you no longer need
- ✅ **Price Calculation**: Automatic total cost calculation
- ✅ **Progress Tracking**: See how many items you've completed
- ✅ **Clear Completed**: Remove all completed items at once
- ✅ **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

## Usage

1. **Adding Items**: Fill out the form at the top with item name, optional category, quantity, and price, then click "Add Item"

2. **Dragging Items**: Click and hold the grip icon (⋮⋮) on the left side of any item to drag it to a new position

3. **Editing Items**: Click the pencil icon (✏️) to edit an item's details

4. **Completing Items**: Check the checkbox to mark items as completed

5. **Deleting Items**: Click the trash icon (🗑️) to remove an item

6. **Clearing Completed**: When you have completed items, a "Clear Completed" button will appear to remove them all at once

## Technologies Used

- **React 18** with TypeScript
- **@hello-pangea/dnd** for drag and drop functionality
- **UUID** for generating unique item IDs
- **CSS3** with modern styling and animations

## Project Structure

```
src/
├── components/
│   ├── ShoppingList.tsx       # Main shopping list component
│   ├── ShoppingList.css       # Styling for shopping list
│   ├── ShoppingItemComponent.tsx  # Individual item component
│   ├── ShoppingItemComponent.css  # Styling for items
│   ├── AddItemForm.tsx        # Form to add new items
│   └── AddItemForm.css        # Styling for form
├── types/
│   └── types.ts              # TypeScript type definitions
├── App.tsx                   # Main app component
├── App.css                   # Global app styling
└── index.tsx                # App entry point
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.