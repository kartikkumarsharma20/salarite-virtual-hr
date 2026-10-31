from datetime import datetime, timedelta, timezone, date
from sqlalchemy.orm import Session
from app.database.connection import Base, engine, SessionLocal
from app.models import User, Task, Interview, TaskActivity
from app.core.security import get_password_hash
from app.utils.datetime_utils import utc_now


def init_db():
    """Create all tables and seed initial demo data if database is empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if users exist already
        existing_users_count = db.query(User).count()
        if existing_users_count > 0:
            return

        # Seed Users
        employer = User(
            email="alex.vance@salarite.com",
            full_name="Alex Vance",
            role="employer",
            hashed_password=get_password_hash("Employer123!"),
            is_active=True,
        )
        vhr_sarah = User(
            email="sarah.connor@salarite.com",
            full_name="Sarah Connor",
            role="virtual_hr",
            hashed_password=get_password_hash("VirtualHR123!"),
            is_active=True,
        )
        vhr_david = User(
            email="david.miller@salarite.com",
            full_name="David Miller",
            role="virtual_hr",
            hashed_password=get_password_hash("VirtualHR123!"),
            is_active=True,
        )

        db.add_all([employer, vhr_sarah, vhr_david])
        db.commit()
        db.refresh(employer)
        db.refresh(vhr_sarah)
        db.refresh(vhr_david)

        now = utc_now()

        # Seed Tasks
        t1 = Task(
            title="Onboarding Paperwork for Senior DevOps Engineer",
            description="Collect signed NDA, identity documents, and direct deposit details for incoming Senior DevOps hire.",
            status="In Progress",
            priority="High",
            deadline=now + timedelta(days=3),
            assigned_by_id=employer.id,
            assigned_to_id=vhr_sarah.id,
            created_at=now - timedelta(days=2),
            updated_at=now - timedelta(hours=4),
        )
        t2 = Task(
            title="Conduct Reference Checks for QA Lead Candidates",
            description="Reach out to 2 former managers for candidates in the final interview phase for QA Lead position.",
            status="Pending",
            priority="Medium",
            deadline=now + timedelta(days=5),
            assigned_by_id=employer.id,
            assigned_to_id=vhr_david.id,
            created_at=now - timedelta(days=1),
            updated_at=now - timedelta(days=1),
        )
        t3 = Task(
            title="Prepare Compensation Benchmark Report Q4",
            description="Compile salary band analysis against local industry standards for engineering and product roles.",
            status="Completed",
            priority="Urgent",
            deadline=now - timedelta(days=1),
            assigned_by_id=employer.id,
            assigned_to_id=vhr_sarah.id,
            created_at=now - timedelta(days=5),
            updated_at=now - timedelta(days=1),
        )
        t4 = Task(
            title="Resolve Background Check Discrepancy - Candidate #1042",
            description="Clarify employment dates gap with third-party background screening vendor for candidate #1042.",
            status="Blocked",
            priority="Urgent",
            deadline=now + timedelta(days=1),
            assigned_by_id=employer.id,
            assigned_to_id=vhr_david.id,
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(hours=6),
        )
        t5 = Task(
            title="Draft Remote Work Policy Amendment",
            description="Update equipment reimbursement clauses and home office ergonomics guidelines in the handbook.",
            status="Pending",
            priority="Low",
            deadline=now + timedelta(days=10),
            assigned_by_id=employer.id,
            assigned_to_id=vhr_sarah.id,
            created_at=now - timedelta(hours=12),
            updated_at=now - timedelta(hours=12),
        )
        t6 = Task(
            title="Coordinate Final Round Technical Interviews for Frontend Team",
            description="Align schedules with VP of Engineering and 3 candidate finalists across time zones.",
            status="In Progress",
            priority="High",
            deadline=now + timedelta(days=2),
            assigned_by_id=employer.id,
            assigned_to_id=vhr_david.id,
            created_at=now - timedelta(days=1, hours=8),
            updated_at=now - timedelta(hours=2),
        )

        db.add_all([t1, t2, t3, t4, t5, t6])
        db.commit()
        for t in [t1, t2, t3, t4, t5, t6]:
            db.refresh(t)

        # Seed Task Activities
        act1_create = TaskActivity(
            task_id=t1.id,
            user_id=employer.id,
            action="created",
            details="Task created by Alex Vance and assigned to Sarah Connor",
            created_at=now - timedelta(days=2),
        )
        act1_status = TaskActivity(
            task_id=t1.id,
            user_id=vhr_sarah.id,
            action="status_changed",
            details="Status changed to In Progress: 'Gathered initial compliance forms, awaiting bank verification.'",
            created_at=now - timedelta(hours=4),
        )

        act3_create = TaskActivity(
            task_id=t3.id,
            user_id=employer.id,
            action="created",
            details="Task created by Alex Vance and assigned to Sarah Connor",
            created_at=now - timedelta(days=5),
        )
        act3_done = TaskActivity(
            task_id=t3.id,
            user_id=vhr_sarah.id,
            action="status_changed",
            details="Status changed to Completed: 'Compensation report finalized and submitted to leadership.'",
            created_at=now - timedelta(days=1),
        )

        act4_create = TaskActivity(
            task_id=t4.id,
            user_id=employer.id,
            action="created",
            details="Task created by Alex Vance and assigned to David Miller",
            created_at=now - timedelta(days=3),
        )
        act4_block = TaskActivity(
            task_id=t4.id,
            user_id=vhr_david.id,
            action="status_changed",
            details="Status changed to Blocked: 'Waiting on vendor verification agency escalation response.'",
            created_at=now - timedelta(hours=6),
        )

        db.add_all([act1_create, act1_status, act3_create, act3_done, act4_create, act4_block])

        # Seed Interviews
        today = date.today()
        i1 = Interview(
            candidate_name="Elena Rostova",
            candidate_email="elena.rostova@example.com",
            candidate_phone="+1 (555) 234-5678",
            interview_date=today + timedelta(days=1),
            start_time="10:00 AM",
            duration_minutes=45,
            mode="Video",
            status="Scheduled",
            notes="Senior React Engineer position. Focus on component architecture and state management.",
            created_by_id=employer.id,
            created_at=now - timedelta(days=1),
        )
        i2 = Interview(
            candidate_name="Marcus Sterling",
            candidate_email="marcus.s@example.com",
            candidate_phone="+1 (555) 345-6789",
            interview_date=today + timedelta(days=1),
            start_time="02:30 PM",
            duration_minutes=30,
            mode="Voice",
            status="Scheduled",
            notes="Preliminary behavioral screening for Product Manager role.",
            created_by_id=employer.id,
            created_at=now - timedelta(days=2),
        )
        i3 = Interview(
            candidate_name="Aisha Patel",
            candidate_email="aisha.patel@example.com",
            candidate_phone="+1 (555) 456-7890",
            interview_date=today + timedelta(days=2),
            start_time="11:00 AM",
            duration_minutes=30,
            mode="Chat",
            status="Scheduled",
            notes="Initial async chat screening for Content Marketing Specialist.",
            created_by_id=employer.id,
            created_at=now - timedelta(hours=8),
        )
        i4 = Interview(
            candidate_name="Julian Hayes",
            candidate_email="julian.h@example.com",
            candidate_phone="+1 (555) 567-8901",
            interview_date=today - timedelta(days=1),
            start_time="04:00 PM",
            duration_minutes=60,
            mode="Video",
            status="Completed",
            notes="System Architecture discussion. Candidate demonstrated outstanding technical depth.",
            created_by_id=employer.id,
            created_at=now - timedelta(days=4),
        )
        i5 = Interview(
            candidate_name="Chloe Bennett",
            candidate_email="chloe.b@example.com",
            candidate_phone="+1 (555) 678-9012",
            interview_date=today - timedelta(days=3),
            start_time="01:00 PM",
            duration_minutes=45,
            mode="Voice",
            status="Cancelled",
            notes="Candidate accepted an offer elsewhere prior to call.",
            created_by_id=employer.id,
            created_at=now - timedelta(days=6),
        )

        db.add_all([i1, i2, i3, i4, i5])
        db.commit()
    finally:
        db.close()
