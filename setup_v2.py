"""
Setup script for the-System — Appwrite SDK 19.x compatible.
Adds missing columns to existing tables and seeds data.

Run with: python3.13 setup_v2.py
"""

from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.exception import AppwriteException
import json, os, time

# ---- Load credentials ----
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

tdb = TablesDB(client)
DB_ID = "core_db"

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}")

def add_string(table, key, size=256, required=False, default=None, array=False):
    try:
        tdb.create_string_column(DB_ID, table, key, size, required=required, default=default, array=array)
        log(f"  + {key} (string)")
    except AppwriteException as e:
        if "already exists" in str(e).lower():
            pass
        else:
            log(f"  ERROR {key}: {e}")

def add_integer(table, key, required=False, default=None, array=False):
    try:
        tdb.create_integer_column(DB_ID, table, key, required=required, default=default, array=array)
        log(f"  + {key} (integer)")
    except AppwriteException as e:
        if "already exists" in str(e).lower():
            pass
        else:
            log(f"  ERROR {key}: {e}")

def add_float(table, key, required=False, default=None, array=False):
    try:
        tdb.create_float_column(DB_ID, table, key, required=required, default=default, array=array)
        log(f"  + {key} (float)")
    except AppwriteException as e:
        if "already exists" in str(e).lower():
            pass
        else:
            log(f"  ERROR {key}: {e}")

def add_boolean(table, key, required=False, default=None):
    try:
        tdb.create_boolean_column(DB_ID, table, key, required=required, default=default)
        log(f"  + {key} (boolean)")
    except AppwriteException as e:
        if "already exists" in str(e).lower():
            pass
        else:
            log(f"  ERROR {key}: {e}")

# ============================================================
# 1. Add missing columns to Tools
# ============================================================
log("--- Adding missing columns to Tools ---")
add_string("tools", "domain", 128, required=True)
add_string("tools", "subcategory", 128)
add_string("tools", "docs_url", 512)
add_string("tools", "repo_url", 512)
add_string("tools", "version", 64)
add_string("tools", "license", 128)
add_string("tools", "proximity_cluster", 256)
add_string("tools", "proximity_neighbors", 256, array=True)
add_float("tools", "proximity_distance", array=True)
add_string("tools", "aesthetic_tags", 256, array=True)
add_string("tools", "component_ids", 256, array=True)
add_string("tools", "rating_schema", 128)
add_string("tools", "differentiation", 65535)
add_string("tools", "best_cases", 1024, array=True)
add_string("tools", "worst_cases", 1024, array=True)
add_string("tools", "integration_ids", 256, array=True)
add_string("tools", "issue_ids", 256, array=True)
add_string("tools", "created_by", 256)
add_integer("tools", "created_at", required=True)
add_integer("tools", "updated_at")

# ============================================================
# 2. Add columns to Aesthetic_Taxonomy
# ============================================================
log("--- Adding columns to Aesthetic_Taxonomy ---")
add_string("aesthetic_taxonomy", "name", 256, required=True)
add_string("aesthetic_taxonomy", "slug", 256, required=True)
add_string("aesthetic_taxonomy", "parent_id", 256)
add_integer("aesthetic_taxonomy", "level", required=True)
add_integer("aesthetic_taxonomy", "sort_order", default=0)
add_boolean("aesthetic_taxonomy", "is_active", default=True)
add_string("aesthetic_taxonomy", "perceptual_objective", 1024)
add_string("aesthetic_taxonomy", "aesthetic_classification", 512)
add_string("aesthetic_taxonomy", "master_prompt_template", 65535)
add_string("aesthetic_taxonomy", "external_tags", 256, array=True)
add_string("aesthetic_taxonomy", "chromatic_specs", 65535)
add_string("aesthetic_taxonomy", "rendering_specs", 65535)
add_string("aesthetic_taxonomy", "typographic_specs", 65535)
add_string("aesthetic_taxonomy", "spatial_specs", 65535)
add_string("aesthetic_taxonomy", "motion_specs", 65535)
add_string("aesthetic_taxonomy", "validation_criteria", 512, array=True)
add_integer("aesthetic_taxonomy", "created_at", required=True)

