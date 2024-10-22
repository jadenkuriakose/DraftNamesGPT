import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_executor import Executor
from groq import Groq

load_dotenv()

app = Flask(__name__)
CORS(app)
executor = Executor(app)

def generate_team_name(prompt):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "API key not found.", 500

    client = Groq(api_key=api_key)
    
    try:
        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {
                    "role": "user",
                    "content": "Generate a fantasy sports team name based on " + prompt + " and if prompt is not fantasy related ask for a new prompt"
                }
            ],
            temperature=1,
            max_tokens=1024,
            top_p=1,
            stream=True,
            stop=None,
        )

        team_name = ""
        for chunk in completion:
            team_name += chunk.choices[0].delta.content or ""
        
        return team_name.strip(), 200

    except Exception as e:
        return f"An error occurred: {str(e)}", 500

@app.route("/generate", methods=["POST"])
def generate_response():
    data = request.get_json()
    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({"error": "No prompt provided."}), 400

   
    future = executor.submit(generate_team_name, prompt)
    team_name, status_code = future.result()  

    if status_code == 200:
        return jsonify({"team_name": team_name})
    else:
        return jsonify({"error": team_name}), status_code

if __name__ == "__main__":
    app.run(debug=True, port=5050)

