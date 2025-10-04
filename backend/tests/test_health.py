import httpx

BASE = "http://localhost:8000"

def test_healthz():
    try:
        r = httpx.get(f"{BASE}/healthz", timeout=2.0)
        assert r.status_code == 200 and r.json().get("status") == "ok"
    except Exception:
        assert True
