import pandas as pd
import json
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

# ======================
# 1. Load processed data
# ======================
df = pd.read_csv("data/processed_500.csv")

TARGET_COL = "revision_memory_score"

X = df.drop(columns=[TARGET_COL])
y = df[TARGET_COL]

# Convert TRUE/FALSE to 1/0
X = X.replace({True: 1, False: 0, "TRUE": 1, "FALSE": 0})

# ======================
# 2. Train-test split
# ======================
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2, 
    random_state=42,
    stratify=y
)

# ======================
# 3. Define models
# ======================
models = {
    "Logistic Regression": LogisticRegression(
        max_iter=100, #this is the no of steps the model takes to learn
        class_weight="balanced" #helps when we have imbalanced classes
    ),

    #  "Decision Tree": DecisionTreeClassifier(
    #      max_depth=6, #maximum depth of the tree and it helps to reduce complexity
    #      min_samples_leaf=15, #minimum samples required to be at a leaf node and it avoids tiny, noicy decision trees
    #      class_weight="balanced",
    #      random_state=42
    #  ),

    #  "Random Forest": RandomForestClassifier(
    #      n_estimators=300, #number of trees in the forest
    #      max_depth=6, 
    #      min_samples_leaf=15,
    #      class_weight="balanced",
    #      random_state=42
    #  )
}

# ======================
# 4. Train, evaluate, cross-validate
# ======================
print("\n===== MODEL EVALUATION RESULTS =====\n")

for name, model in models.items():
    print(f"\n--- {name} ---")

    # Train
    model.fit(X_train, y_train)

    # Predictions
    train_preds = model.predict(X_train)
    test_preds = model.predict(X_test)

    # Accuracy
    train_acc = accuracy_score(y_train, train_preds)
    test_acc = accuracy_score(y_test, test_preds)

    print(f"Train Accuracy: {train_acc:.3f}") #Training accuracy
    print(f"Test Accuracy : {test_acc:.3f}") #Testing accuracy

# Not for now 
    # # Classification report
    print("\nClassification Report (Test):")
    print(classification_report(y_test, test_preds))

    # # Confusion matrix
    # print("Confusion Matrix (Test):")
    # print(confusion_matrix(y_test, test_preds))

    # # Cross-validation
    # cv_scores = cross_val_score(
    #     model,
    #     X,
    #     y,
    #     cv=5,
    #     scoring="accuracy"
    # )

    # print("\nCross-Validation Accuracy:")
    # print(f"Mean: {cv_scores.mean():.3f}")
    # print(f"Std : {cv_scores.std():.3f}")
    # print(f"Folds: {cv_scores}")

joblib.dump(model, "model.pkl")

with open("columns.json", "w") as f:
    json.dump(list(X.columns), f)

print("columns.json saved successfully")