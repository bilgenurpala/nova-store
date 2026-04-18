"""
Creates NovaStoreDB on the Docker SQL Server if it doesn't exist.
Run from inside the API container:
    python scripts/create_db.py
"""
import pyodbc

conn_str = (
    "DRIVER={ODBC Driver 18 for SQL Server};"
    "SERVER=db;"
    "DATABASE=master;"
    "UID=sa;"
    "PWD=NovaStore123!;"
    "TrustServerCertificate=yes;"
)

conn = pyodbc.connect(conn_str, autocommit=True)
cur = conn.cursor()

cur.execute("SELECT name FROM sys.databases WHERE name = 'NovaStoreDB'")
if cur.fetchone():
    print("  - NovaStoreDB already exists.")
else:
    cur.execute("CREATE DATABASE NovaStoreDB")
    print("  ✓ NovaStoreDB created.")

cur.close()
conn.close()
print("Done.")
