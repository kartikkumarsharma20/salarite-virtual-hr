from datetime import date, timedelta


def test_interview_creation(client, employer_token):
    """Test scheduling an interview with valid fields."""
    headers = {"Authorization": f"Bearer {employer_token}"}
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    payload = {
        "candidate_name": "Sophia Martinez",
        "candidate_email": "sophia.m@example.com",
        "candidate_phone": "+1 555-987-6543",
        "interview_date": tomorrow,
        "start_time": "02:00 PM",
        "duration_minutes": 45,
        "mode": "Video",
        "notes": "Discuss technical leadership and team scaling.",
    }
    response = client.post("/api/interviews", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["candidate_name"] == "Sophia Martinez"
    assert data["status"] == "Scheduled"
    assert data["mode"] == "Video"
    assert data["duration_minutes"] == 45


def test_interview_creation_validation(client, employer_token):
    """Test validation fails when required candidate email is invalid or missing."""
    headers = {"Authorization": f"Bearer {employer_token}"}
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    invalid_payload = {
        "candidate_name": "Invalid Candidate",
        "candidate_email": "not-an-email",
        "interview_date": tomorrow,
        "start_time": "10:00 AM",
    }
    response = client.post("/api/interviews", json=invalid_payload, headers=headers)
    assert response.status_code == 422


def test_interview_listing_and_filtering(client, employer_token):
    """Test listing interviews and filtering by mode."""
    headers = {"Authorization": f"Bearer {employer_token}"}
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    # Create Voice interview
    client.post(
        "/api/interviews",
        json={
            "candidate_name": "Voice Candidate",
            "candidate_email": "voice@example.com",
            "interview_date": tomorrow,
            "start_time": "11:00 AM",
            "mode": "Voice",
        },
        headers=headers,
    )
    # Create Chat interview
    client.post(
        "/api/interviews",
        json={
            "candidate_name": "Chat Candidate",
            "candidate_email": "chat@example.com",
            "interview_date": tomorrow,
            "start_time": "03:00 PM",
            "mode": "Chat",
        },
        headers=headers,
    )

    # List all
    all_resp = client.get("/api/interviews", headers=headers)
    assert all_resp.status_code == 200
    assert len(all_resp.json()) == 2

    # Filter by mode Voice
    voice_resp = client.get("/api/interviews?mode=Voice", headers=headers)
    assert voice_resp.status_code == 200
    assert len(voice_resp.json()) == 1
    assert voice_resp.json()[0]["candidate_name"] == "Voice Candidate"


def test_interview_cancellation(client, employer_token):
    """Test cancelling a scheduled interview."""
    headers = {"Authorization": f"Bearer {employer_token}"}
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    create_resp = client.post(
        "/api/interviews",
        json={
            "candidate_name": "Candidate To Cancel",
            "candidate_email": "cancel@example.com",
            "interview_date": tomorrow,
            "start_time": "04:00 PM",
            "mode": "Video",
        },
        headers=headers,
    )
    interview_id = create_resp.json()["id"]

    # Cancel interview
    cancel_resp = client.patch(f"/api/interviews/{interview_id}/cancel", headers=headers)
    assert cancel_resp.status_code == 200
    data = cancel_resp.json()
    assert data["status"] == "Cancelled"
