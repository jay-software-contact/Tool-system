"""
Appwrite Backend Setup Script
Creates core_db with all 9 collections, attributes, indexes, and seed data.
Run with: py -3.13 setup_appwrite.py
"""
from appwrite.client import Client
try:
    from appwrite.services.tables_db import TablesDB
except ImportError:
    from appwrite.services.databases import Databases as TablesDB
from appwrite.services.functions import Functions
from appwrite.services.storage import Storage
from appwrite.id import ID
from appwrite.permission import Permission
from appwrite.role import Role
from appwrite.query import Query
import json, os, time

# Load credentials
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
storage = Storage(client)

DB_ID = "core_db"

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}")

def create_database():
    try:
        result = tdb.create(DB_ID, "core_db")
        log(f"Created database: {result['name']}")
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            log("Database already exists")
        elif "paused" in str(e).lower() or "403" in str(e):
            log("ERROR: Appwrite project is paused due to inactivity.")
            log("FIX: Log into Appwrite Cloud console → Project Settings → Resume")
            log("Then re-run this script.")
            raise
        else:
            log(f"ERROR creating database: {e}")
            raise

def create_table(table_id, name, permissions=None):
    try:
        result = tdb.create_table(DB_ID, table_id, name, permissions=permissions)
        log(f"  Table '{name}' created")
        return result
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            log(f"  Table '{name}' already exists")
        else:
            log(f"  ERROR creating table '{name}': {e}")
            raise

def create_string_attr(table_id, key, size, required=False, default=None, array=False):
    try:
        tdb.create_string_attribute(DB_ID, table_id, key, size, required=required, default=default, array=array)
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            pass
        else:
            log(f"    ERROR attr '{key}': {e}")

def create_integer_attr(table_id, key, required=False, default=None, min_val=None, max_val=None, array=False):
    try:
        tdb.create_integer_attribute(DB_ID, table_id, key, required=required, default=default, min=min_val, max=max_val, array=array)
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            pass
        else:
            log(f"    ERROR attr '{key}': {e}")

def create_float_attr(table_id, key, required=False, default=None, array=False):
    try:
        tdb.create_float_attribute(DB_ID, table_id, key, required=required, default=default, array=array)
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            pass
        else:
            log(f"    ERROR attr '{key}': {e}")

def create_boolean_attr(table_id, key, required=False, default=None):
    try:
        tdb.create_boolean_attribute(DB_ID, table_id, key, required=required, default=default)
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            pass
        else:
            log(f"    ERROR attr '{key}': {e}")

def create_json_attr(table_id, key, required=False, default=None, array=False):
    # JSON stored as string with large size
    create_string_attr(table_id, key, 65535, required=required, default=default, array=array)

def create_index(table_id, key, type_, attributes, orders=None):
    try:
        tdb.create_index(DB_ID, table_id, key, type_, attributes, orders=orders or [])
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            pass
        else:
            log(f"    ERROR index '{key}': {e}")

def wait(seconds=2):
    time.sleep(seconds)

# ============================================================
# MAIN SETUP
# ============================================================
log("=" * 60)
log("Starting Appwrite Backend Setup")
log("=" * 60)

# 1. Create Database (skip if exists — plan limit reached)
log("\n--- Creating Database ---")
try:
    create_database()
    wait(2)
except Exception as e:
    if "maximum number of databases" in str(e).lower() or "already exists" in str(e).lower():
        log("Database limit reached or already exists — skipping creation")
        log("If core_db already exists, tables will be created inside it")
    else:
        raise

# 2. Create Tables
log("\n--- Creating Tables ---")

# Permissions: admin team can do anything, contributors can read/create/update, external can read
admin_perms = [
    Permission.read(Role.team("admin")),
    Permission.create(Role.team("admin")),
    Permission.update(Role.team("admin")),
    Permission.delete(Role.team("admin")),
    Permission.read(Role.team("contributor")),
    Permission.create(Role.team("contributor")),
    Permission.update(Role.team("contributor")),
    Permission.read(Role.users()),
]

read_only_perms = [
    Permission.read(Role.team("admin")),
    Permission.create(Role.team("admin")),
    Permission.update(Role.team("admin")),
    Permission.delete(Role.team("admin")),
    Permission.read(Role.team("contributor")),
    Permission.create(Role.team("contributor")),
    Permission.update(Role.team("contributor")),
    Permission.read(Role.users()),
]

create_table("tools", "Tools", admin_perms)
create_table("aesthetic_taxonomy", "Aesthetic Taxonomy", admin_perms)
create_table("ui_components", "UI Components", admin_perms)
create_table("templates", "Templates", admin_perms)
create_table("user_templates", "User Templates", admin_perms)
create_table("issues", "Issues", admin_perms)
create_table("pipelines", "Pipelines", admin_perms)
create_table("activity_log", "Activity Log", admin_perms)
create_table("rating_schemas", "Rating Schemas", read_only_perms)
wait(3)

# 3. Create Attributes for each table
log("\n--- Creating Attributes: Tools ---")
create_string_attr("tools", "name", 256, required=True)
create_string_attr("tools", "slug", 256, required=True)
create_string_attr("tools", "domain", 128, required=True)
create_string_attr("tools", "category", 128, required=True)
create_string_attr("tools", "subcategory", 128)
create_string_attr("tools", "description", 65535)
create_string_attr("tools", "icon_url", 512)
create_string_attr("tools", "docs_url", 512)
create_string_attr("tools", "repo_url", 512)
create_string_attr("tools", "version", 64)
create_string_attr("tools", "license", 128)
create_string_attr("tools", "status", 64, default="active")
create_string_attr("tools", "tags", 256, array=True)
create_string_attr("tools", "proximity_cluster", 256)
create_string_attr("tools", "proximity_neighbors", 256, array=True)
create_float_attr("tools", "proximity_distance", array=True)
create_string_attr("tools", "aesthetic_tags", 256, array=True)
create_string_attr("tools", "component_ids", 256, array=True)
create_string_attr("tools", "rating_schema", 128)
create_json_attr("tools", "ratings")
create_string_attr("tools", "differentiation", 65535)
create_string_attr("tools", "best_cases", 1024, array=True)
create_string_attr("tools", "worst_cases", 1024, array=True)
create_string_attr("tools", "integration_ids", 256, array=True)
create_string_attr("tools", "issue_ids", 256, array=True)
create_string_attr("tools", "created_by", 256)
create_integer_attr("tools", "created_at", required=True)
create_integer_attr("tools", "updated_at")
wait(2)

# Indexes for Tools
log("  Creating indexes for Tools...")
create_index("tools", "idx_tools_slug", "unique", ["slug"])
create_index("tools", "idx_tools_domain", "key", ["domain"])
create_index("tools", "idx_tools_category", "key", ["category"])
create_index("tools", "idx_tools_status", "key", ["status"])
create_index("tools", "idx_tools_proximity_cluster", "key", ["proximity_cluster"])
create_index("tools", "idx_tools_rating_schema", "key", ["rating_schema"])
wait(2)

log("\n--- Creating Attributes: Aesthetic_Taxonomy ---")
create_string_attr("aesthetic_taxonomy", "name", 256, required=True)
create_string_attr("aesthetic_taxonomy", "slug", 256, required=True)
create_string_attr("aesthetic_taxonomy", "parent_id", 256)
create_integer_attr("aesthetic_taxonomy", "level", required=True, min_val=0, max_val=3)
create_integer_attr("aesthetic_taxonomy", "sort_order", default=0)
create_boolean_attr("aesthetic_taxonomy", "is_active", default=True)
create_json_attr("aesthetic_taxonomy", "chromatic_specs")
create_json_attr("aesthetic_taxonomy", "rendering_specs")
create_json_attr("aesthetic_taxonomy", "typographic_specs")
create_json_attr("aesthetic_taxonomy", "spatial_specs")
create_json_attr("aesthetic_taxonomy", "motion_specs")
create_string_attr("aesthetic_taxonomy", "perceptual_objective", 1024)
create_string_attr("aesthetic_taxonomy", "validation_criteria", 512, array=True)
create_string_attr("aesthetic_taxonomy", "aesthetic_classification", 512)
create_string_attr("aesthetic_taxonomy", "master_prompt_template", 65535)
create_string_attr("aesthetic_taxonomy", "external_tags", 256, array=True)
wait(2)

