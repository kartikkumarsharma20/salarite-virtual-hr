from datetime import datetime, timedelta, timezone


def test_health_endpoint(client):
    """Test health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_successful_login(client):
    """Test authentication with valid credentials."""
    response = client.post(
        "/api/auth/login",
        json={"email": "test.employer@salarite.com", "password": "Password123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test.employer@salarite.com"
    assert data["user"]["role"] == "employer"


def test_invalid_login(client):
    """Test authentication failure with incorrect password."""
    response = client.post(
        "/api/auth/login",
        json={"email": "test.employer@salarite.com", "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_employer_task_creation(client, employer_token, db_session):
    """Test task creation by an authenticated employer."""
    headers = {"Authorization": f"Bearer {employer_token}"}
    deadline = (datetime.now(timezone.utc) + timedelta(days=5)).isoformat()
    payload = {
        "title": "Setup Automated Payroll Reconciliation",
        "description": "Configure the automated monthly payroll sync script.",
        "priority": "High",
        "deadline": deadline,
        "assigned_to_id": 2,  # vhr1
    }
    response = client.post("/api/tasks", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["status"] == "Pending"
    assert data["priority"] == "High"
    assert data["assigned_to_id"] == 2
    assert len(data["activities"]) >= 1


def test_task_list_retrieval(client, employer_token):
    """Test retrieving task list with filters."""
    headers = {"Authorization": f"Bearer {employer_token}"}
    # Create two tasks
    client.post(
        "/api/tasks",
        json={"title": "Task One", "priority": "Low", "assigned_to_id": 2},
        headers=headers,
    )
    client.post(
        "/api/tasks",
        json={"title": "Task Two", "priority": "Urgent", "assigned_to_id": 3},
        headers=headers,
    )

    response = client.get("/api/tasks", headers=headers)
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 2

    # Filter by priority
    urgent_resp = client.get("/api/tasks?priority=Urgent", headers=headers)
    assert urgent_resp.status_code == 200
    urgent_tasks = urgent_resp.json()
    assert len(urgent_tasks) == 1
    assert urgent_tasks[0]["title"] == "Task Two"


def test_task_status_update_by_assigned_vhr(client, employer_token, vhr1_token):
    """Test that assigned Virtual HR can successfully update task status and add progress note."""
    headers_emp = {"Authorization": f"Bearer {employer_token}"}
    create_resp = client.post(
        "/api/tasks",
        json={"title": "Background Verification", "assigned_to_id": 2},  # assigned to vhr1
        headers=headers_emp,
    )
    task_id = create_resp.json()["id"]

    # Update status by vhr1
    headers_vhr1 = {"Authorization": f"Bearer {vhr1_token}"}
    status_payload = {
        "status": "In Progress",
        "progress_note": "Candidate provided requested tax identification papers.",
    }
    update_resp = client.patch(
        f"/api/tasks/{task_id}/status",
        json=status_payload,
        headers=headers_vhr1,
    )
    assert update_resp.status_code == 200
    updated_data = update_resp.json()
    assert updated_data["status"] == "In Progress"
    assert any("Candidate provided" in act["details"] for act in updated_data["activities"])


def test_vhr_cannot_update_another_users_task(client, employer_token, vhr2_token):
    """Test security constraint: Virtual HR cannot modify tasks assigned to someone else."""
    headers_emp = {"Authorization": f"Bearer {employer_token}"}
    # Create task assigned to vhr1 (id: 2)
    create_resp = client.post(
        "/api/tasks",
        json={"title": "Confidential Executive Onboarding", "assigned_to_id": 2},
        headers=headers_emp,
    )
    task_id = create_resp.json()["id"]

    # Attempt to update status using vhr2's token (id: 3)
    headers_vhr2 = {"Authorization": f"Bearer {vhr2_token}"}
    status_payload = {
        "status": "Completed",
        "progress_note": "Attempting unauthorized status update.",
    }
    update_resp = client.patch(
        f"/api/tasks/{task_id}/status",
        json=status_payload,
        headers=headers_vhr2,
    )
    assert update_resp.status_code == 403
    assert "only update status of tasks assigned to them" in update_resp.json()["detail"]


def test_dashboard_stats_calculation(client, employer_token):
    """Test dashboard stats endpoint returns real database counts."""
    headers = {"Authorization": f"Bearer {employer_token}"}
    # Create tasks
    client.post("/api/tasks", json={"title": "Task A"}, headers=headers)
    client.post("/api/tasks", json={"title": "Task B"}, headers=headers)

    response = client.get("/api/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_tasks"] == 2
    assert data["pending_tasks"] == 2
    assert data["completed_tasks"] == 0
