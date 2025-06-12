// Import necessary React hooks and types
import { useEffect, useState } from "react";
// Import Schema type from Amplify data resource
import type { Schema } from "../amplify/data/resource"; 
// Import Amplify data client generator
import { generateClient } from "aws-amplify/data";

// Create typed client for interacting with backend
const client = generateClient<Schema>();

function App() {
  // State variables to store sandwich-related data
  // Arrays to hold bread, ingredient, sauce and sandwich data from backend
  const [breads, setBreads] = useState<Array<Schema["Bread"]["type"]>>([]);
  const [ingredients, setIngredients] = useState<Array<Schema["Ingredient"]["type"]>>([]);
  const [sauces, setSauces] = useState<Array<Schema["Sauce"]["type"]>>([]);
  const [sandwiches, setSandwiches] = useState<Array<Schema["Sandwich"]["type"]>>([]);
  
  // State for tracking selected items when creating a sandwich
  const [selectedBread, setSelectedBread] = useState<string>("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedSauce, setSelectedSauce] = useState<string>("");
  const [sandwichName, setSandwichName] = useState<string>("");

  // Legacy todo state
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  // useEffect hook to load data and create sample data when component mounts
  useEffect(() => {
    // Subscribe to real-time updates for all data models
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });

    client.models.Bread.observeQuery().subscribe({
      next: async (data) => {
        setBreads([...data.items]);
        // Create sample breads if none exist
        if (data.items.length === 0) {
          await client.models.Bread.create({ name: "White Bread" });
          await client.models.Bread.create({ name: "Wheat Bread" });
          await client.models.Bread.create({ name: "Sourdough" });
        }
      }, 
    });

    client.models.Ingredient.observeQuery().subscribe({
      next: async (data) => {
        setIngredients([...data.items]);
        // Create sample ingredients if none exist
        if (data.items.length === 0) {
          await client.models.Ingredient.create({ name: "Lettuce" });
          await client.models.Ingredient.create({ name: "Tomato" });
          await client.models.Ingredient.create({ name: "Cheese" });
          await client.models.Ingredient.create({ name: "Ham" });
          await client.models.Ingredient.create({ name: "Turkey" });
        }
      },
    });

    client.models.Sauce.observeQuery().subscribe({
      next: async (data) => {
        setSauces([...data.items]);
        // Create sample sauces if none exist
        if (data.items.length === 0) {
          await client.models.Sauce.create({ name: "Mayo" });
          await client.models.Sauce.create({ name: "Mustard" });
          await client.models.Sauce.create({ name: "Ranch" });
        }
      },
    });

    client.models.Sandwich.observeQuery().subscribe({
      next: (data) => setSandwiches([...data.items]),
    });
  }, []);

  // Legacy todo creation function
  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  // Toggle ingredient selection
  function toggleIngredient(id: string) {
    if (selectedIngredients.includes(id)) {
      setSelectedIngredients(selectedIngredients.filter(item => item !== id));
    } else {
      setSelectedIngredients([...selectedIngredients, id]);
    }
  }

  // Create a new sandwich
  async function createSandwich() {
    // Validate required fields
    if (!selectedBread || selectedIngredients.length === 0 || !sandwichName) {
      alert("Please select bread, at least one ingredient, and provide a name for your sandwich");
      return;
    }

    try {
      // Create sandwich in backend
      await client.models.Sandwich.create({
        name: sandwichName,
        breadId: selectedBread,
        ingredients: selectedIngredients,
        sauceId: selectedSauce || undefined
      });
      
      // Reset form after successful creation
      setSandwichName("");
      setSelectedBread("");
      setSelectedIngredients([]);
      setSelectedSauce("");
      
      alert("Sandwich created successfully!");
    } catch (error) {
      console.error("Error creating sandwich:", error);
      alert("Failed to create sandwich");
    }
  }

  // UI rendering with styled components for sandwich creation and display
  return (
    // Main layout with sandwich creation form, list of created sandwiches,
    // and legacy todo section
  );
}

export default App;