log("  Creating indexes for Aesthetic_Taxonomy...")
create_index("aesthetic_taxonomy", "idx_at_slug", "unique", ["slug"])
create_index("aesthetic_taxonomy", "idx_at_parent", "key", ["parent_id"])
create_index("aesthetic_taxonomy", "idx_at_level", "key", ["level"])
wait(2)

log("\n--- Creating Attributes: UI_Components ---")
create_string_attr("ui_components", "name", 256, required=True)
create_string_attr("ui_components", "slug", 256, required=True)
create_string_attr("ui_components", "component_type", 128, required=True)
create_string_attr("ui_components", "sub_type", 128)
create_string_attr("ui_components", "aesthetic_taxonomy_ids", 256, array=True)
create_string_attr("ui_components", "tool_ids", 256, array=True)
create_string_attr("ui_components", "domain", 128)
create_string_attr("ui_components", "description", 65535)
create_json_attr("ui_components", "code_snippets")
create_json_attr("ui_components", "design_tokens")
create_json_attr("ui_components", "functional_attrs")
create_string_attr("ui_components", "preview_image_url", 512)
create_string_attr("ui_components", "tags", 256, array=True)
create_string_attr("ui_components", "status", 64, default="active")
create_integer_attr("ui_components", "created_at", required=True)
create_integer_attr("ui_components", "updated_at")
wait(2)

log("  Creating indexes for UI_Components...")
create_index("ui_components", "idx_uc_slug", "unique", ["slug"])
create_index("ui_components", "idx_uc_type", "key", ["component_type"])
create_index("ui_components", "idx_uc_subtype", "key", ["sub_type"])
create_index("ui_components", "idx_uc_domain", "key", ["domain"])
create_index("ui_components", "idx_uc_status", "key", ["status"])
wait(2)

log("\n--- Creating Attributes: Templates ---")
create_string_attr("templates", "name", 256, required=True)
create_string_attr("templates", "slug", 256, required=True)
create_string_attr("templates", "domain", 128, required=True)
create_string_attr("templates", "description", 65535)
create_json_attr("templates", "role_slots")
create_string_attr("templates", "aesthetic_taxonomy_ids", 256, array=True)
create_string_attr("templates", "component_ids", 256, array=True)
create_json_attr("templates", "stack_config")
create_string_attr("templates", "preview_image_url", 512)
create_string_attr("templates", "documentation", 65535)
create_string_attr("templates", "tags", 256, array=True)
create_string_attr("templates", "status", 64, default="active")
create_integer_attr("templates", "created_at", required=True)
create_integer_attr("templates", "updated_at")
wait(2)

log("  Creating indexes for Templates...")
create_index("templates", "idx_tmpl_slug", "unique", ["slug"])
create_index("templates", "idx_tmpl_domain", "key", ["domain"])
create_index("templates", "idx_tmpl_status", "key", ["status"])
wait(2)

log("\n--- Creating Attributes: User_Templates ---")
create_string_attr("user_templates", "user_id", 256, required=True)
create_string_attr("user_templates", "base_template_id", 256)
create_string_attr("user_templates", "name", 256, required=True)
create_string_attr("user_templates", "domain", 128)
create_json_attr("user_templates", "role_slots")
create_string_attr("user_templates", "aesthetic_taxonomy_ids", 256, array=True)
create_string_attr("user_templates", "component_ids", 256, array=True)
create_string_attr("user_templates", "custom_notes", 65535)
create_integer_attr("user_templates", "created_at", required=True)
create_integer_attr("user_templates", "updated_at")
wait(2)

log("  Creating indexes for User_Templates...")
create_index("user_templates", "idx_ut_user", "key", ["user_id"])
create_index("user_templates", "idx_ut_base", "key", ["base_template_id"])
wait(2)

log("\n--- Creating Attributes: Issues ---")
create_string_attr("issues", "issue_id", 64, required=True)
create_string_attr("issues", "title", 512, required=True)
create_string_attr("issues", "description", 65535)
create_string_attr("issues", "type", 64, required=True)
create_string_attr("issues", "severity", 64)
create_string_attr("issues", "status", 64, default="open")
create_string_attr("issues", "affected_domains", 128, array=True)
create_string_attr("issues", "resolved_by_tool_id", 256)
create_string_attr("issues", "related_tool_ids", 256, array=True)
create_string_attr("issues", "related_component_ids", 256, array=True)
create_string_attr("issues", "tags", 256, array=True)
create_integer_attr("issues", "created_at", required=True)
create_integer_attr("issues", "updated_at")
wait(2)

log("  Creating indexes for Issues...")
create_index("issues", "idx_issues_id", "unique", ["issue_id"])
create_index("issues", "idx_issues_status", "key", ["status"])
create_index("issues", "idx_issues_type", "key", ["type"])
create_index("issues", "idx_issues_severity", "key", ["severity"])
create_index("issues", "idx_issues_resolved", "key", ["resolved_by_tool_id"])
wait(2)

log("\n--- Creating Attributes: Pipelines ---")
create_string_attr("pipelines", "user_id", 256, required=True)
create_string_attr("pipelines", "name", 256, required=True)
create_string_attr("pipelines", "description", 65535)
create_string_attr("pipelines", "domain", 128)
create_json_attr("pipelines", "nodes")
create_json_attr("pipelines", "connections")
create_string_attr("pipelines", "aesthetic_taxonomy_ids", 256, array=True)
create_integer_attr("pipelines", "created_at", required=True)
create_integer_attr("pipelines", "updated_at")
wait(2)

log("  Creating indexes for Pipelines...")
create_index("pipelines", "idx_pipe_user", "key", ["user_id"])
wait(2)

log("\n--- Creating Attributes: Activity_Log ---")
create_string_attr("activity_log", "user_id", 256)
create_string_attr("activity_log", "action", 128, required=True)
create_string_attr("activity_log", "entity_type", 64, required=True)
create_string_attr("activity_log", "entity_id", 256, required=True)
create_json_attr("activity_log", "diff")
create_integer_attr("activity_log", "timestamp", required=True)
wait(2)

log("  Creating indexes for Activity_Log...")
create_index("activity_log", "idx_al_entity", "key", ["entity_type", "entity_id"])
create_index("activity_log", "idx_al_timestamp", "key", ["timestamp"])
wait(2)

log("\n--- Creating Attributes: Rating_Schemas ---")
create_string_attr("rating_schemas", "schema_id", 128, required=True)
create_string_attr("rating_schemas", "schema_name", 256, required=True)
create_json_attr("rating_schemas", "dimensions")
create_integer_attr("rating_schemas", "created_at", required=True)
wait(2)

log("  Creating indexes for Rating_Schemas...")
create_index("rating_schemas", "idx_rs_schema_id", "unique", ["schema_id"])
wait(2)

# 4. Create Storage Buckets
log("\n--- Creating Storage Buckets ---")
for bucket_name in ["tool_icons", "component_previews", "template_previews"]:
    try:
        storage.create_bucket(bucket_name, bucket_name, permissions=[
            Permission.read(Role.users()),
            Permission.create(Role.team("admin")),
            Permission.update(Role.team("admin")),
            Permission.delete(Role.team("admin")),
        ])
        log(f"  Bucket '{bucket_name}' created")
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            log(f"  Bucket '{bucket_name}' already exists")
        else:
            log(f"  ERROR creating bucket '{bucket_name}': {e}")
wait(2)

# 5. Seed Rating Schemas
log("\n--- Seeding Rating Schemas ---")
now_ts = int(time.time())

