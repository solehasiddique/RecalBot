import pandas as pd

# Target column (exact as in CSV, after normalization)
TARGET_COL = "If you revise once, your memory usually becomes:"

def load_data(path):
    return pd.read_csv(path)

def clean_data(df):
    # Normalize column names
    df.columns = (
        df.columns
        .str.strip()
        .str.replace(r"\s+", " ", regex=True)
    )

    # Keywords for columns we want to DROP
    drop_keywords = [
        "name",
        "email",
        "timestamp",
        "location of school/college",
        "which subjects or topics trouble you the most"
    ]

    cols_to_drop = [
        col for col in df.columns
        if any(key in col.lower() for key in drop_keywords)
    ]

    return df.drop(columns=cols_to_drop)

def encode_target(df):
    # Normalize target values
    df[TARGET_COL] = (
        df[TARGET_COL]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    # MERGED target classes (3-class problem)
    retention_map = {
        "i forget quickly": 0,          # Weak
        "slightly better": 1,           # Medium
        "very strong": 2,               # Strong
        "i remember until exams": 2     # Strong
    }

    df[TARGET_COL] = df[TARGET_COL].map(retention_map)
    return df

def encode_features(df):
    X = df.drop(columns=[TARGET_COL])
    y = df[TARGET_COL]

    # One-hot encode categorical features
    X_encoded = pd.get_dummies(X)

    return X_encoded, y
