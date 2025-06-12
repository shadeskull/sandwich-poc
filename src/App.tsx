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
    <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Sandwich Creator</h1>
      
      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: "8px", 
        padding: "20px",
        marginBottom: "20px" 
      }}>
        <h2>Create Your Sandwich</h2>
        
        {/* Sandwich name */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Sandwich Name:
          </label>
          <input 
            type="text" 
            value={sandwichName}
            onChange={(e) => setSandwichName(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        
        {/* Bread selection */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Select Bread:
          </label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {breads.map((bread) => (
              <div 
                key={bread.id}
                onClick={() => setSelectedBread(bread.id)}
                style={{ 
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: selectedBread === bread.id ? "#e6f7ff" : "white"
                }}
              >
                {bread.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* Ingredients selection */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Select Ingredients:
          </label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {ingredients.map((ingredient) => (
              <div 
                key={ingredient.id}
                onClick={() => toggleIngredient(ingredient.id)}
                style={{ 
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: selectedIngredients.includes(ingredient.id) ? "#e6f7ff" : "white"
                }}
              >
                {ingredient.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* Sauce selection */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Select Sauce (Optional):
          </label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {sauces.map((sauce) => (
              <div 
                key={sauce.id}
                onClick={() => setSelectedSauce(sauce.id === selectedSauce ? "" : sauce.id)}
                style={{ 
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: selectedSauce === sauce.id ? "#e6f7ff" : "white"
                }}
              >
                {sauce.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* Create button */}
        <button 
          onClick={createSandwich}
          style={{ 
            padding: "10px 20px", 
            background: "#1890ff", 
            color: "white", 
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Create Sandwich
        </button>
      </div>
      
      {/* Display created sandwiches */}
      <div>
        <h2>Your Sandwiches</h2>
        {sandwiches.length === 0 ? (
          <p>No sandwiches created yet. Create your first sandwich above!</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
            {sandwiches.map((sandwich) => {
              const breadName = breads.find(b => b.id === sandwich.breadId)?.name || "Unknown bread";
              const ingredientNames = ingredients
                .filter(i => sandwich.ingredients && sandwich.ingredients.includes(i.id))
                .map(i => i.name)
                .join(", ");
              const sauceName = sauces.find(s => s.id === sandwich.sauceId)?.name;
              
              return (
                <div 
                  key={sandwich.id}
                  style={{ 
                    border: "1px solid #ddd", 
                    borderRadius: "8px", 
                    padding: "15px",
                    background: "#f9f9f9"
                  }}
                >
                  <h3 style={{ margin: "0 0 10px 0" }}>{sandwich.name}</h3>
                  <p><strong>Bread:</strong> {breadName}</p>
                  <p><strong>Ingredients:</strong> {ingredientNames}</p>
                  {sauceName && <p><strong>Sauce:</strong> {sauceName}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Original Todo section (kept for compatibility) */}
      <div style={{ marginTop: "40px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
        <h2>My todos</h2>
        <button onClick={createTodo}>+ new</button>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.content}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}

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
    <main style={{ 
      padding: "20px", 
      maxWidth: "800px", 
      margin: "0 auto",
      height: "1000vh",
      overflowY: "auto"
    }}>
      <h1>Sandwich Creator</h1>
      
      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: "8px", 
        padding: "20px",
        marginBottom: "20px" 
      }}>
        <h2>Create Your Sandwich</h2>
        
        {/* Sandwich name */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Sandwich Name:
          </label>
          <input 
            type="text" 
            value={sandwichName}
            onChange={(e) => setSandwichName(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        
        {/* Bread selection */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Select Bread:
          </label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {breads.map((bread) => (
              <div 
                key={bread.id}
                onClick={() => setSelectedBread(bread.id)}
                style={{ 
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: selectedBread === bread.id ? "#e6f7ff" : "white"
                }}
              >
                {bread.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* Ingredients selection */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Select Ingredients:
          </label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {ingredients.map((ingredient) => (
              <div 
                key={ingredient.id}
                onClick={() => toggleIngredient(ingredient.id)}
                style={{ 
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: selectedIngredients.includes(ingredient.id) ? "#e6f7ff" : "white"
                }}
              >
                {ingredient.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* Sauce selection */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Select Sauce (Optional):
          </label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {sauces.map((sauce) => (
              <div 
                key={sauce.id}
                onClick={() => setSelectedSauce(sauce.id === selectedSauce ? "" : sauce.id)}
                style={{ 
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  background: selectedSauce === sauce.id ? "#e6f7ff" : "white"
                }}
              >
                {sauce.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* Create button */}
        <button 
          onClick={createSandwich}
          style={{ 
            padding: "10px 20px", 
            background: "#1890ff", 
            color: "white", 
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Create Sandwich
        </button>
      </div>
      
      {/* Display created sandwiches */}
      <div>
        <h2>Your Sandwiches</h2>
        {sandwiches.length === 0 ? (
          <p>No sandwiches created yet. Create your first sandwich above!</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
            {sandwiches.map((sandwich) => {
              const breadName = breads.find(b => b.id === sandwich.breadId)?.name || "Unknown bread";
              const ingredientNames = ingredients
                .filter(i => sandwich.ingredients && sandwich.ingredients.includes(i.id))
                .map(i => i.name)
                .join(", ");
              const sauceName = sauces.find(s => s.id === sandwich.sauceId)?.name;
              
              return (
                <div 
                  key={sandwich.id}
                  style={{ 
                    border: "1px solid #ddd", 
                    borderRadius: "8px", 
                    padding: "15px",
                    background: "#f9f9f9"
                  }}
                >
                  <h3 style={{ margin: "0 0 10px 0" }}>{sandwich.name}</h3>
                  <p><strong>Bread:</strong> {breadName}</p>
                  <p><strong>Ingredients:</strong> {ingredientNames}</p>
                  {sauceName && <p><strong>Sauce:</strong> {sauceName}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Original Todo section (kept for compatibility) */}
      <div style={{ marginTop: "40px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
        <h2>My todos</h2>
        <button onClick={createTodo}>+ new</button>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.content}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default App;
