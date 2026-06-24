#!/usr/bin/env python3
"""Deploy to Vercel using API directly."""
import urllib.request
import json
import os

# Read token from environment or use the provided one
TOKEN = os.environ.get("VERCEL_TOKEN", "")
if not TOKEN:
    print("Error: VERCEL_TOKEN environment variable not set")
    exit(1)

PROJECT_ID = os.environ.get("VERCEL_PROJECT_ID", "")
if not PROJECT_ID:
    print("Error: VERCEL_PROJECT_ID environment variable not set")
    exit(1)

def create_deployment():
    """Create a new deployment."""
    url = "https://api.vercel.com/v13/deployments?projectId=" + PROJECT_ID
    
    payload = {
        "name": "the-system",
        "gitSource": {
            "type": "github",
            "repo": "jay-software-contact/Tool-system",
            "ref": "master"
        },
        "target": "production"
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode())
            print(f"Status: {resp.status}")
            print(json.dumps(result, indent=2))
            return result
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else "No body"
        print(f"HTTP Error {e.code}: {body}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def list_deployments():
    """List existing deployments."""
    url = f"https://api.vercel.com/v9/projects/{PROJECT_ID}/deployments?limit=10"
    
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
        },
        method="GET",
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
            print(json.dumps(result, indent=2)[:1000])
            return result
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else "No body"
        print(f"HTTP Error {e.code}: {body}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def get_project():
    """Get project info."""
    url = f"https://api.vercel.com/v9/projects/{PROJECT_ID}"
    
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
        },
        method="GET",
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
            print(json.dumps(result, indent=2)[:1000])
            return result
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else "No body"
        print(f"HTTP Error {e.code}: {body}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    import sys
    
    # Get TOKEN from the file if not in env
    TOKEN = "wN3Vt45tdOCTvkMksvmd1d0W"
    PROJECT_ID = "prj_"  # Need actual project ID
    
    print(f"Token length: {len(TOKEN)}")
    
    # First try to list projects
    print("\n--- Listing projects ---")
    url = "https://api.vercel.com/v9/projects?limit=20"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
        },
        method="GET",
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
            print(json.dumps(result, indent=2)[:2000])
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else "No body"
        print(f"HTTP Error {e.code}: {body}")
    except Exception as e:
        print(f"Error: {e}")
