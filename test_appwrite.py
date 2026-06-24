
from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
import json, os

env_file = r"C:\Users\nayth\the-system\.env.local"
creds = {}
with open(env_file) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            creds[k.strip()] = v.strip()

client = Client()
client.set_endpoint(creds["NEXT_PUBLIC_APPWRITE_ENDPOINT"])
client.set_project(creds["NEXT_PUBLIC_APPWRITE_PROJECT_ID"])
client.set_key(creds["APPWRITE_API_KEY"])

# Try tables_db (for 1.8+)
tdb = TablesDB(client)
try:
    result = tdb.list()
    print("TABLES result type:", type(result).__name__)
    if isinstance(result, dict):
        print("Keys:", list(result.keys())[:10])
        print("Total:", result.get("total", "?"))
        for t in result.get("tables", [])[:5]:
            print(f"  Table: {t.get('name', t.get('$id', '?'))}")
    else:
        print("Result:", str(result)[:500])
except Exception as e:
    print(f"ERROR: {e}")
    print("\nNOTE: If the error says 'Project is paused', log into Appwrite Cloud")
    print("console and restore the project. Free tier projects auto-pause after inactivity.")
