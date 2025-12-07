from sqlalchemy import inspect
from app.database import engine

inspector = inspect(engine)
columns = inspector.get_columns('trades')

with open("schema_verified.txt", "w") as f:
    f.write(f"{'Column':<20} | {'Type':<20}\n")
    f.write("-" * 40 + "\n")
    for column in columns:
        f.write(f"{column['name']:<20} | {str(column['type']):<20}\n")