schemas = [
    {
        "schema_id": "frontend_framework",
        "schema_name": "Frontend Framework",
        "dimensions": json.dumps([
            {"id": "dx", "name": "Developer Experience", "description": "How pleasant is daily development?", "max_score": 5, "weight": 1.0},
            {"id": "ecosystem", "name": "Ecosystem", "description": "Breadth and quality of third-party extensions", "max_score": 5, "weight": 1.0},
            {"id": "performance", "name": "Runtime Performance", "description": "Bundle size, render speed, memory footprint", "max_score": 5, "weight": 1.0},
            {"id": "learning_curve", "name": "Learning Curve", "description": "Time to productivity for a mid-level developer", "max_score": 5, "weight": 0.8},
            {"id": "hiring", "name": "Hiring Pool", "description": "Availability of developers with this skill", "max_score": 5, "weight": 0.6}
        ])
    },
    {
        "schema_id": "database",
        "schema_name": "Database",
        "dimensions": json.dumps([
            {"id": "query_performance", "name": "Query Performance", "description": "Speed of typical read/write operations", "max_score": 5, "weight": 1.0},
            {"id": "scalability", "name": "Scalability", "description": "How well it handles growth", "max_score": 5, "weight": 1.0},
            {"id": "acid_compliance", "name": "Data Integrity", "description": "ACID guarantees and consistency model", "max_score": 5, "weight": 1.0},
            {"id": "operational_complexity", "name": "Operational Burden", "description": "Maintenance, backup, monitoring overhead", "max_score": 5, "weight": 0.8},
            {"id": "ecosystem", "name": "Tooling Ecosystem", "description": "ORMs, migration tools, admin panels", "max_score": 5, "weight": 0.6}
        ])
    },
    {
        "schema_id": "daw",
        "schema_name": "Digital Audio Workstation",
        "dimensions": json.dumps([
            {"id": "midi_editing", "name": "MIDI Editing", "description": "Quality and flexibility of MIDI editing tools", "max_score": 5, "weight": 1.0},
            {"id": "plugin_support", "name": "Plugin Support", "description": "VST/AU/AAX compatibility and stability", "max_score": 5, "weight": 1.0},
            {"id": "mixing", "name": "Mixing Capabilities", "description": "Built-in EQ, compression, routing flexibility", "max_score": 5, "weight": 1.0},
            {"id": "performance", "name": "CPU Performance", "description": "Efficiency under heavy track/plugin loads", "max_score": 5, "weight": 0.8},
            {"id": "workflow", "name": "Workflow Speed", "description": "How fast common tasks can be completed", "max_score": 5, "weight": 0.8}
        ])
    },
    {
        "schema_id": "social_tool",
        "schema_name": "Social Media Tool",
        "dimensions": json.dumps([
            {"id": "scheduling", "name": "Scheduling", "description": "Quality of post scheduling and queue management", "max_score": 5, "weight": 1.0},
            {"id": "analytics", "name": "Analytics", "description": "Depth of engagement and reach reporting", "max_score": 5, "weight": 1.0},
            {"id": "multi_platform", "name": "Multi-Platform", "description": "Number of supported social platforms", "max_score": 5, "weight": 0.8},
            {"id": "content_creation", "name": "Content Creation", "description": "Built-in design and editing tools", "max_score": 5, "weight": 0.8},
            {"id": "team_collaboration", "name": "Team Collaboration", "description": "Multi-user workflows and approval chains", "max_score": 5, "weight": 0.6}
        ])
    },
    {
        "schema_id": "data_extraction_tool",
        "schema_name": "Data Extraction Tool",
        "dimensions": json.dumps([
            {"id": "extraction_speed", "name": "Extraction Speed", "description": "Pages per minute under typical conditions", "max_score": 5, "weight": 1.0},
            {"id": "accuracy", "name": "Data Accuracy", "description": "Precision of extracted data vs source", "max_score": 5, "weight": 1.0},
            {"id": "js_rendering", "name": "JS Rendering", "description": "Ability to extract from JavaScript-heavy pages", "max_score": 5, "weight": 1.0},
            {"id": "anti_detection", "name": "Anti-Detection", "description": "Ability to avoid bot detection systems", "max_score": 5, "weight": 0.8},
            {"id": "output_formats", "name": "Output Formats", "description": "CSV, JSON, database, API delivery options", "max_score": 5, "weight": 0.6}
        ])
    }
]

for schema in schemas:
    try:
        tdb.create_document(DB_ID, "rating_schemas", ID.unique(), {
            **schema,
            "created_at": now_ts
        })
        log(f"  Schema '{schema['schema_id']}' seeded")
    except Exception as e:
        log(f"  ERROR seeding schema '{schema['schema_id']}': {e}")

wait(2)

# 6. Seed Aesthetic Taxonomy (GXSC + top-level nodes)
log("\n--- Seeding Aesthetic Taxonomy ---")

