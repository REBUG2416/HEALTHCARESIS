// This file represents the database schema for the Healthcare Student Information System
// In a real application, this would be implemented using an ORM like Prisma or TypeORM

export interface Patient {
  id: string
  studentId: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: "Male" | "Female" | "Other"
  address: string
  phoneNumber: string
  email: string
  medicalHistory: string
  allergies: string
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  patientId: string
  userId: string // Healthcare provider
  appointmentDate: Date
  appointmentType: string
  notes: string
  status: "Scheduled" | "Completed" | "Cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  username: string
  password: string // Hashed
  role: "admin" | "healthcare" | "student"
  email: string
  firstName: string
  lastName: string
  createdAt: Date
  updatedAt: Date
}

export interface Prescription {
  id: string
  patientId: string
  userId: string // Healthcare provider
  prescriptionDate: Date
  medication: string
  dosage: string
  frequency: string
  startDate: Date
  endDate: Date
  instructions: string
  status: "Active" | "Expired" | "Cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface MedicalRecord {
  id: string
  patientId: string
  userId: string // Healthcare provider
  recordDate: Date
  diagnosis: string
  treatment: string
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface Billing {
  id: string
  patientId: string
  appointmentId: string | null
  prescriptionId: string | null
  amount: number
  description: string
  status: "Pending" | "Paid" | "Cancelled"
  paymentDate: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Insurance {
  id: string
  patientId: string
  provider: string
  policyNumber: string
  coverageDetails: string
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface HealthAlert {
  id: string
  title: string
  description: string
  severity: "Low" | "Medium" | "High"
  startDate: Date
  endDate: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// SQL Schema (for reference)
/*
CREATE TABLE patients (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL,
  address VARCHAR(255),
  phone_number VARCHAR(20),
  email VARCHAR(100),
  medical_history TEXT,
  allergies TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  appointment_date DATETIME NOT NULL,
  appointment_type VARCHAR(50) NOT NULL,
  notes TEXT,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE prescriptions (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  prescription_date DATE NOT NULL,
  medication VARCHAR(100) NOT NULL,
  dosage VARCHAR(50) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  instructions TEXT,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE medical_records (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  record_date DATETIME NOT NULL,
  diagnosis VARCHAR(255) NOT NULL,
  treatment TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE billings (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  appointment_id VARCHAR(36),
  prescription_id VARCHAR(36),
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,
  payment_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
);

CREATE TABLE insurances (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  policy_number VARCHAR(50) NOT NULL,
  coverage_details TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE health_alerts (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
*/

