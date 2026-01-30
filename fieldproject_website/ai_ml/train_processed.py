import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

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
        max_iter=1000,
        class_weight="balanced"
    ),

    "Decision Tree": DecisionTreeClassifier(
        max_depth=6,
        min_samples_leaf=15,
        class_weight="balanced",
        random_state=42
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        max_depth=8,
        min_samples_leaf=10,
        class_weight="balanced",
        random_state=42
    ),

    # "Gradient Boosting": GradientBoostingClassifier(
    #     n_estimators=200,
    #     max_depth=3,
    #     random_state=42
    # )
}

# ======================
# 4. Train & evaluate
# ======================
print("\nMODEL COMPARISON RESULTS (500 rows)\n")

results = []

for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    results.append((name, acc))
    print(f"{name}: Accuracy = {acc:.3f}")

# ======================
# 5. Best model
# ======================
best_model = max(results, key=lambda x: x[1])
print("\nBEST MODEL:")
print(best_model)
