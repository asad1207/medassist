from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid
import enum


def gen_uuid():
    return str(uuid.uuid4())


class RiskLevel(str, enum.Enum):
    mild = "mild"
    moderate = "moderate"
    emergency = "emergency"


class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id              = Column(String, primary_key=True, default=gen_uuid)
    email           = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name       = Column(String, nullable=False)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime, server_default=func.now())
    updated_at      = Column(DateTime, onupdate=func.now())

    profile         = relationship("HealthProfile", back_populates="user", uselist=False)
    symptom_checks  = relationship("SymptomCheck", back_populates="user")
    appointments    = relationship("Appointment", back_populates="user")


class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id                      = Column(String, primary_key=True, default=gen_uuid)
    user_id                 = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    age                     = Column(Integer)
    gender                  = Column(String)
    blood_group             = Column(String)
    height_cm               = Column(Float)
    weight_kg               = Column(Float)
    medical_conditions      = Column(Text)
    allergies               = Column(Text)
    current_medications     = Column(Text)
    emergency_contact_name  = Column(String)
    emergency_contact_phone = Column(String)
    smoking                 = Column(Boolean, default=False)
    alcohol                 = Column(Boolean, default=False)
    exercise_frequency      = Column(String)
    created_at              = Column(DateTime, server_default=func.now())
    updated_at              = Column(DateTime, onupdate=func.now())

    user = relationship("User", back_populates="profile")


class SymptomCheck(Base):
    __tablename__ = "symptom_checks"

    id                 = Column(String, primary_key=True, default=gen_uuid)
    user_id            = Column(String, ForeignKey("users.id"), nullable=False)
    symptoms           = Column(Text, nullable=False)
    severity           = Column(Integer, nullable=False)
    duration_days      = Column(Integer)
    risk_level         = Column(String, nullable=False)  # mild / moderate / emergency
    risk_score         = Column(Float)
    ai_recommendation  = Column(Text)
    ai_reviewed        = Column(Boolean, default=False)
    created_at         = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="symptom_checks")


class Appointment(Base):
    __tablename__ = "appointments"

    id               = Column(String, primary_key=True, default=gen_uuid)
    user_id          = Column(String, ForeignKey("users.id"), nullable=False)
    doctor_name      = Column(String)
    specialty        = Column(String)
    appointment_date = Column(DateTime, nullable=False)
    notes            = Column(Text)
    status           = Column(String, default=AppointmentStatus.scheduled.value)
    created_at       = Column(DateTime, server_default=func.now())
    updated_at       = Column(DateTime, onupdate=func.now())

    user = relationship("User", back_populates="appointments")
