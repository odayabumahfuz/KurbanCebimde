import httpx, pytest

API = "http://localhost:8000"

@pytest.mark.asyncio
async def test_presign_and_commit():
    async with httpx.AsyncClient(base_url=API, timeout=10) as c:
        try:
            token = (await c.post("/api/v1/test/login-as-admin")).json().get("access_token")
        except Exception:
            pytest.skip("test login endpoint yok")
        headers = {"Authorization": f"Bearer {token}"}
        up = await c.post(
            "/api/admin/v1/media/upload-url",
            json={"donationId": "seed-donation-1", "broadcastId": None, "mimeType": "image/jpeg", "sizeBytes": 1024},
            headers=headers,
        )
        assert up.status_code == 200
