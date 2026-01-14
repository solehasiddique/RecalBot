import pandas as pd

TARGET_COL = "After studying once, how long do you remember the content without revision?  "

def load_data(path):
    return pd.read_csv(path)

def clean_data(df):
    # Drop identity / leakage columns
    drop_cols = ["Timestamp", "Email", "Name"]
    df = df.drop(columns=[c for c in drop_cols if c in df.columns])

    return df

def encode_target(df):
    retention_map = {
        "A few hours": 0,
        "One day": 1,
        "Two to three days": 2,
        "A week or more": 3
    }

    df[TARGET_COL] = df[TARGET_COL].map(retention_map)
    return df


def encode_features(df):
    X = df.drop(columns=[TARGET_COL])
    X_encoded = pd.get_dummies(X)

    y = df[TARGET_COL]

    return X_encoded, y