# Top-level aesthetics
aesthetics = [
    {"name": "Gen X Soft Club", "slug": "gxsc", "parent_id": None, "level": 0, "sort_order": 0,
     "aesthetic_classification": "Analog-Residue, Muted-Chromatic, Ultramodern-Revival Interface System",
     "perceptual_objective": "Hazy Melancholia and Comfy Futurism — the interface must feel like a Sunday afternoon in a video game",
     "chromatic_specs": json.dumps({
         "primary_surface": "#E8E2D9", "secondary_surface": "#9AA0A6",
         "tertiary_accent": "#C4714A", "quaternary_accent": "#6A8CAA",
         "deep_field": "#1A1A18", "highlight": "#F5F2EC", "sage_register": "#8A9B7A",
         "desaturation_test": {"max_saturation_pct": 35, "neon_dimming_min_pct": 60}
     }),
     "rendering_specs": json.dumps({
         "vignetting_protocol": {"min_opacity": 0.15, "max_opacity": 0.35},
         "grain_overlay_pct": {"min": 3, "max": 8},
         "bleach_bypass_contrast_model": {"shadow_target": "#1A1A18", "highlight_target": "#F5F2EC"},
         "atmospheric_blur_zones": {"min_radius": 4, "max_radius": 12, "applies_to": "non_interactive_backgrounds"},
         "optical_distortion": {"enabled": True, "type": "barrel", "contextual": True}
     }),
     "typographic_specs": json.dumps({
         "display_typeface_dna": "geometric sans-serif with rounded terminals OR humanist serif with organic stroke variation",
         "body_typeface_class": "grotesque or transitional serif",
         "letter_spacing_display_em": {"min": 0.02, "max": 0.08},
         "line_height_body": {"min": 1.55, "max": 1.75},
         "weight_constraints": "no ultra-bold except single-word UI labels",
         "italic_display_prohibited": True
     }),
     "spatial_specs": json.dumps({
         "border_radius_range_px": {"min": 12, "max": 32},
         "negative_space_minimum_px": 48,
         "organic_shape_anchors": "mandatory non-rectangular element per primary view",
         "asymmetric_composition_allowed": True,
         "retro_object_motifs": "mid-century futurist canon preferred"
     }),
     "motion_specs": json.dumps({
         "default_transition_duration_ms": {"min": 280, "max": 420, "never_below": 200},
         "easing_function": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
         "hover_luminosity_shift_pct": {"min": 5, "max": 10},
         "hover_scale_range": {"min": 1.01, "max": 1.03},
         "stagger_delay_minimum_ms": 60,
         "prohibited_patterns": ["hard_cuts", "bounce_easing", "elastic_easing", "aggressive_parallax"]
     }),
     "validation_criteria": json.dumps([
         "chromatic_compliance", "atmospheric_fidelity", "motion_compliance",
         "spatial_compliance", "typographic_compliance", "perceptual_objective_achieved"
     ]),
     "master_prompt_template": "GXSC Technical Overview Template v1.0 — Aesthetic-Specific, Reusable Technical Scaffold. Perceptual Objective: implement a visually subdued, temporally ambiguous operator environment that encodes analog imperfection as a first-class rendering constraint, inducing Hazy Melancholia and Comfy Futurism. All color values must pass GXSC Desaturation Test (no HSL channel >35% saturation). Vignetting at 0.15-0.35 opacity. Grain overlay at 3-8%. Bleach Bypass contrast model. Atmospheric blur 4-12px on non-interactive layers. Languid analog motion: 280-420ms transitions, cubic-bezier(0.25, 0.46, 0.45, 0.94), no bounce/elastic. Rounded radius 12-32px. Generous negative space ≥48px. Organic shape anchors mandatory. Display typeface: geometric sans-serif with rounded terminals. Body: grotesque/transitional serif. Letter-spacing +0.02 to +0.08em on display. No ultra-bold except labels. No italic in display contexts."
    },
    {"name": "Metal Heart", "slug": "metal-heart", "parent_id": None, "level": 0, "sort_order": 1,
     "aesthetic_classification": "Industrial-Hardened, High-Contrast, Aggressive Interface System",
     "perceptual_objective": "Industrial intensity and mechanical precision — the interface must feel like operating heavy machinery",
     "chromatic_specs": json.dumps({"status": "pending_full_spec"}),
     "rendering_specs": json.dumps({"status": "pending_full_spec"}),
     "typographic_specs": json.dumps({"status": "pending_full_spec"}),
     "spatial_specs": json.dumps({"status": "pending_full_spec"}),
     "motion_specs": json.dumps({"status": "pending_full_spec"}),
     "validation_criteria": json.dumps(["pending_full_spec"]),
     "master_prompt_template": "Metal Heart Technical Overview Template — PENDING FULL SPECIFICATION"
    },
    {"name": "Grunge", "slug": "grunge", "parent_id": None, "level": 0, "sort_order": 2,
     "aesthetic_classification": "Deconstructed, Textural, Anti-Establishment Interface System",
     "perceptual_objective": "Raw, unpolished authenticity — the interface must feel like a photocopied zine from 1994",
     "chromatic_specs": json.dumps({"status": "pending_full_spec"}),
     "rendering_specs": json.dumps({"status": "pending_full_spec"}),
     "typographic_specs": json.dumps({"status": "pending_full_spec"}),
     "spatial_specs": json.dumps({"status": "pending_full_spec"}),
     "motion_specs": json.dumps({"status": "pending_full_spec"}),
     "validation_criteria": json.dumps(["pending_full_spec"]),
     "master_prompt_template": "Grunge Technical Overview Template — PENDING FULL SPECIFICATION"
    },
    {"name": "Minimalist", "slug": "minimalist", "parent_id": None, "level": 0, "sort_order": 3,
     "aesthetic_classification": "Reductive, High-Precision, Content-First Interface System",
     "perceptual_objective": "Absolute clarity through elimination — the interface must feel like a quiet room",
     "chromatic_specs": json.dumps({"status": "pending_full_spec"}),
     "rendering_specs": json.dumps({"status": "pending_full_spec"}),
     "typographic_specs": json.dumps({"status": "pending_full_spec"}),
     "spatial_specs": json.dumps({"status": "pending_full_spec"}),
     "motion_specs": json.dumps({"status": "pending_full_spec"}),
     "validation_criteria": json.dumps(["pending_full_spec"]),
     "master_prompt_template": "Minimalist Technical Overview Template — PENDING FULL SPECIFICATION"
    },
    {"name": "Corporate", "slug": "corporate", "parent_id": None, "level": 0, "sort_order": 4,
     "aesthetic_classification": "Authoritative, Structured, Trust-Signal Interface System",
     "perceptual_objective": "Institutional confidence and professional authority — the interface must feel like a boardroom",
     "chromatic_specs": json.dumps({"status": "pending_full_spec"}),
     "rendering_specs": json.dumps({"status": "pending_full_spec"}),
     "typographic_specs": json.dumps({"status": "pending_full_spec"}),
     "spatial_specs": json.dumps({"status": "pending_full_spec"}),
     "motion_specs": json.dumps({"status": "pending_full_spec"}),
     "validation_criteria": json.dumps(["pending_full_spec"]),
     "master_prompt_template": "Corporate Technical Overview Template — PENDING FULL SPECIFICATION"
    },
    {"name": "Futuristic", "slug": "futuristic", "parent_id": None, "level": 0, "sort_order": 5,
     "aesthetic_classification": "Speculative, High-Tech, Avant-Garde Interface System",
     "perceptual_objective": "Forward-looking technological optimism — the interface must feel like a concept car from 2087",
     "chromatic_specs": json.dumps({"status": "pending_full_spec"}),
     "rendering_specs": json.dumps({"status": "pending_full_spec"}),
     "typographic_specs": json.dumps({"status": "pending_full_spec"}),
     "spatial_specs": json.dumps({"status": "pending_full_spec"}),
     "motion_specs": json.dumps({"status": "pending_full_spec"}),
     "validation_criteria": json.dumps(["pending_full_spec"]),
     "master_prompt_template": "Futuristic Technical Overview Template — PENDING FULL SPECIFICATION"
    },
    {"name": "Playful", "slug": "playful", "parent_id": None, "level": 0, "sort_order": 6,
     "aesthetic_classification": "Expressive, Colorful, Joy-Forward Interface System",
     "perceptual_objective": "Delight and creative energy — the interface must feel like a well-designed toy",
     "chromatic_specs": json.dumps({"status": "pending_full_spec"}),
     "rendering_specs": json.dumps({"status": "pending_full_spec"}),
     "typographic_specs": json.dumps({"status": "pending_full_spec"}),
     "spatial_specs": json.dumps({"status": "pending_full_spec"}),
     "motion_specs": json.dumps({"status": "pending_full_spec"}),
     "validation_criteria": json.dumps(["pending_full_spec"]),
     "master_prompt_template": "Playful Technical Overview Template — PENDING FULL SPECIFICATION"
    },
]

for a in aesthetics:
    try:
        data = {k: v for k, v in a.items() if v is not None}
        if "parent_id" in data and data["parent_id"] is None:
            del data["parent_id"]
        tdb.create_document(DB_ID, "aesthetic_taxonomy", ID.unique(), data)
        log(f"  Aesthetic '{a['name']}' seeded")
    except Exception as e:
        log(f"  ERROR seeding aesthetic '{a['name']}': {e}")

wait(2)

# 7. Seed GXSC Level-1 children (Tool Types)
log("\n--- Seeding GXSC Level-1 (Tool Types) ---")
gxsc_id = None
try:
    result = tdb.list_documents(DB_ID, "aesthetic_taxonomy", [Query.equal("slug", "gxsc")])
    if result.get("documents"):
        gxsc_id = result["documents"][0]["$id"]
except Exception as e:
    log(f"  ERROR finding GXSC: {e}")

if gxsc_id:
    tool_types = [
        {"name": "E-commerce", "slug": "gxsc-ecommerce", "sort_order": 0},
        {"name": "Portfolio", "slug": "gxsc-portfolio", "sort_order": 1},
        {"name": "Landing Page", "slug": "gxsc-landing", "sort_order": 2},
        {"name": "Blog", "slug": "gxsc-blog", "sort_order": 3},
        {"name": "Dashboard", "slug": "gxsc-dashboard", "sort_order": 4},
        {"name": "Wiki", "slug": "gxsc-wiki", "sort_order": 5},
    ]
    for tt in tool_types:
        try:
            tdb.create_document(DB_ID, "aesthetic_taxonomy", ID.unique(), {
                **tt, "parent_id": gxsc_id, "level": 1,
                "is_active": True
            })
            log(f"  Tool Type '{tt['name']}' seeded")
        except Exception as e:
            log(f"  ERROR seeding tool type '{tt['name']}': {e}")

wait(2)

