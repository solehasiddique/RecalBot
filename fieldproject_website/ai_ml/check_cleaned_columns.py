from utils import load_data, clean_data

df = load_data("data/raw_data.csv")
df_clean = clean_data(df)

print("\n=== COLUMNS AFTER CLEANING ===\n")
for col in df_clean.columns:
    print(f"[{col}]")