# ============================================================
# 3. Add columns to UI_Components
# ============================================================
log("--- Adding columns to UI_Components ---")
add_string("ui_components", "name", 256, required=True)
add_string("ui_components", "slug", 256, required=True)
add_string("ui_components", "component_type", 128, required=True)
add_string("ui_components", "sub_type", 128)
add_string("ui_components", "aesthetic_taxonomy_ids", 256, array=True)
add_string("ui_components", "tool_ids", 256, array=True)
add_string("ui_components", "domain", 128)
add_string("ui_components", "description", 65535)
add_string("ui_components", "code_snippets", 65535)
add_string("ui_components", "design_tokens", 65535)
add_string("ui_components", "functional_attrs", 65535)
add_string("ui_components", "preview_image_url", 512)
add_string("ui_components", "tags", 256, array=True)
add_string("ui_components", "status", 64, default="active")
add_integer("ui_components", "created_at", required=True)
add_integer("ui_components", "updated_at")

# ============================================================
# 4. Add columns to Templates
# ============================================================
log("--- Adding columns to Templates ---")
add_string("templates", "name", 256, required=True)
add_string("templates", "slug", 256, required=True)
add_string("templates", "domain", 128, required=True)
add_string("templates", "description", 65535)
add_string("templates", "role_slots", 65535)
add_string("templates", "aesthetic_taxonomy_ids", 256, array=True)
add_string("templates", "component_ids", 256, array=True)
add_string("templates", "stack_config", 65535)
add_string("templates", "preview_image_url", 512)
add_string("templates", "documentation", 65535)
add_string("templates", "tags", 256, array=True)
add_string("templates", "status", 64, default="active")
add_integer("templates", "created_at", required=True)
add_integer("templates", "updated_at")

# ============================================================
# 5. Add columns to User_Templates
# ============================================================
log("--- Adding columns to User_Templates ---")
add_string("user_templates", "user_id", 256, required=True)
add_string("user_templates", "base_template_id", 256)
add_string("user_templates", "name", 256, required=True)
add_string("user_templates", "domain", 128)
add_string("user_templates", "role_slots", 65535)
add_string("user_templates", "aesthetic_taxonomy_ids", 256, array=True)
add_string("user_templates", "component_ids", 256, array=True)
add_string("user_templates", "custom_notes", 65535)
add_integer("user_templates", "created_at", required=True)
add_integer("user_templates", "updated_at")

# ============================================================
# 6. Add columns to Issues
# ============================================================
log("--- Adding columns to Issues ---")
add_string("issues", "issue_id", 64, required=True)
add_string("issues", "title", 512, required=True)
add_string("issues", "description", 65535)
add_string("issues", "type", 64, required=True)
add_string("issues", "severity", 64)
add_string("issues", "status", 64, default="open")
add_string("issues", "affected_domains", 128, array=True)
add_string("issues", "resolved_by_tool_id", 256)
add_string("issues", "related_tool_ids", 256, array=True)
add_string("issues", "related_component_ids", 256, array=True)
add_string("issues", "tags", 256, array=True)
add_integer("issues", "created_at", required=True)
add_integer("issues", "updated_at")

# ============================================================
# 7. Add columns to Pipelines
# ============================================================
log("--- Adding columns to Pipelines ---")
add_string("pipelines", "user_id", 256, required=True)
add_string("pipelines", "name", 256, required=True)
add_string("pipelines", "description", 65535)
add_string("pipelines", "domain", 128)
add_string("pipelines", "nodes", 65535)
add_string("pipelines", "connections", 65535)
add_string("pipelines", "aesthetic_taxonomy_ids", 256, array=True)
add_integer("pipelines", "created_at", required=True)
add_integer("pipelines", "updated_at")

# ============================================================
# 8. Add columns to Activity_Log
# ============================================================
log("--- Adding columns to Activity_Log ---")
add_string("activity_log", "user_id", 256)
add_string("activity_log", "action", 128, required=True)
add_string("activity_log", "entity_type", 64, required=True)
add_string("activity_log", "entity_id", 256, required=True)
add_string("activity_log", "diff", 65535)
add_integer("activity_log", "timestamp", required=True)

# ============================================================
# 9. Add columns to Rating_Schemas
# ============================================================
log("--- Adding columns to Rating_Schemas ---")
add_string("rating_schemas", "schema_id", 128, required=True)
add_string("rating_schemas", "schema_name", 256, required=True)
add_string("rating_schemas", "dimensions", 65535)
add_integer("rating_schemas", "created_at", required=True)

# ============================================================
# 10. Add columns to Components (legacy table)
# ============================================================
log("--- Adding columns to Components ---")
add_string("components", "name", 256, required=True)
add_string("components", "type", 128, required=True)
add_string("components", "status", 64, default="active")
add_integer("components", "created_at", required=True)

log("=" * 60)
log("Setup complete! All tables now have their columns.")
log("Next: python3.13 seed_data.py")
log("=" * 60)