# 8. Seed 14 Tools
log("\n--- Seeding 14 Tools ---")
tools_data = [
    {
        "name": "Tailwind CSS", "slug": "tailwind-css", "domain": "web_development",
        "category": "library", "subcategory": "css_framework",
        "description": "A utility-first CSS framework for rapidly building custom interfaces.",
        "status": "active", "rating_schema": "frontend_framework",
        "tags": ["css", "utility-first", "responsive", "postcss"],
        "proximity_cluster": "utility_css", "proximity_neighbors": ["postcss", "react", "next-js"],
        "ratings": json.dumps({"dx": 3, "ecosystem": 5, "performance": 5, "learning_curve": 4, "hiring": 4}),
        "differentiation": "Utility-class approach vs component-class frameworks. No pre-built components — raw CSS control.",
        "best_cases": ["Rapid prototyping", "Design system consistency", "Small bundle with purge"],
        "worst_cases": ["Verbose HTML class lists", "Learning curve for naming", "Override complexity"],
        "integration_ids": ["postcss", "react", "next-js", "vue"]
    },
    {
        "name": "React", "slug": "react", "domain": "web_development",
        "category": "frontend_framework", "subcategory": "ui_library",
        "description": "A JavaScript library for building user interfaces with reusable components using JSX and hooks.",
        "status": "active", "rating_schema": "frontend_framework",
        "tags": ["javascript", "jsx", "virtual-dom", "component-based", "meta"],
        "proximity_cluster": "react_ecosystem", "proximity_neighbors": ["next-js", "redux", "react-query"],
        "ratings": json.dumps({"dx": 3, "ecosystem": 5, "performance": 4, "learning_curve": 3, "hiring": 5}),
        "differentiation": "JSX + hooks model vs Vue templates or Svelte compilation. Largest ecosystem.",
        "best_cases": ["Large SPAs", "Complex state management", "Cross-platform (React Native)"],
        "worst_cases": ["Simple static sites", "Teams without JS experience", "SEO without SSR"],
        "integration_ids": ["next-js", "redux", "react-query", "tailwind-css"]
    },
    {
        "name": "Next.js", "slug": "next-js", "domain": "web_development",
        "category": "frontend_framework", "subcategory": "meta_framework",
        "description": "The React framework for production with hybrid static and server rendering, file-based routing, and edge functions.",
        "status": "active", "rating_schema": "frontend_framework",
        "tags": ["react", "ssr", "ssg", "edge", "vercel"],
        "proximity_cluster": "react_ecosystem", "proximity_neighbors": ["react", "vercel", "tailwind-css"],
        "ratings": json.dumps({"dx": 4, "ecosystem": 5, "performance": 5, "learning_curve": 3, "hiring": 4}),
        "differentiation": "Built-in SSR/routing vs CRA. Zero-config deployment. API routes included.",
        "best_cases": ["Content-heavy sites", "E-commerce", "SEO-critical applications"],
        "worst_cases": ["Simple SPAs", "Teams wanting full server control", "High-frequency real-time apps"],
        "integration_ids": ["react", "vercel", "tailwind-css", "typescript"]
    },
    {
        "name": "Vue", "slug": "vue", "domain": "web_development",
        "category": "frontend_framework", "subcategory": "ui_framework",
        "description": "The progressive JavaScript framework for building user interfaces with template-based SFCs.",
        "status": "active", "rating_schema": "frontend_framework",
        "tags": ["javascript", "sfc", "reactive", "progressive"],
        "proximity_cluster": "vue_ecosystem", "proximity_neighbors": ["nuxt", "pinia", "vue-router"],
        "ratings": json.dumps({"dx": 4, "ecosystem": 4, "performance": 4, "learning_curve": 4, "hiring": 3}),
        "differentiation": "Template-based SFC vs React JSX. Gentle learning curve. Single-file components.",
        "best_cases": ["Teams new to frameworks", "Progressive enhancement", "Medium-complexity SPAs"],
        "worst_cases": ["Very large teams", "TypeScript-heavy projects", "Ecosystem-dependent features"],
        "integration_ids": ["nuxt", "pinia", "vue-router", "tailwind-css"]
    },
    {
        "name": "TypeScript", "slug": "typescript", "domain": "web_development",
        "category": "language", "subcategory": "typed_superset",
        "description": "A strongly typed superset of JavaScript that compiles to plain JavaScript with IDE tooling.",
        "status": "active", "rating_schema": "frontend_framework",
        "tags": ["javascript", "types", "microsoft", "compile-time"],
        "proximity_cluster": "web_languages", "proximity_neighbors": ["react", "next-js", "node-js"],
        "ratings": json.dumps({"dx": 3, "ecosystem": 4, "performance": 5, "learning_curve": 3, "hiring": 5}),
        "differentiation": "Static typing vs plain JavaScript. Catches errors at compile time. IDE autocomplete.",
        "best_cases": ["Large codebases", "Team collaboration", "Refactoring confidence"],
        "worst_cases": ["Quick scripts", "Build-averse workflows", "Complex type gymnastics"],
        "integration_ids": ["react", "next-js", "node-js", "vue"]
    },
    {
        "name": "D3.js", "slug": "d3-js", "domain": "web_development",
        "category": "library", "subcategory": "data_visualization",
        "description": "A JavaScript library for producing dynamic, interactive data visualizations using SVG, Canvas, and HTML.",
        "status": "active", "rating_schema": "frontend_framework",
        "tags": ["svg", "canvas", "data-binding", "imperative"],
        "proximity_cluster": "data_viz", "proximity_neighbors": ["react", "svg", "canvas-api"],
        "ratings": json.dumps({"dx": 1, "ecosystem": 5, "performance": 4, "learning_curve": 1, "hiring": 2}),
        "differentiation": "Imperative data-binding vs declarative chart libs. Unlimited visualization types.",
        "best_cases": ["Custom visualizations", "Data journalism", "Interactive dashboards"],
        "worst_cases": ["Standard charts", "Rapid prototyping", "Teams without SVG knowledge"],
        "integration_ids": ["react", "svg", "typescript"]
    },
    {
        "name": "PostgreSQL", "slug": "postgresql", "domain": "web_development",
        "category": "database", "subcategory": "relational",
        "description": "A powerful, open source object-relational database system with JSONB support and extensibility.",
        "status": "active", "rating_schema": "database",
        "tags": ["sql", "jsonb", "acid", "open-source", "extensible"],
        "proximity_cluster": "sql_databases", "proximity_neighbors": ["prisma", "drizzle", "supabase"],
        "ratings": json.dumps({"query_performance": 5, "scalability": 4, "acid_compliance": 5, "operational_complexity": 3, "ecosystem": 5}),
        "differentiation": "SQL + JSONB vs pure document DBs. ACID compliance. Advanced indexing.",
        "best_cases": ["Complex queries", "Data integrity requirements", "Hybrid relational/document data"],
        "worst_cases": ["Simple key-value", "Rapid prototyping without schema", "Serverless-first architectures"],
        "integration_ids": ["prisma", "drizzle", "supabase", "next-js"]
    },
    {
        "name": "MongoDB", "slug": "mongodb", "domain": "web_development",
        "category": "database", "subcategory": "document",
        "description": "A general purpose, document-based, distributed database with flexible schema and horizontal scaling.",
        "status": "active", "rating_schema": "database",
        "tags": ["nosql", "document", "horizontal-scaling", "atlas"],
        "proximity_cluster": "nosql_databases", "proximity_neighbors": ["mongoose", "express", "atlas"],
        "ratings": json.dumps({"query_performance": 4, "scalability": 5, "acid_compliance": 3, "operational_complexity": 4, "ecosystem": 4}),
        "differentiation": "Document model vs relational tables. Flexible schema. Horizontal scaling.",
        "best_cases": ["Rapid prototyping", "Unstructured data", "Content management"],
        "worst_cases": ["Complex transactions", "Strict schema requirements", "Heavy relational queries"],
        "integration_ids": ["mongoose", "express", "atlas", "node-js"]
    },
    {
        "name": "Firebase", "slug": "firebase", "domain": "web_development",
        "category": "backend_service", "subcategory": "baas",
        "description": "Google's app development platform with backend-as-a-service features including real-time database, auth, and hosting.",
        "status": "active", "rating_schema": "database",
        "tags": ["baas", "real-time", "google", "serverless", "auth"],
        "proximity_cluster": "baas", "proximity_neighbors": ["react", "angular", "flutter"],
        "ratings": json.dumps({"query_performance": 3, "scalability": 3, "acid_compliance": 2, "operational_complexity": 5, "ecosystem": 3}),
        "differentiation": "BaaS opinionated stack vs self-hosted. Real-time database. Authentication built-in.",
        "best_cases": ["Rapid prototyping", "Real-time features", "Small teams without backend expertise"],
        "worst_cases": ["Complex queries", "Vendor lock-in concerns", "Cost at scale"],
        "integration_ids": ["react", "angular", "flutter", "firestore"]
    },
    {
        "name": "Vercel", "slug": "vercel", "domain": "web_development",
        "category": "deployment", "subcategory": "edge_platform",
        "description": "The platform for frontend developers with global edge network, instant deployments, and preview environments.",
        "status": "active", "rating_schema": "frontend_framework",
        "tags": ["edge", "deployment", "git-integration", "serverless", "cdn"],
        "proximity_cluster": "deployment", "proximity_neighbors": ["next-js", "react", "astro"],
        "ratings": json.dumps({"dx": 5, "ecosystem": 3, "performance": 5, "learning_curve": 5, "hiring": 3}),
        "differentiation": "Git-push deployment vs manual CI/CD. Edge functions. Preview deployments per PR.",
        "best_cases": ["Next.js apps", "Static sites", "Teams wanting zero-config deployment"],
        "worst_cases": ["Complex backend requirements", "Vendor lock-in concerns", "Cost at scale"],
        "integration_ids": ["next-js", "react", "tailwind-css", "typescript"]
    },
    {
        "name": "Strapi", "slug": "strapi", "domain": "web_development",
        "category": "cms", "subcategory": "headless",
        "description": "The leading open-source headless CMS, 100% JavaScript, with REST and GraphQL APIs.",
        "status": "active", "rating_schema": "database",
        "tags": ["cms", "headless", "self-hosted", "rest", "graphql"],
        "proximity_cluster": "cms", "proximity_neighbors": ["next-js", "react", "graphql"],
        "ratings": json.dumps({"query_performance": 4, "scalability": 4, "acid_compliance": 3, "operational_complexity": 3, "ecosystem": 4}),
        "differentiation": "Self-hosted headless vs managed CMS. Full content control. REST + GraphQL.",
        "best_cases": ["Content-heavy sites", "Multi-channel content", "Teams wanting full control"],
        "worst_cases": ["Simple blogs", "Teams without DevOps", "Real-time content needs"],
        "integration_ids": ["next-js", "react", "graphql", "postgresql"]
    },
    {
        "name": "Sanity", "slug": "sanity", "domain": "web_development",
        "category": "cms", "subcategory": "structured_content",
        "description": "The unified content platform with real-time collaboration, structured content, and GROQ query language.",
        "status": "active", "rating_schema": "database",
        "tags": ["cms", "structured-content", "groq", "real-time", "collaboration"],
        "proximity_cluster": "cms", "proximity_neighbors": ["next-js", "react", "groq"],
        "ratings": json.dumps({"query_performance": 4, "scalability": 4, "acid_compliance": 3, "operational_complexity": 3, "ecosystem": 4}),
        "differentiation": "Structured content + GROQ vs Markdown CMS. Real-time collaboration. Portable text.",
        "best_cases": ["Structured content", "Multi-language sites", "Teams needing real-time editing"],
        "worst_cases": ["Simple blogs", "Teams new to GROQ", "Cost at scale"],
        "integration_ids": ["next-js", "react", "groq", "vercel"]
    },
    {
        "name": "Supabase", "slug": "supabase", "domain": "web_development",
        "category": "backend_service", "subcategory": "baas",
        "description": "The open source Firebase alternative with PostgreSQL, real-time subscriptions, and row-level security.",
        "status": "active", "rating_schema": "database",
        "tags": ["baas", "postgresql", "real-time", "open-source", "auth"],
        "proximity_cluster": "baas", "proximity_neighbors": ["postgresql", "react", "next-js"],
        "ratings": json.dumps({"query_performance": 4, "scalability": 4, "acid_compliance": 4, "operational_complexity": 4, "ecosystem": 4}),
        "differentiation": "SQL-powered BaaS vs Firebase NoSQL. PostgreSQL under the hood. Row-level security.",
        "best_cases": ["SQL-loving teams", "Real-time features", "Open-source preference"],
        "worst_cases": ["NoSQL-first teams", "Complex Firebase migrations", "Edge function limits"],
        "integration_ids": ["postgresql", "react", "next-js", "vercel"]
    },
    {
        "name": "Svelte", "slug": "svelte", "domain": "web_development",
        "category": "frontend_framework", "subcategory": "compiler",
        "description": "Cybernetically enhanced web apps with a compiler-based approach that eliminates virtual DOM overhead.",
        "status": "active", "rating_schema": "frontend_framework",
        "tags": ["compiler", "no-virtual-dom", "reactive", "lightweight"],
        "proximity_cluster": "compiler_frameworks", "proximity_neighbors": ["svelte-kit", "vite", "tailwind-css"],
        "ratings": json.dumps({"dx": 4, "ecosystem": 3, "performance": 5, "learning_curve": 4, "hiring": 2}),
        "differentiation": "Compiler approach vs React/Vue virtual DOM. Zero-runtime overhead. Less boilerplate.",
        "best_cases": ["Performance-critical apps", "Small bundle requirements", "Developer experience focus"],
        "worst_cases": ["Large ecosystem needs", "Hiring-focused teams", "Complex state management"],
        "integration_ids": ["svelte-kit", "vite", "tailwind-css", "typescript"]
    }
]

