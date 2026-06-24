#!/usr/bin/env python3
"""
Batch Runner — Processes websites through the extraction API.
Reads URLs from batch1_urls.txt, calls /api/extract for each,
tracks progress and failures.
"""

import json
import os
import time
import urllib.request
import urllib.error

HERMES_ENDPOINT = os.environ.get("HERMES_ENDPOINT", "http://localhost:3000")
API_ENDPOINT = os.environ.get("API_ENDPOINT", "http://localhost:3000")

def extract_components(url):
    """Call the extract API for a single URL."""
    payload = json.dumps({"url": url}).encode("utf-8")
    req = urllib.request.Request(
        f"{API_ENDPOINT}/api/extract",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read().decode("utf-8")
            # Parse SSE stream
            accumulated = ""
            for line in body.split("\n"):
                if line.startswith("data:"):
                    data = line[5:].strip()
                    if data == "[DONE]":
                        continue
                    try:
                        parsed = json.loads(data)
                        delta = parsed.get("choices", [{}])[0].get("delta", {}).get("content", "")
                        accumulated += delta
                    except json.JSONDecodeError:
                        pass
            
            # Try to parse JSON array from accumulated content
            try:
                components = json.loads(accumulated)
                if isinstance(components, list):
                    return {"status": "success", "components": len(components), "raw": accumulated[:200]}
            except json.JSONDecodeError:
                # Try markdown-wrapped JSON
                match = re.search(r'\[[\s\S]*\]', accumulated)
                if match:
                    try:
                        components = json.loads(match.group())
                        if isinstance(components, list):
                            return {"status": "success", "components": len(components), "raw": accumulated[:200]}
                    except json.JSONDecodeError:
                        pass
            
            return {"status": "empty", "components": 0, "raw": accumulated[:200]}
    
    except urllib.error.HTTPError as e:
        return {"status": "failed", "components": 0, "error": f"HTTP {e.code}"}
    except Exception as e:
        return {"status": "failed", "components": 0, "error": str(e)}


def run_batch(url_file="batch1_urls.txt"):
    """Process all URLs in the batch file."""
    with open(url_file) as f:
        urls = [line.strip() for line in f if line.strip()]
    
    results = []
    succeeded = 0
    failed = 0
    skipped = 0
    
    for i, url in enumerate(urls):
        print(f"[{i+1}/{len(urls)}] {url} ...", end=" ", flush=True)
        
        result = extract_components(url)
        result["url"] = url
        result["index"] = i + 1
        results.append(result)
        
        if result["status"] == "success":
            succeeded += 1
            print(f"✓ {result['components']} components")
        elif result["status"] == "empty":
            skipped += 1
            print(f"— no components")
        else:
            failed += 1
            print(f"✗ {result.get('error', 'unknown')}")
        
        # Save progress every 10 URLs
        if (i + 1) % 10 == 0:
            save_progress(results, succeeded, failed, skipped)
        
        # Small delay to avoid rate limiting
        time.sleep(0.5)
    
    # Final save
    save_progress(results, succeeded, failed, skipped)
    
    print(f"\n{'='*60}")
    print(f"Batch Complete: {succeeded} success, {skipped} empty, {failed} failed")
    print(f"Results saved to batch1_results.json")
    
    # Save failed URLs for retry
    failed_urls = [r["url"] for r in results if r["status"] == "failed"]
    with open("batch1_failed.txt", "w") as f:
        for url in failed_urls:
            f.write(url + "\n")
    print(f"Failed URLs saved to batch1_failed.txt ({len(failed_urls)} urls)")
    
    return results


def save_progress(results, succeeded, failed, skipped):
    """Save intermediate results."""
    with open("batch1_results.json", "w") as f:
        json.dump({
            "timestamp": time.time(),
            "processed": len(results),
            "succeeded": succeeded,
            "failed": failed,
            "skipped": skipped,
            "results": results,
        }, f, indent=2)


if __name__ == "__main__":
    import re  # needed for markdown-wrapped JSON parsing
    run_batch()
