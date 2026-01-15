import pandas as pd

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

    # Drop identity columns
    drop_keywords = ["name", "email", "timestamp"]
    cols_to_drop = [
        col for col in df.columns
        if any(key in col.lower() for key in drop_keywords)
    ]

    return df.drop(columns=cols_to_drop)

def encode_target(df):
    df[TARGET_COL] = (
        df[TARGET_COL]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    retention_map = {
        "i forget quickly": 0,
        "slightly better": 1,
        "very strong": 2,
        "i remember until exams": 3
    }

    df[TARGET_COL] = df[TARGET_COL].map(retention_map)
    return df

def encode_features(df):
    X = df.drop(columns=[TARGET_COL])
    y = df[TARGET_COL]

    X_encoded = pd.get_dummies(X)
    return X_encoded, y