for tool in tools_data:
    try:
        tdb.create_document(DB_ID, "tools", ID.unique(), {
            **tool,
            "created_at": now_ts,
            "updated_at": now_ts
        })
        log(f"  Tool '{tool['name']}' seeded")
    except Exception as e:
        log(f"  ERROR seeding tool '{tool['name']}': {e}")

wait(2)

# 9. Seed 17 UI Components
log("\n--- Seeding 17 UI Components ---")
components_data = [
    {"name": "Gradient Hero", "slug": "gradient-hero", "component_type": "hero", "sub_type": "gradient-static",
     "domain": "web_development", "description": "Full-width hero section with gradient background and CTA.",
     "design_tokens": json.dumps({"colors": ["#3B82F6", "#8B5CF6"], "font": "Inter", "weight": "700", "radius": 0, "shadow": False, "animation": "Fade-in"}),
     "tags": ["Gradient", "CTA"], "status": "active"},
    {"name": "Clean Hero", "slug": "clean-hero", "component_type": "hero", "sub_type": "minimal",
     "domain": "web_development", "description": "Minimal hero with generous whitespace and clean typography.",
     "design_tokens": json.dumps({"colors": ["#111827", "#F9FAFB"], "font": "Space Grotesk", "weight": "300", "radius": 0, "shadow": False, "animation": "None"}),
     "tags": ["Clean", "Whitespace"], "status": "active"},
    {"name": "Bento Hero", "slug": "bento-hero", "component_type": "hero", "sub_type": "grid-layout",
     "domain": "web_development", "description": "Grid-based hero with colorful bento-style card layout.",
     "design_tokens": json.dumps({"colors": ["#F59E0B", "#EC4899", "#8B5CF6"], "font": "DM Sans", "weight": "600", "radius": 16, "shadow": True, "animation": "Stagger"}),
     "tags": ["Bento", "Colorful", "Grid"], "status": "active"},
    {"name": "Mega Menu", "slug": "mega-menu", "component_type": "menu", "sub_type": "multi-column",
     "domain": "web_development", "description": "Full-width dropdown menu with multiple columns and rich content.",
     "design_tokens": json.dumps({"colors": ["#1E293B", "#3B82F6"], "font": "Inter", "weight": "500", "radius": 8, "shadow": True, "animation": "Slide-down"}),
     "tags": ["Multi-column", "Dropdown"], "status": "active"},
    {"name": "Slide-out Menu", "slug": "slide-out-menu", "component_type": "menu", "sub_type": "overlay",
     "domain": "web_development", "description": "Mobile-friendly slide-out navigation overlay.",
     "design_tokens": json.dumps({"colors": ["#0B0E14", "#E8E2D9"], "font": "DM Sans", "weight": "400", "radius": 0, "shadow": False, "animation": "Slide-right"}),
     "tags": ["Mobile", "Overlay"], "status": "active"},
    {"name": "Multi-column Footer", "slug": "multi-column-footer", "component_type": "footer", "sub_type": "link-grid",
     "domain": "web_development", "description": "Footer with multiple link columns and social icons.",
     "design_tokens": json.dumps({"colors": ["#0F172A", "#3B82F6"], "font": "Inter", "weight": "400", "radius": 0, "shadow": False, "animation": "None"}),
     "tags": ["Links", "Social"], "status": "active"},
    {"name": "Slim Footer", "slug": "slim-footer", "component_type": "footer", "sub_type": "minimal",
     "domain": "web_development", "description": "Minimal single-line footer with copyright.",
     "design_tokens": json.dumps({"colors": ["#FFF", "#9CA3AF"], "font": "DM Sans", "weight": "400", "radius": 0, "shadow": False, "animation": "None"}),
     "tags": ["Copyright", "Slim"], "status": "active"},
    {"name": "3D Carousel", "slug": "3d-carousel", "component_type": "carousel", "sub_type": "3d-rotate",
     "domain": "web_development", "description": "3D rotating carousel with perspective transforms.",
     "design_tokens": json.dumps({"colors": ["#06B6D4", "#0F172A"], "font": "Space Grotesk", "weight": "600", "radius": 12, "shadow": True, "animation": "3D-rotate"}),
     "tags": ["3D", "Perspective"], "status": "active"},
    {"name": "Swipe Carousel", "slug": "swipe-carousel", "component_type": "carousel", "sub_type": "touch-slide",
     "domain": "web_development", "description": "Touch-friendly swipe carousel for mobile and desktop.",
     "design_tokens": json.dumps({"colors": ["#6366F1", "#F9FAFB"], "font": "Inter", "weight": "500", "radius": 12, "shadow": False, "animation": "Slide"}),
     "tags": ["Touch", "Swipe"], "status": "active"},
    {"name": "Grid Testimonials", "slug": "grid-testimonials", "component_type": "testimonials", "sub_type": "card-grid",
     "domain": "web_development", "description": "Testimonials displayed in a responsive card grid.",
     "design_tokens": json.dumps({"colors": ["#F8FAFC", "#E8A838"], "font": "Inter", "weight": "400", "radius": 12, "shadow": False, "animation": "Fade-in"}),
     "tags": ["Grid", "Cards"], "status": "active"},
    {"name": "Single Quote", "slug": "single-quote", "component_type": "testimonials", "sub_type": "elegant",
     "domain": "web_development", "description": "Single elegant quote with serif typography.",
     "design_tokens": json.dumps({"colors": ["#FAFAF9", "#44403C"], "font": "Georgia", "weight": "400", "radius": 0, "shadow": False, "animation": "None"}),
     "tags": ["Quote", "Elegant"], "status": "active"},
    {"name": "Gradient Button", "slug": "gradient-button", "component_type": "button", "sub_type": "gradient-cta",
     "domain": "web_development", "description": "CTA button with gradient background and hover scale.",
     "design_tokens": json.dumps({"colors": ["#3B82F6", "#8B5CF6"], "font": "Inter", "weight": "600", "radius": 10, "shadow": False, "animation": "Scale-hover"}),
     "tags": ["Gradient", "CTA"], "status": "active"},
    {"name": "Ghost Button", "slug": "ghost-button", "component_type": "button", "sub_type": "outline",
     "domain": "web_development", "description": "Transparent button with border and hover fill effect.",
     "design_tokens": json.dumps({"colors": ["transparent", "#E8E2D9"], "font": "DM Sans", "weight": "500", "radius": 8, "shadow": False, "animation": "Background-fill"}),
     "tags": ["Ghost", "Subtle"], "status": "active"},
    {"name": "Glass Card", "slug": "glass-card", "component_type": "card", "sub_type": "glassmorphism",
     "domain": "web_development", "description": "Glassmorphism card with blur backdrop and subtle border.",
     "design_tokens": json.dumps({"colors": ["rgba(255,255,255,0.05)", "#2DD4BF"], "font": "Inter", "weight": "500", "radius": 16, "shadow": True, "animation": "Float"}),
     "tags": ["Glassmorphism"], "status": "active"},
    {"name": "Flat Card", "slug": "flat-card", "component_type": "card", "sub_type": "no-shadow",
     "domain": "web_development", "description": "Flat card with no shadow, lift on hover.",
     "design_tokens": json.dumps({"colors": ["#FFF", "#111827"], "font": "DM Sans", "weight": "400", "radius": 0, "shadow": False, "animation": "Lift-hover"}),
     "tags": ["Flat", "No-shadow"], "status": "active"},
    {"name": "Floating Label Form", "slug": "floating-label-form", "component_type": "form", "sub_type": "float-label",
     "domain": "web_development", "description": "Form with floating labels and validation states.",
     "design_tokens": json.dumps({"colors": ["#F9FAFB", "#3B82F6"], "font": "Inter", "weight": "400", "radius": 10, "shadow": False, "animation": "Label-float"}),
     "tags": ["Float-label", "Validation"], "status": "active"},
    {"name": "Center Modal", "slug": "center-modal", "component_type": "modal", "sub_type": "overlay-centered",
     "domain": "web_development", "description": "Centered modal with overlay and scale-in animation.",
     "design_tokens": json.dumps({"colors": ["#FFF", "#EF4444"], "font": "Inter", "weight": "500", "radius": 16, "shadow": True, "animation": "Scale-in"}),
     "tags": ["Overlay", "Centered"], "status": "active"},
]

