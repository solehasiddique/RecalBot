from utils import load_data, clean_data, encode_target, encode_features

df = load_data("data/raw_data.csv")
df = clean_data(df)
df = encode_target(df)

X, y = encode_features(df)

print("Features shape:", X.shape)
print("Target unique values:", sorted(y.unique()))
