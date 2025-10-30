from flask import Flask, request, jsonify
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
import joblib

from flask_cors import CORS
app = Flask(__name__)

CORS(app)

# Load dataset
df = pd.read_csv("soil_dataset.csv")

# Features & labels
X = df[["ph", "nitrogen", "phosphorus", "potassium"]]
y = df["crop"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a model
model = DecisionTreeClassifier(random_state=42)
model.fit(X_train, y_train)

# Save the model (optional, for reuse) 
joblib.dump(model, "soil_model.pkl")

# Rule-based fertilizer recommendation
def recommend_fertilizer(nitrogen, phosphorus, potassium):
    fertilizer = []
    if nitrogen < 50:
        fertilizer.append("Urea")
    if phosphorus < 40:
        fertilizer.append("DAP")
    if potassium < 40:
        fertilizer.append("MOP")
    if not fertilizer:
        fertilizer.append("Balanced NPK Fertilizer")
    return fertilizer

@app.route("/soilInfo", methods=["POST"])
def soil_info():
    try:
        soil_data = request.json

        required = ["ph", "nitrogen", "phosphorus", "potassium"]
        for key in required:
            if key not in soil_data:
                return jsonify({"error": f"Missing parameter: {key}"}), 400
            if soil_data[key] in ["", None]:
                return jsonify({"error": f"Invalid value for {key}"}), 400

        # ✅ Convert safely to float/int
        ph = float(soil_data["ph"])
        n = float(soil_data["nitrogen"])
        p = float(soil_data["phosphorus"])
        k = float(soil_data["potassium"])

        # ✅ Prepare input for sklearn
        input_features = pd.DataFrame([[ph, n, p, k]],
                                      columns=["ph", "nitrogen", "phosphorus", "potassium"])

        # Predict crop
        predicted_crop = model.predict(input_features)[0]

        # Recommend fertilizers
        fertilizers = recommend_fertilizer(n, p, k)

        return jsonify({
            "message": "Soil data processed successfully",
            "input": {"ph": ph, "nitrogen": n, "phosphorus": p, "potassium": k},
            "recommended_crop": predicted_crop,
            "recommended_fertilizers": fertilizers
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True, port=5000)
