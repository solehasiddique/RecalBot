from utils import load_data, clean_data, encode_target, encode_features
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import pandas as pd
import numpy as np
from sklearn.tree import export_text

# Load & preprocess
df = load_data("data/raw_data.csv")
df = clean_data(df)
df = encode_target(df)
X, y = encode_features(df)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ===== FEATURE REDUCTION (same as before) =====
base_model = LogisticRegression(
    solver="lbfgs",
    max_iter=1000,
    class_weight="balanced"
)
base_model.fit(X_train, y_train)

coef_df = pd.DataFrame(base_model.coef_, columns=X.columns)
importance = coef_df.abs().mean().sort_values(ascending=False)
top_features = importance.head(75).index.tolist()

X_train = X_train[top_features]
X_test = X_test[top_features]

# ===== MODELS =====
models = {
    "Logistic Regression": LogisticRegression(
        solver="lbfgs",
        max_iter=1000,
        class_weight="balanced"
    ),
    "Decision Tree": DecisionTreeClassifier(
        max_depth=4,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=42
    ),
    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        max_depth=6,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=42
    )
}

# ===== TRAIN & COMPARE =====
print("\nMODEL COMPARISON RESULTS:\n")

for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"{name}: Accuracy = {acc:.3f}")


print("\nDECISION TREE RESULTS WITH DIFFERENT SEEDS:\n")
for seed in [0, 21, 42, 99]:
    model = DecisionTreeClassifier(
        max_depth=4,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=seed
    )
    model.fit(X_train, y_train)
    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"Seed {seed}: {acc:.3f}")


tree_rules = export_text(
    model,
    feature_names=list(X_train.columns)
)

print("\nDECISION TREE RULES:\n")
print(tree_rules)