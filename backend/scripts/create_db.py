import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pyodbc
from app.core.config import settings


def create_database() -> None:
    driver = settings.DB_DRIVER

    if settings.DB_TRUSTED_CONNECTION:
        conn_str = (
            f"DRIVER={{{driver}}};"
            f"SERVER={settings.DB_SERVER};"
            f"DATABASE=master;"
            f"Trusted_Connection=yes;"
            f"TrustServerCertificate=yes;"
        )
    else:
        conn_str = (
            f"DRIVER={{{driver}}};"
            f"SERVER={settings.DB_SERVER};"
            f"DATABASE=master;"
            f"UID={settings.DB_USER};"
            f"PWD={settings.DB_PASSWORD};"
            f"TrustServerCertificate=yes;"
        )

    print(f"Connecting to SQL Server at {settings.DB_SERVER} ...")

    try:
        conn = pyodbc.connect(conn_str, autocommit=True)
    except pyodbc.Error as e:
        print(f"[ERROR] Could not connect to SQL Server: {e}")
        sys.exit(1)

    cursor = conn.cursor()

    cursor.execute(
        "SELECT COUNT(*) FROM sys.databases WHERE name = ?",
        settings.DB_NAME,
    )
    exists = cursor.fetchone()[0]

    if exists:
        print(f"Database '{settings.DB_NAME}' already exists. Nothing to do.")
    else:
        cursor.execute(f"CREATE DATABASE [{settings.DB_NAME}]")
        print(f"Database '{settings.DB_NAME}' created successfully.")

    cursor.close()
    conn.close()


if __name__ == "__main__":
    create_database()
