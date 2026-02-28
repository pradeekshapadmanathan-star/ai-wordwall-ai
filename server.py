import re

def clean_json(text):

    # Remove markdown blocks
    text = text.replace("```json", "").replace("```", "").strip()

    # Extract only JSON part
    start = text.find("{")
    end = text.rfind("}") + 1
    text = text[start:end]

    # Remove line breaks
    text = text.replace("\n", " ").replace("\r", " ")

    # Remove repeated spaces
    text = re.sub(r"\s+", " ", text)

    return text
from flask import Flask, render_template, request, jsonify
from groq import Groq
import json
import os

app = Flask(__name__)

# -----------------------------
# GROQ API KEY
# -----------------------------
# Replace with your key OR use environment variable
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# -----------------------------
# Helper function to clean AI JSON
# -----------------------------
def clean_json(text):
    text = text.replace("```json", "").replace("```", "").strip()

    start = text.find("{")
    end = text.rfind("}") + 1
    text = text[start:end]

    text = text.replace("\n", " ").replace("\r", " ")

    return text


# -----------------------------
# Home Page
# -----------------------------
@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# Generate Subtopics
# -----------------------------
@app.route("/subtopics", methods=["POST"])
def subtopics():

    topic = request.json.get("topic")

    prompt = f"""
Generate 5 educational subtopics for the topic: {topic}

Return ONLY JSON:

{{
 "subtopics":[
  "subtopic1",
  "subtopic2",
  "subtopic3",
  "subtopic4",
  "subtopic5"
 ]
}}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.choices[0].message.content
    text = clean_json(text)

    try:
        data = json.loads(text)

    except Exception:
        print("AI JSON Error:", text)

        data = {
            "subtopics":[
                "Introduction",
                "Key Concepts",
                "Methods",
                "Applications",
                "Examples"
            ]
        }

    return jsonify(data)


# -----------------------------
# Generate Games
# -----------------------------
@app.route("/games", methods=["POST"])
def games():

    subtopic = request.json.get("subtopic")

    prompt = f"""
Create educational games for the topic: {subtopic}

Return ONLY JSON.

Each section must contain exactly 5 items.

{{
 "quiz":[
  {{"question":"","options":["","","",""],"answer":"","explanation":""}},
  {{"question":"","options":["","","",""],"answer":"","explanation":""}},
  {{"question":"","options":["","","",""],"answer":"","explanation":""}},
  {{"question":"","options":["","","",""],"answer":"","explanation":""}},
  {{"question":"","options":["","","",""],"answer":"","explanation":""}}
 ],

 "match":[
  {{"left":"","right":""}},
  {{"left":"","right":""}},
  {{"left":"","right":""}},
  {{"left":"","right":""}},
  {{"left":"","right":""}}
 ],

 "drag_drop":[
  {{"item":"","category":""}},
  {{"item":"","category":""}},
  {{"item":"","category":""}},
  {{"item":"","category":""}},
  {{"item":"","category":""}}
 ]
}}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.choices[0].message.content
    text = clean_json(text)

    try:
        data = json.loads(text)

    except Exception:
        print("AI JSON Error:", text)

        data = {
            "quiz":[
                {
                    "question":"Example Question",
                    "options":["A","B","C","D"],
                    "answer":"A",
                    "explanation":"Example explanation"
                }
            ],
            "match":[
                {"left":"Example","right":"Match"}
            ],
            "drag_drop":[
                {"item":"Example","category":"Test"}
            ]
        }

    return jsonify(data)


# -----------------------------
# Run App
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)