for comp in components_data:
    try:
        tdb.create_document(DB_ID, "ui_components", ID.unique(), {
            **comp,
            "created_at": now_ts,
            "updated_at": now_ts
        })
        log(f"  Component '{comp['name']}' seeded")
    except Exception as e:
        log(f"  ERROR seeding component '{comp['name']}': {e}")

wait(2)

# 10. Seed 6 Templates
log("\n--- Seeding 6 Templates ---")
templates_data = [
    {
        "name": "E-Commerce Stack", "slug": "ecommerce-stack", "domain": "web_development",
        "description": "Full-featured online store with payments, database, and deployment.",
        "role_slots": json.dumps([
            {"role": "frontend_framework", "assigned_tool_id": None, "requirements": ["component_based", "ssr_support"]},
            {"role": "styling", "assigned_tool_id": None, "requirements": ["utility_classes"]},
            {"role": "payments", "assigned_tool_id": None, "requirements": ["stripe_integration"]},
            {"role": "database", "assigned_tool_id": None, "requirements": ["sql", "hosted"]},
            {"role": "orm", "assigned_tool_id": None, "requirements": ["typescript_support"]},
            {"role": "deployment", "assigned_tool_id": None, "requirements": ["git_push", "edge_network"]}
        ]),
        "tags": ["e-commerce", "full-stack", "payments"], "status": "active"
    },
    {
        "name": "Blog Platform", "slug": "blog-platform", "domain": "web_development",
        "description": "Content-driven blog with MDX support and headless CMS.",
        "role_slots": json.dumps([
            {"role": "frontend_framework", "assigned_tool_id": None, "requirements": ["ssg", "mdx_support"]},
            {"role": "content_format", "assigned_tool_id": None, "requirements": ["mdx"]},
            {"role": "styling", "assigned_tool_id": None, "requirements": ["utility_classes"]},
            {"role": "cms", "assigned_tool_id": None, "requirements": ["headless", "structured_content"]},
            {"role": "deployment", "assigned_tool_id": None, "requirements": ["git_push"]}
        ]),
        "tags": ["blog", "content", "mdx"], "status": "active"
    },
    {
        "name": "SaaS Dashboard", "slug": "saas-dashboard", "domain": "web_development",
        "description": "Analytics dashboard with real-time data and charts.",
        "role_slots": json.dumps([
            {"role": "frontend_framework", "assigned_tool_id": None, "requirements": ["component_based", "typescript"]},
            {"role": "language", "assigned_tool_id": None, "requirements": ["static_typing"]},
            {"role": "styling", "assigned_tool_id": None, "requirements": ["utility_classes"]},
            {"role": "backend", "assigned_tool_id": None, "requirements": ["baas", "realtime"]},
            {"role": "charts", "assigned_tool_id": None, "requirements": ["data_visualization", "svg"]},
            {"role": "deployment", "assigned_tool_id": None, "requirements": ["git_push"]}
        ]),
        "tags": ["saas", "dashboard", "analytics"], "status": "active"
    },
    {
        "name": "Portfolio Generator", "slug": "portfolio-generator", "domain": "web_development",
        "description": "Personal portfolio with Firebase backend and email integration.",
        "role_slots": json.dumps([
            {"role": "frontend_framework", "assigned_tool_id": None, "requirements": ["component_based"]},
            {"role": "styling", "assigned_tool_id": None, "requirements": ["utility_classes"]},
            {"role": "backend", "assigned_tool_id": None, "requirements": ["baas", "auth"]},
            {"role": "email", "assigned_tool_id": None, "requirements": ["form_handling"]},
            {"role": "deployment", "assigned_tool_id": None, "requirements": ["static_hosting"]}
        ]),
        "tags": ["portfolio", "personal", "firebase"], "status": "active"
    },
    {
        "name": "Online Marketplace", "slug": "online-marketplace", "domain": "web_development",
        "description": "Multi-vendor marketplace with Stripe Connect payments.",
        "role_slots": json.dumps([
            {"role": "frontend_framework", "assigned_tool_id": None, "requirements": ["component_based", "typescript", "ssr_support"]},
            {"role": "language", "assigned_tool_id": None, "requirements": ["static_typing"]},
            {"role": "database", "assigned_tool_id": None, "requirements": ["sql", "complex_queries"]},
            {"role": "payments", "assigned_tool_id": None, "requirements": ["stripe_connect", "multi_vendor"]},
            {"role": "orm", "assigned_tool_id": None, "requirements": ["typescript_support"]}
        ]),
        "tags": ["marketplace", "multi-vendor", "stripe-connect"], "status": "active"
    },
    {
        "name": "E-Learning Platform", "slug": "e-learning-platform", "domain": "web_development",
        "description": "Course platform with video streaming and progress tracking.",
        "role_slots": json.dumps([
            {"role": "frontend_framework", "assigned_tool_id": None, "requirements": ["component_based"]},
            {"role": "styling", "assigned_tool_id": None, "requirements": ["utility_classes"]},
            {"role": "backend", "assigned_tool_id": None, "requirements": ["baas", "realtime", "auth"]},
            {"role": "video", "assigned_tool_id": None, "requirements": ["streaming", "adaptive_bitrate"]},
            {"role": "deployment", "assigned_tool_id": None, "requirements": ["git_push", "edge_network"]}
        ]),
        "tags": ["e-learning", "video", "courses"], "status": "active"
    }
]

