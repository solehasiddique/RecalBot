from flask import Flask, request, jsonify
import joblib
import json
import numpy as np
import random

app = Flask(__name__)

model = joblib.load("model.pkl")

with open("columns.json", "r") as f:
    columns = json.load(f)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json() or {}

    input_vector = np.zeros(len(columns))

    for key, value in data.items():
        if key in columns:
            input_vector[columns.index(key)] = value

    active_features = int(input_vector.sum())
    prediction = int(model.predict([input_vector])[0])

    # 🎯 Smooth percentage logic
    if prediction == 0:  # WEAK
        percentage = random.randint(25, 45)
        label = "WEAK"
    elif prediction == 1:  # MEDIUM
        percentage = random.randint(50, 75)
        label = "MEDIUM"
    else:  # STRONG
        percentage = random.randint(80, 95)
        label = "STRONG"

    # Small adjustment based on answers count
    percentage += min(active_features, 5)
    percentage = min(percentage, 98)

    return jsonify({
        "score": prediction,
        "label": label,
        "percentage": percentage,
        "active_features": active_features
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
