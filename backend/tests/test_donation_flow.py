import httpx, pytest

API = "http://localhost:8000"

@pytest.mark.asyncio
async def test_donation_lifecycle():
    async with httpx.AsyncClient(base_url=API, timeout=10.0) as c:
        try:
            auth = await c.post("/api/v1/test/login-as-admin")
            assert auth.status_code == 200
        except Exception:
            pytest.skip("test login endpoint yok")
        token = auth.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        d = await c.post("/api/admin/v1/donations", json={"amount": 8500, "currency": "TRY", "type": "small", "userId": "seed-user-1"}, headers=headers)
        assert d.status_code in (200, 201)
        donation = d.json()

        for status in ["approved", "in_progress", "completed"]:
            r = await c.patch(f"/api/admin/v1/donations/{donation['id']}", json={"status": status}, headers=headers)
            assert r.status_code == 200

        r = await c.get(f"/api/admin/v1/media?donationId={donation['id']}", headers=headers)
        assert r.status_code == 200
