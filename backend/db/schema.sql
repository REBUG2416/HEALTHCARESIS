-- Database schema for Healthcare Student Information System

-- Create tables

-- Users table
CREATE TABLE users (
  id VARCHAR(20) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Patients table
CREATE TABLE patients (
  id VARCHAR(20) PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL,
  address TEXT,
  phone_number VARCHAR(20),
  email VARCHAR(100),
  medical_history TEXT,
  allergies TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Appointments table
CREATE TABLE appointments (
  id VARCHAR(20) PRIMARY KEY,
  patient_id VARCHAR(20) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP NOT NULL,
  appointment_type VARCHAR(50) NOT NULL,
  notes TEXT,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Prescriptions table
CREATE TABLE prescriptions (
  id VARCHAR(20) PRIMARY KEY,
  patient_id VARCHAR(20) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prescription_date DATE NOT NULL,
  medication VARCHAR(100) NOT NULL,
  dosage VARCHAR(50) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Medical Records table
CREATE TABLE medical_records (
  id VARCHAR(20) PRIMARY KEY,
  patient_id VARCHAR(20) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_date TIMESTAMP NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Billings table
CREATE TABLE billings (
  id VARCHAR(20) PRIMARY KEY,
  patient_id VARCHAR(20) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id VARCHAR(20) REFERENCES appointments(id) ON DELETE SET NULL,
  prescription_id VARCHAR(20) REFERENCES prescriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL,
  payment_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_patients_student_id ON patients(student_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_billings_patient_id ON billings(patient_id);