for tmpl in templates_data:
    try:
        tdb.create_document(DB_ID, "templates", ID.unique(), {
            **tmpl,
            "created_at": now_ts,
            "updated_at": now_ts
        })
        log(f"  Template '{tmpl['name']}' seeded")
    except Exception as e:
        log(f"  ERROR seeding template '{tmpl['name']}': {e}")

wait(2)

# 11. Seed 5 Issues
log("\n--- Seeding 5 Issues ---")
issues_data = [
    {
        "issue_id": "OC-001", "title": "No native full-text search in Appwrite",
        "description": "Appwrite does not provide built-in full-text search. The search-tools function and global search will need to use Appwrite's query API with contains() filters, which is not true full-text search. For 2000+ tools, this may become a performance bottleneck.",
        "type": "limitation", "severity": "major", "status": "open",
        "affected_domains": ["web_development", "all"],
        "tags": ["search", "performance", "appwrite-limitation"],
        "related_tool_ids": []
    },
    {
        "issue_id": "OC-002", "title": "No native JSON schema validation in Appwrite",
        "description": "Appwrite attributes are typed but do not enforce JSON schema structure. The Aesthetic_Taxonomy collection's chromatic_specs, rendering_specs, typographic_specs, spatial_specs, and motion_specs fields are stored as strings (JSON). There is no server-side validation that the JSON conforms to the required schema. Validation must happen at the application layer.",
        "type": "limitation", "severity": "major", "status": "open",
        "affected_domains": ["all"],
        "tags": ["validation", "json-schema", "data-integrity"],
        "related_tool_ids": []
    },
    {
        "issue_id": "OC-003", "title": "Appwrite Functions cold start latency",
        "description": "Appwrite Functions may experience cold start delays, particularly for the get-components and resolve-template endpoints that external systems will call. This could impact the responsiveness of the component funnel API.",
        "type": "limitation", "severity": "minor", "status": "open",
        "affected_domains": ["all"],
        "tags": ["performance", "cold-start", "functions"],
        "related_tool_ids": []
    },
    {
        "issue_id": "OC-004", "title": "No native many-to-many relationships in Appwrite",
        "description": "Appwrite does not support native many-to-many relationships. Tools linking to multiple components, templates linking to multiple tools by role, and issues linking to multiple tools are all stored as string arrays of IDs. There is no referential integrity or cascade behavior.",
        "type": "limitation", "severity": "major", "status": "open",
        "affected_domains": ["all"],
        "tags": ["relationships", "referential-integrity", "data-model"],
        "related_tool_ids": []
    },
    {
        "issue_id": "OC-005", "title": "Aesthetic Technical Overview templates incomplete",
        "description": "Only GXSC has a complete Technical Overview Template with all sections (A-J) populated. Metal Heart, Grunge, Minimalist, Corporate, Futuristic, and Playful have placeholder 'pending_full_spec' values. These must be completed before those aesthetics can be applied to templates or components.",
        "type": "feature_request", "severity": "critical", "status": "open",
        "affected_domains": ["all"],
        "tags": ["aesthetics", "templates", "gxsc", "metal-heart", "grunge"],
        "related_component_ids": []
    }
]

for issue in issues_data:
    try:
        tdb.create_document(DB_ID, "issues", ID.unique(), {
            **issue,
            "created_at": now_ts,
            "updated_at": now_ts
        })
        log(f"  Issue '{issue['issue_id']}' seeded")
    except Exception as e:
        log(f"  ERROR seeding issue '{issue['issue_id']}': {e}")

wait(2)

# 12. Summary
log("\n" + "=" * 60)
log("SETUP COMPLETE")
log("=" * 60)
log(f"Database: core_db")
log(f"Tables: 9")
log(f"Rating Schemas: {len(schemas)}")
log(f"Aesthetics: {len(aesthetics)} top-level + {len(tool_types)} GXSC children")
log(f"Tools: {len(tools_data)}")
log(f"Components: {len(components_data)}")
log(f"Templates: {len(templates_data)}")
log(f"Issues: {len(issues_data)}")
log(f"Storage Buckets: 3")
