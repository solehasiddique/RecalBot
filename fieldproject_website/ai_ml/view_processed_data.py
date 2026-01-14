from utils import load_data, clean_data, encode_target, encode_features

df = load_data("data/raw_data.csv")
df = clean_data(df)
df = encode_target(df)

X, y = encode_features(df)

print("Features preview:")
print(X.head())

print("\nTarget preview:")
print(y.head())

print("\nFeatures shape:", X.shape)
print("Target distribution:")
print(y.value_counts())

processed_df = X.copy()
processed_df["memory_retention_score"] = y

processed_df.to_csv("data/processed_data.csv", index=False)
print("Processed data saved to data/processed_data.csv")
