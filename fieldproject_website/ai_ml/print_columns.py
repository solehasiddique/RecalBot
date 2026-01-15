import pandas as pd

df = pd.read_csv("data/raw_data.csv")

for col in df.columns:
    print(f"[{col}]")
