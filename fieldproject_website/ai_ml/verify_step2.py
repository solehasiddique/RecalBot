from utils import load_data, clean_data, encode_target, encode_features

df = load_data("data/raw_data.csv")
df = clean_data(df)
df = encode_target(df)

X, y = encode_features(df)

print("Rows:", X.shape[0])
print("Features:", X.shape[1])
print("Target values:", sorted(y.unique()))
