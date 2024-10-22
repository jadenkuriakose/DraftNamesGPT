import React, { useState } from 'react';
import axios from 'axios';  
import './App.css';

function App() {
  const [prompt, setPrompt] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setTeamName(""); 

    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5050/generate', { prompt });
      if (response.data && response.data.team_name) {
        setTeamName(response.data.team_name);
      } else {
        setError("Unexpected response format from the server.");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    console.error("There was an error generating the team name!", error);
    
    if (error.response) {
      const { status, data } = error.response;
      setError(`Error ${status}: ${data.error || "An unexpected error occurred."}`);
    } else if (error.request) {
      setError("No response received from the server. Please check if the server is running.");
    } else {
      setError(`Error setting up request: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>DraftNames GPT</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="prompt-input">Enter a prompt:</label>
          <input 
            id="prompt-input"
            type="text" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="Enter a prompt..." 
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </button>
        </form>
        {teamName && <p>Your fantasy team name: {teamName}</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </header>
    </div>
  );
}

export default App;
