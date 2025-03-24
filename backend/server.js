const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(
  cors({
    origin: "*", // For testing purposes only. Use specific origins in production.
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const db = {
  patients: [
    {
      id: "STU-2023-0001",
      student_id: "STU-2023-0001",
      first_name: "John",
      last_name: "Doe",
      date_of_birth: "1998-05-15",
      gender: "Male",
      address: "123 Campus Street, Lagos",
      phone_number: "+234 812 345 6789",
      email: "john.doe@example.com",
      medical_history: "No significant medical history",
      allergies: "None",
      created_at: "2023-01-15T10:30:00Z",
      updated_at: "2023-01-15T10:30:00Z",
    },
    {
      id: "STU-2023-0002",
      student_id: "STU-2023-0002",
      first_name: "Jane",
      last_name: "Smith",
      date_of_birth: "1999-08-22",
      gender: "Female",
      address: "456 University Road, Abuja",
      phone_number: "+234 809 876 5432",
      email: "jane.smith@example.com",
      medical_history: "Asthma",
      allergies: "Peanuts",
      created_at: "2023-01-20T14:15:00Z",
      updated_at: "2023-01-20T14:15:00Z",
    },
    {
      id: "STU-2023-0003",
      student_id: "STU-2023-0003",
      first_name: "Michael",
      last_name: "Brown",
      date_of_birth: "1997-03-10",
      gender: "Male",
      address: "789 College Avenue, Lagos",
      phone_number: "+234 701 234 5678",
      email: "michael.brown@example.com",
      medical_history: "Fractured right arm (2020)",
      allergies: "Penicillin",
      created_at: "2023-02-05T09:45:00Z",
      updated_at: "2023-02-05T09:45:00Z",
    },
    {
      id: "STU-2023-0004",
      student_id: "STU-2023-0004",
      first_name: "Sarah",
      last_name: "Johnson",
      date_of_birth: "2000-11-18",
      gender: "Female",
      address: "321 University Lane, Ibadan",
      phone_number: "+234 803 987 6543",
      email: "sarah.johnson@example.com",
      medical_history: "Migraine",
      allergies: "Shellfish",
      created_at: "2023-02-10T11:20:00Z",
      updated_at: "2023-02-10T11:20:00Z",
    },
  ],
  appointments: [
    {
      id: "APT-2023-0001",
      patient_id: "STU-2023-0001",
      user_id: "USR-2023-0001",
      appointment_date: "2023-10-20T10:00:00Z",
      appointment_type: "General Checkup",
      notes: "Regular health checkup",
      status: "Scheduled",
      created_at: "2023-10-15T08:30:00Z",
      updated_at: "2023-10-15T08:30:00Z",
    },
    {
      id: "APT-2023-0002",
      patient_id: "STU-2023-0002",
      user_id: "USR-2023-0002",
      appointment_date: "2023-10-20T11:30:00Z",
      appointment_type: "Follow-up",
      notes: "Follow-up for previous treatment",
      status: "Scheduled",
      created_at: "2023-10-15T09:45:00Z",
      updated_at: "2023-10-15T09:45:00Z",
    },
    {
      id: "APT-2023-0003",
      patient_id: "STU-2023-0003",
      user_id: "USR-2023-0003",
      appointment_date: "2023-10-20T14:15:00Z",
      appointment_type: "Vaccination",
      notes: "Annual flu vaccination",
      status: "Scheduled",
      created_at: "2023-10-16T10:20:00Z",
      updated_at: "2023-10-16T10:20:00Z",
    },
    {
      id: "APT-2023-0004",
      patient_id: "STU-2023-0004",
      user_id: "USR-2023-0001",
      appointment_date: "2023-10-21T09:00:00Z",
      appointment_type: "General Checkup",
      notes: "Regular health checkup",
      status: "Scheduled",
      created_at: "2023-10-16T14:10:00Z",
      updated_at: "2023-10-16T14:10:00Z",
    },
  ],
  prescriptions: [
    {
      id: "PRE-2023-0001",
      patient_id: "STU-2023-0001",
      user_id: "USR-2023-0001",
      prescription_date: "2023-10-15",
      medication: "Paracetamol",
      dosage: "500mg",
      frequency: "3 times daily",
      start_date: "2023-10-15",
      end_date: "2023-10-22",
      instructions: "Take after meals",
      status: "Active",
      created_at: "2023-10-15T11:30:00Z",
      updated_at: "2023-10-15T11:30:00Z",
    },
    {
      id: "PRE-2023-0002",
      patient_id: "STU-2023-0002",
      user_id: "USR-2023-0002",
      prescription_date: "2023-10-10",
      medication: "Amoxicillin",
      dosage: "250mg",
      frequency: "2 times daily",
      start_date: "2023-10-10",
      end_date: "2023-10-17",
      instructions: "Take with water",
      status: "Active",
      created_at: "2023-10-10T13:45:00Z",
      updated_at: "2023-10-10T13:45:00Z",
    },
    {
      id: "PRE-2023-0003",
      patient_id: "STU-2023-0003",
      user_id: "USR-2023-0003",
      prescription_date: "2023-10-05",
      medication: "Ibuprofen",
      dosage: "400mg",
      frequency: "As needed",
      start_date: "2023-10-05",
      end_date: "2023-10-12",
      instructions: "Take for pain relief",
      status: "Expired",
      created_at: "2023-10-05T15:20:00Z",
      updated_at: "2023-10-05T15:20:00Z",
    },
    {
      id: "PRE-2023-0004",
      patient_id: "STU-2023-0004",
      user_id: "USR-2023-0001",
      prescription_date: "2023-10-12",
      medication: "Loratadine",
      dosage: "10mg",
      frequency: "Once daily",
      start_date: "2023-10-12",
      end_date: "2023-10-26",
      instructions: "Take for allergy relief",
      status: "Active",
      created_at: "2023-10-12T10:15:00Z",
      updated_at: "2023-10-12T10:15:00Z",
    },
  ],
  users: [
    {
      id: "USR-2023-0001",
      username: "dr.smith",
      password: "$2a$10$XQhg1UkYzXwLK6zNUF8Jz.4XwjhSbh2ZlO9OWfllQTH9pEFfZ7wOK", // hashed "password123"
      role: "healthcare",
      email: "dr.smith@example.com",
      first_name: "John",
      last_name: "Smith",
      created_at: "2023-01-01T08:00:00Z",
      updated_at: "2023-01-01T08:00:00Z",
    },
    {
      id: "USR-2023-0002",
      username: "dr.johnson",
      password: "$2a$10$XQhg1UkYzXwLK6zNUF8Jz.4XwjhSbh2ZlO9OWfllQTH9pEFfZ7wOK", // hashed "password123"
      role: "healthcare",
      email: "dr.johnson@example.com",
      first_name: "Emily",
      last_name: "Johnson",
      created_at: "2023-01-01T08:30:00Z",
      updated_at: "2023-01-01T08:30:00Z",
    },
    {
      id: "USR-2023-0003",
      username: "dr.williams",
      password: "$2a$10$XQhg1UkYzXwLK6zNUF8Jz.4XwjhSbh2ZlO9OWfllQTH9pEFfZ7wOK", // hashed "password123"
      role: "healthcare",
      email: "dr.williams@example.com",
      first_name: "Michael",
      last_name: "Williams",
      created_at: "2023-01-01T09:00:00Z",
      updated_at: "2023-01-01T09:00:00Z",
    },
    {
      id: "USR-2023-0004",
      username: "admin",
      password: "$2a$10$XQhg1UkYzXwLK6zNUF8Jz.4XwjhSbh2ZlO9OWfllQTH9pEFfZ7wOK", // hashed "password123"
      role: "admin",
      email: "admin@example.com",
      first_name: "Admin",
      last_name: "User",
      created_at: "2023-01-01T10:00:00Z",
      updated_at: "2023-01-01T10:00:00Z",
    },
  ],
  medical_records: [
    {
      id: "MR-2023-0001",
      patient_id: "STU-2023-0001",
      user_id: "USR-2023-0001",
      record_date: "2023-10-15T11:00:00Z",
      diagnosis: "Common Cold",
      treatment: "Rest, fluids, and over-the-counter medication",
      notes: "Patient reported symptoms of runny nose and sore throat",
      created_at: "2023-10-15T11:30:00Z",
      updated_at: "2023-10-15T11:30:00Z",
    },
    {
      id: "MR-2023-0002",
      patient_id: "STU-2023-0002",
      user_id: "USR-2023-0002",
      record_date: "2023-10-10T13:30:00Z",
      diagnosis: "Bacterial Infection",
      treatment: "Prescribed antibiotics",
      notes: "Patient reported fever and fatigue",
      created_at: "2023-10-10T14:00:00Z",
      updated_at: "2023-10-10T14:00:00Z",
    },
    {
      id: "MR-2023-0003",
      patient_id: "STU-2023-0003",
      user_id: "USR-2023-0003",
      record_date: "2023-10-05T15:00:00Z",
      diagnosis: "Sprained Ankle",
      treatment: "RICE (Rest, Ice, Compression, Elevation)",
      notes: "Patient injured ankle during sports activity",
      created_at: "2023-10-05T15:30:00Z",
      updated_at: "2023-10-05T15:30:00Z",
    },
    {
      id: "MR-2023-0004",
      patient_id: "STU-2023-0004",
      user_id: "USR-2023-0001",
      record_date: "2023-10-12T10:00:00Z",
      diagnosis: "Seasonal Allergies",
      treatment: "Prescribed antihistamine",
      notes: "Patient reported itchy eyes and sneezing",
      created_at: "2023-10-12T10:30:00Z",
      updated_at: "2023-10-12T10:30:00Z",
    },
  ],
  billings: [
    {
      id: "BIL-2023-0001",
      patient_id: "STU-2023-0001",
      appointment_id: "APT-2023-0001",
      prescription_id: "PRE-2023-0001",
      amount: 50.0,
      description: "General checkup and medication",
      status: "Paid",
      payment_date: "2023-10-15T12:00:00Z",
      created_at: "2023-10-15T11:45:00Z",
      updated_at: "2023-10-15T12:00:00Z",
    },
    {
      id: "BIL-2023-0002",
      patient_id: "STU-2023-0002",
      appointment_id: "APT-2023-0002",
      prescription_id: "PRE-2023-0002",
      amount: 75.0,
      description: "Follow-up consultation and antibiotics",
      status: "Pending",
      payment_date: null,
      created_at: "2023-10-10T14:15:00Z",
      updated_at: "2023-10-10T14:15:00Z",
    },
    {
      id: "BIL-2023-0003",
      patient_id: "STU-2023-0003",
      appointment_id: "APT-2023-0003",
      prescription_id: null,
      amount: 30.0,
      description: "Vaccination",
      status: "Pending",
      payment_date: null,
      created_at: "2023-10-16T10:30:00Z",
      updated_at: "2023-10-16T10:30:00Z",
    },
    {
      id: "BIL-2023-0004",
      patient_id: "STU-2023-0004",
      appointment_id: "APT-2023-0004",
      prescription_id: "PRE-2023-0004",
      amount: 65.0,
      description: "General checkup and allergy medication",
      status: "Paid",
      payment_date: "2023-10-12T11:00:00Z",
      created_at: "2023-10-12T10:45:00Z",
      updated_at: "2023-10-12T11:00:00Z",
    },
  ],
}


require("dotenv").config();
const { Sequelize, DataTypes, Op } = require("sequelize");

// Database connection
const sequelize = new Sequelize("postgresql://healthcare_ncdd_user:Fe8stW0C1rQabYU7PfUQMfw414axpADf@dpg-cvdenhjv2p9s73ceikl0-a.oregon-postgres.render.com/healthcare_ncdd", {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Define models
const Patient = sequelize.define(
  "Patient",
  {
    patient_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.STRING(20),
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
    },
    medical_history: {
      type: DataTypes.TEXT,
    },
    allergies: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "Active",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "patients",
  }
);

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(50),
    },
    last_name: {
      type: DataTypes.STRING(50),
    },
    phone_number: {
      type: DataTypes.STRING(20),
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "Active",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "users",
  }
);

const Appointment = sequelize.define(
  "Appointment",
  {
    appointment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "patients",
        key: "patient_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    appointment_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "Scheduled",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "appointments",
  }
);

const Prescription = sequelize.define(
  "Prescription",
  {
    prescription_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "patients",
        key: "patient_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    prescription_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    medication: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dosage: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    frequency: {
      type: DataTypes.STRING(50),
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
    },
    instructions: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "Active",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "prescriptions",
  }
);

const MedicalRecord = sequelize.define(
  "MedicalRecord",
  {
    record_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "patients",
        key: "patient_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    record_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    diagnosis: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    treatment: {
      type: DataTypes.TEXT,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    doctor_name: {
      type: DataTypes.STRING(100),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "medical_records",
  }
);

const VitalSign = sequelize.define(
  "VitalSign",
  {
    vital_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    record_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "medical_records",
        key: "record_id",
      },
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "patients",
        key: "patient_id",
      },
    },
    blood_pressure: {
      type: DataTypes.STRING(20),
    },
    heart_rate: {
      type: DataTypes.INTEGER,
    },
    temperature: {
      type: DataTypes.DECIMAL(5, 2),
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
    },
    blood_sugar: {
      type: DataTypes.STRING(20),
    },
    measured_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "vital_signs",
  }
);

const Billing = sequelize.define(
  "Billing",
  {
    billing_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "patients",
        key: "patient_id",
      },
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    service_description: {
      type: DataTypes.TEXT,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.STRING(20),
      defaultValue: "Pending",
    },
    payment_date: {
      type: DataTypes.DATEONLY,
    },
    due_date: {
      type: DataTypes.DATEONLY,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "billings",
  }
);

const Report = sequelize.define(
  "Report",
  {
    report_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    report_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    report_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
    },
    end_date: {
      type: DataTypes.DATEONLY,
    },
    parameters: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "reports",
  }
);

const QRCode = sequelize.define(
  "QRCode",
  {
    qr_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "patients",
        key: "patient_id",
      },
    },
    qr_data: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "qr_codes",
  }
);

// Define relationships
Patient.hasMany(Appointment, { foreignKey: "patient_id" });
Appointment.belongsTo(Patient, { foreignKey: "patient_id" });

User.hasMany(Appointment, { foreignKey: "user_id" });
Appointment.belongsTo(User, { foreignKey: "user_id" });

Patient.hasMany(Prescription, { foreignKey: "patient_id" });
Prescription.belongsTo(Patient, { foreignKey: "patient_id" });

User.hasMany(Prescription, { foreignKey: "user_id" });
Prescription.belongsTo(User, { foreignKey: "user_id" });

Patient.hasMany(MedicalRecord, { foreignKey: "patient_id" });
MedicalRecord.belongsTo(Patient, { foreignKey: "patient_id" });

User.hasMany(MedicalRecord, { foreignKey: "user_id" });
MedicalRecord.belongsTo(User, { foreignKey: "user_id" });

Patient.hasMany(VitalSign, { foreignKey: "patient_id" });
VitalSign.belongsTo(Patient, { foreignKey: "patient_id" });

MedicalRecord.hasMany(VitalSign, { foreignKey: "record_id" });
VitalSign.belongsTo(MedicalRecord, { foreignKey: "record_id" });

Patient.hasMany(Billing, { foreignKey: "patient_id" });
Billing.belongsTo(Patient, { foreignKey: "patient_id" });

User.hasMany(Report, { foreignKey: "user_id" });
Report.belongsTo(User, { foreignKey: "user_id" });

Patient.hasMany(QRCode, { foreignKey: "patient_id" });
QRCode.belongsTo(Patient, { foreignKey: "patient_id" });

// Sync all models with database
sequelize
  .sync()
  .then(() => {
    console.log("All models were synchronized successfully");
  })
  .catch((err) => {
    console.error("Error synchronizing models:", err);
  });

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Authentication routes
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/register", async (req, res) => {
  const { username, password, email, firstName, lastName, role, phoneNumber } = req.body;

  if (!username || !password || !email || !role) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      phone_number: phoneNumber,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.user_id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Patient routes
app.get("/api/patients", async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/patients/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (err) {
    console.error("Error fetching patient:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/patients", async (req, res) => {
  const {
    student_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    address,
    phone_number,
    email,
    medical_history,
    allergies,
    status,
  } = req.body;

  if (!first_name || !last_name || !date_of_birth || !gender || !phone_number) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const newPatient = await Patient.create({
      student_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      address,
      phone_number,
      email,
      medical_history,
      allergies,
      status: status || "Active",
    });

    res.status(201).json({
      message: "Patient created successfully",
      patient: newPatient,
    });
  } catch (err) {
    console.error("Error creating patient:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/patients/:id", async (req, res) => {
  const { id } = req.params;
  const {
    student_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    address,
    phone_number,
    email,
    medical_history,
    allergies,
    status,
  } = req.body;

  if (!first_name || !last_name || !date_of_birth || !gender || !phone_number) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    await patient.update({
      student_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      address,
      phone_number,
      email,
      medical_history,
      allergies,
      status,
      updated_at: new Date(),
    });

    res.json({
      message: "Patient updated successfully",
      patient,
    });
  } catch (err) {
    console.error("Error updating patient:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    await patient.destroy();
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting patient:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Appointment routes
app.get("/api/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Patient,
          attributes: ["first_name", "last_name"],
        },
        {
          model: User,
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    // Format the response to include patient and doctor names
    const formattedAppointments = appointments.map((appointment) => {
      const plainAppointment = appointment.get({ plain: true });
      return {
        ...plainAppointment,
        patientName: `${plainAppointment.Patient.first_name} ${plainAppointment.Patient.last_name}`,
        doctorName: `${plainAppointment.User.first_name} ${plainAppointment.User.last_name}`,
      };
    });

    res.json(formattedAppointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          attributes: ["first_name", "last_name", "phone_number", "email"],
        },
        {
          model: User,
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const plainAppointment = appointment.get({ plain: true });
    const formattedAppointment = {
      ...plainAppointment,
      patientName: `${plainAppointment.Patient.first_name} ${plainAppointment.Patient.last_name}`,
      doctorName: `${plainAppointment.User.first_name} ${plainAppointment.User.last_name}`,
    };

    res.json(formattedAppointment);
  } catch (err) {
    console.error("Error fetching appointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/appointments", async (req, res) => {
  const { patient_id, user_id, appointment_date, appointment_type, notes, status } = req.body;

  if (!patient_id || !user_id || !appointment_date || !appointment_type) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const newAppointment = await Appointment.create({
      patient_id,
      user_id,
      appointment_date,
      appointment_type,
      notes,
      status: status || "Scheduled",
    });

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: newAppointment,
    });
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;
  const { patient_id, user_id, appointment_date, appointment_type, notes, status } = req.body;

  if (!patient_id || !user_id || !appointment_date || !appointment_type) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await appointment.update({
      patient_id,
      user_id,
      appointment_date,
      appointment_type,
      notes,
      status,
      updated_at: new Date(),
    });

    res.json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await appointment.destroy();
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Prescription routes
app.get("/api/prescriptions", async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      include: [
        {
          model: Patient,
          attributes: ["first_name", "last_name"],
        },
        {
          model: User,
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    const formattedPrescriptions = prescriptions.map((prescription) => {
      const plainPrescription = prescription.get({ plain: true });
      return {
        ...plainPrescription,
        patientName: `${plainPrescription.Patient.first_name} ${plainPrescription.Patient.last_name}`,
        doctorName: `${plainPrescription.User.first_name} ${plainPrescription.User.last_name}`,
      };
    });

    res.json(formattedPrescriptions);
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/prescriptions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const prescription = await Prescription.findByPk(id, {
      include: [
        {
          model: Patient,
          attributes: ["first_name", "last_name", "phone_number", "email"],
        },
        {
          model: User,
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    const plainPrescription = prescription.get({ plain: true });
    const formattedPrescription = {
      ...plainPrescription,
      patientName: `${plainPrescription.Patient.first_name} ${plainPrescription.Patient.last_name}`,
      doctorName: `${plainPrescription.User.first_name} ${plainPrescription.User.last_name}`,
    };

    res.json(formattedPrescription);
  } catch (err) {
    console.error("Error fetching prescription:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/prescriptions", async (req, res) => {
  const {
    patient_id,
    user_id,
    prescription_date,
    medication,
    dosage,
    frequency,
    start_date,
    end_date,
    instructions,
    status,
  } = req.body;

  if (!patient_id || !user_id || !prescription_date || !medication || !dosage || !start_date) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const newPrescription = await Prescription.create({
      patient_id,
      user_id,
      prescription_date,
      medication,
      dosage,
      frequency,
      start_date,
      end_date,
      instructions,
      status: status || "Active",
    });

    res.status(201).json({
      message: "Prescription created successfully",
      prescription: newPrescription,
    });
  } catch (err) {
    console.error("Error creating prescription:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/prescriptions/:id", async (req, res) => {
  const { id } = req.params;
  const {
    patient_id,
    user_id,
    prescription_date,
    medication,
    dosage,
    frequency,
    start_date,
    end_date,
    instructions,
    status,
  } = req.body;
  if (!patient_id || !user_id || !prescription_date || !medication || !dosage || !start_date) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const prescription = await Prescription.findByPk(id);

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    await prescription.update({
      patient_id,
      user_id,
      prescription_date,
      medication,
      dosage,
      frequency,
      start_date,
      end_date,
      instructions,
      status,
      updated_at: new Date(),
    });

    res.json({
      message: "Prescription updated successfully",
      prescription,
    });
  } catch (err) {
    console.error("Error updating prescription:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/prescriptions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const prescription = await Prescription.findByPk(id);

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    await prescription.destroy();
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting prescription:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Medical Record routes
app.get("/api/medical-records", async (req, res) => {
  try {
    const records = await MedicalRecord.findAll({
      include: [
        {
          model: Patient,
          attributes: ["first_name", "last_name"],
        },
        {
          model: User,
          attributes: ["first_name", "last_name"],
        },
        {
          model: VitalSign,
        },
      ],
    });

    const formattedRecords = records.map((record) => {
      const plainRecord = record.get({ plain: true });
      return {
        ...plainRecord,
        patientName: `${plainRecord.Patient.first_name} ${plainRecord.Patient.last_name}`,
      };
    });

    res.json(formattedRecords);
  } catch (err) {
    console.error("Error fetching medical records:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/medical-records/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const record = await MedicalRecord.findByPk(id, {
      include: [
        {
          model: Patient,
          attributes: ["first_name", "last_name", "phone_number", "email"],
        },
        {
          model: User,
          attributes: ["first_name", "last_name"],
        },
        {
          model: VitalSign,
        },
      ],
    });

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    const plainRecord = record.get({ plain: true });
    const formattedRecord = {
      ...plainRecord,
      patientName: `${plainRecord.Patient.first_name} ${plainRecord.Patient.last_name}`,
    };

    res.json(formattedRecord);
  } catch (err) {
    console.error("Error fetching medical record:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/medical-records", async (req, res) => {
  const { patient_id, user_id, record_date, diagnosis, treatment, notes, doctor_name, vitals } = req.body;

  if (!patient_id || !user_id || !record_date || !diagnosis) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      // Create the medical record
      const newRecord = await MedicalRecord.create(
        {
          patient_id,
          user_id,
          record_date,
          diagnosis,
          treatment,
          notes,
          doctor_name,
        },
        { transaction: t }
      );
        if (vitals && newRecord) {
        await VitalSign.create(
          {
            record_id: newRecord.record_id,
            patient_id: patient_id,
            blood_pressure: vitals.blood_pressure,
            heart_rate: vitals.heart_rate,
            temperature: vitals.temperature,
            weight: vitals.weight,
            blood_sugar: vitals.blood_sugar,
            measured_at: record_date,
          },
          { transaction: t }
        );
      }

      return newRecord;
    });

    res.status(201).json({
      message: "Medical record created successfully",
      record: result,
    });
  } catch (err) {
    console.error("Error creating medical record:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/medical-records/:id", async (req, res) => {
  const { id } = req.params;
  const { patient_id, user_id, record_date, diagnosis, treatment, notes, doctor_name, vitals } = req.body;

  if (!patient_id || !user_id || !record_date || !diagnosis) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const record = await MedicalRecord.findByPk(id);

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Start a transaction
    await sequelize.transaction(async (t) => {
      // Update the medical record
      await record.update(
        {
          patient_id,
          user_id,
          record_date,
          diagnosis,
          treatment,
          notes,
          doctor_name,
          updated_at: new Date(),
        },
        { transaction: t }
      );

      // If vitals are provided, update or create vital signs record
      if (vitals) {
        const existingVital = await VitalSign.findOne({
          where: { record_id: id },
          transaction: t,
        });

        if (existingVital) {
          await existingVital.update(
            {
              blood_pressure: vitals.blood_pressure,
              heart_rate: vitals.heart_rate,
              temperature: vitals.temperature,
              weight: vitals.weight,
              blood_sugar: vitals.blood_sugar,
              measured_at: record_date,
            },
            { transaction: t }
          );
        } else {
          await VitalSign.create(
            {
              record_id: id,
              patient_id,
              blood_pressure: vitals.blood_pressure,
              heart_rate: vitals.heart_rate,
              temperature: vitals.temperature,
              weight: vitals.weight,
              blood_sugar: vitals.blood_sugar,
              measured_at: record_date,
            },
            { transaction: t }
          );
        }
      }
    });

    res.json({
      message: "Medical record updated successfully",
      record,
    });
  } catch (err) {
    console.error("Error updating medical record:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/medical-records/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const record = await MedicalRecord.findByPk(id);

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Start a transaction
    await sequelize.transaction(async (t) => {
      // Delete associated vital signs
      await VitalSign.destroy({
        where: { record_id: id },
        transaction: t,
      });

      // Delete the medical record
      await record.destroy({ transaction: t });
    });

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting medical record:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Billing routes
app.get("/api/billings", async (req, res) => {
  try {
    const billings = await Billing.findAll({
      include: [
        {
          model: Patient,
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    const formattedBillings = billings.map((billing) => {
      const plainBilling = billing.get({ plain: true });
      return {
        ...plainBilling,
        patientName: `${plainBilling.Patient.first_name} ${plainBilling.Patient.last_name}`,
      };
    });

    res.json(formattedBillings);
  } catch (err) {
    console.error("Error fetching billings:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/billings/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const billing = await Billing.findByPk(id, {
      include: [
        {
          model: Patient,
          attributes: ["first_name", "last_name", "phone_number", "email"],
        },
      ],
    });

    if (!billing) {
      return res.status(404).json({ message: "Billing record not found" });
    }

    const plainBilling = billing.get({ plain: true });
    const formattedBilling = {
      ...plainBilling,
      patientName: `${plainBilling.Patient.first_name} ${plainBilling.Patient.last_name}`,
    };

    res.json(formattedBilling);
  } catch (err) {
    console.error("Error fetching billing record:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/billings", async (req, res) => {
  const {
    patient_id,
    invoice_number,
    service_description,
    amount,
    tax,
    discount,
    total_amount,
    payment_status,
    payment_date,
    due_date,
    notes,
  } = req.body;

  if (!patient_id || !invoice_number || !amount || !total_amount) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const newBilling = await Billing.create({
      patient_id,
      invoice_number,
      service_description,
      amount,
      tax: tax || 0,
      discount: discount || 0,
      total_amount,
      payment_status: payment_status || "Pending",
      payment_date,
      due_date,
      notes,
    });

    res.status(201).json({
      message: "Billing record created successfully",
      billing: newBilling,
    });
  } catch (err) {
    console.error("Error creating billing record:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/billings/:id", async (req, res) => {
  const { id } = req.params;
  const {
    patient_id,
    invoice_number,
    service_description,
    amount,
    tax,
    discount,
    total_amount,
    payment_status,
    payment_date,
    due_date,
    notes,
  } = req.body;

  if (!patient_id || !invoice_number || !amount || !total_amount) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const billing = await Billing.findByPk(id);

    if (!billing) {
      return res.status(404).json({ message: "Billing record not found" });
    }

    await billing.update({
      patient_id,
      invoice_number,
      service_description,
      amount,
      tax: tax || 0,
      discount: discount || 0,
      total_amount,
      payment_status,
      payment_date,
      due_date,
      notes,
      updated_at: new Date(),
    });

    res.json({
      message: "Billing record updated successfully",
      billing,
    });
  } catch (err) {
    console.error("Error updating billing record:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/billings/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const billing = await Billing.findByPk(id);

    if (!billing) {
      return res.status(404).json({ message: "Billing record not found" });
    }

    await billing.destroy();
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting billing record:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Report routes
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [
        {
          model: User,
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    const formattedReports = reports.map((report) => {
      const plainReport = report.get({ plain: true });
      return {
        ...plainReport,
        userName: `${plainReport.User.first_name} ${plainReport.User.last_name}`,
      };
    });

    res.json(formattedReports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/reports", async (req, res) => {
  const { user_id, report_type, report_name, start_date, end_date, parameters } = req.body;

  if (!user_id || !report_type || !report_name) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const newReport = await Report.create({
      user_id,
      report_type,
      report_name,
      start_date,
      end_date,
      parameters,
    });

    res.status(201).json({
      message: "Report created successfully",
      report: newReport,
    });
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// QR Code routes
app.get("/api/qr-codes/:patientId", async (req, res) => {
  const { patientId } = req.params;

  try {
    const qrCode = await QRCode.findOne({
      where: { patient_id: patientId },
      order: [["created_at", "DESC"]],
    });

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    res.json(qrCode);
  } catch (err) {
    console.error("Error fetching QR code:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/qr-codes", async (req, res) => {
  const { patient_id, qr_data } = req.body;

  if (!patient_id || !qr_data) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const newQRCode = await QRCode.create({
      patient_id,
      qr_data,
    });

    res.status(201).json({
      message: "QR code created successfully",
      qrCode: newQRCode,
    });
  } catch (err) {
    console.error("Error creating QR code:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User routes
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, first_name, last_name, role, phone_number, status } = req.body;

  if (!username || !email || !role) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      username,
      email,
      first_name,
      last_name,
      role,
      phone_number,
      status,
      updated_at: new Date(),
    });

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Dashboard statistics
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const totalPatients = await Patient.count();
    const activePatients = await Patient.count({ where: { status: "Active" } });
    const totalAppointments = await Appointment.count();
    const upcomingAppointments = await Appointment.count({
      where: {
        appointment_date: {
          [Op.gte]: new Date(),
        },
        status: "Scheduled",
      },
    });
    const activePrescriptions = await Prescription.count({ where: { status: "Active" } });
    const totalUsers = await User.count();
    const totalDoctors = await User.count({ where: { role: "Doctor" } });

    res.json({
      totalPatients,
      activePatients,
      totalAppointments,
      upcomingAppointments,
      activePrescriptions,
      totalUsers,
      totalDoctors,
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// EHR Integration Models
// 1. EHR Configuration
const EHRConfig = sequelize.define(
  "EHRConfig",
  {
    config_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    api_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    api_key: {
      type: DataTypes.STRING(255),
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sync_frequency: {
      type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly'),
      defaultValue: 'daily',
    },
    auto_sync: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "ehr_config",
  }
);

// 2. EHR Patient Mappings
const EHRPatientMapping = sequelize.define(
  "EHRPatientMapping",
  {
    mapping_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "patients",
        key: "patient_id",
      },
    },
    ehr_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('mapped', 'unmapped', 'error'),
      defaultValue: 'unmapped',
    },
    error_message: {
      type: DataTypes.TEXT,
    },
    last_synced: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "ehr_patient_mappings",
    indexes: [
      {
        unique: true,
        fields: ['patient_id']
      },
      {
        unique: true,
        fields: ['ehr_id']
      }
    ]
  }
);

// 3. EHR Sync History
const EHRSyncHistory = sequelize.define(
  "EHRSyncHistory",
  {
    sync_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sync_type: {
      type: DataTypes.ENUM('full', 'patient', 'scheduled'),
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'completed', 'failed'),
      defaultValue: 'in_progress',
    },
    total_patients: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    synced_patients: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failed_patients: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    error_message: {
      type: DataTypes.TEXT,
    },
    initiated_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "ehr_sync_history",
  }
);

// 4. EHR Sync Details
const EHRSyncDetail = sequelize.define(
  "EHRSyncDetail",
  {
    detail_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sync_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ehr_sync_history",
        key: "sync_id",
      },
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "patients",
        key: "patient_id",
      },
    },
    status: {
      type: DataTypes.ENUM('success', 'failed'),
      allowNull: false,
    },
    error_message: {
      type: DataTypes.TEXT,
    },
    sync_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "ehr_sync_details",
  }
);

// 5. EHR Field Mappings (Optional)
const EHRFieldMapping = sequelize.define(
  "EHRFieldMapping",
  {
    field_mapping_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    local_field: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ehr_field: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    field_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    transformation_rule: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "ehr_field_mappings",
  }
);

// Define relationships for EHR models
Patient.hasOne(EHRPatientMapping, { foreignKey: "patient_id" });
EHRPatientMapping.belongsTo(Patient, { foreignKey: "patient_id" });

EHRSyncHistory.hasMany(EHRSyncDetail, { foreignKey: "sync_id" });
EHRSyncDetail.belongsTo(EHRSyncHistory, { foreignKey: "sync_id" });

Patient.hasMany(EHRSyncDetail, { foreignKey: "patient_id" });
EHRSyncDetail.belongsTo(Patient, { foreignKey: "patient_id" });

// Sync all EHR models with database
Promise.all([
  EHRConfig.sync(),
  EHRPatientMapping.sync(),
  EHRSyncHistory.sync(),
  EHRSyncDetail.sync(),
  EHRFieldMapping.sync()
])
  .then(() => {
    console.log("All EHR models were synchronized successfully");
    
    // Insert default EHR configuration if none exists
    return EHRConfig.findOne();
  })
  .then(async (config) => {
    if (!config) {
      await EHRConfig.create({
        api_url: '',
        enabled: false,
        sync_frequency: 'daily',
        auto_sync: false
      });
      console.log("Default EHR configuration created");
    }
    
    // Insert default field mappings if none exist
    const mappingsCount = await EHRFieldMapping.count();
    if (mappingsCount === 0) {
      await EHRFieldMapping.bulkCreate([
        { local_field: 'first_name', ehr_field: 'firstName', field_type: 'string', is_required: true },
        { local_field: 'last_name', ehr_field: 'lastName', field_type: 'string', is_required: true },
        { local_field: 'date_of_birth', ehr_field: 'birthDate', field_type: 'date', is_required: true },
        { local_field: 'gender', ehr_field: 'gender', field_type: 'string', is_required: true },
        { local_field: 'phone_number', ehr_field: 'phone', field_type: 'string', is_required: false },
        { local_field: 'email', ehr_field: 'email', field_type: 'string', is_required: false },
        { local_field: 'address', ehr_field: 'address', field_type: 'string', is_required: false },
        { local_field: 'medical_history', ehr_field: 'medicalHistory', field_type: 'text', is_required: false },
        { local_field: 'allergies', ehr_field: 'allergies', field_type: 'text', is_required: false }
      ]);
      console.log("Default EHR field mappings created");
    }
  })
  .catch((err) => {
    console.error("Error synchronizing EHR models:", err);
  });

  // Add this function to transform patient data according to field mappings
async function transformPatientDataForEHR(patient) {
  try {
    // Get all field mappings
    const fieldMappings = await EHRFieldMapping.findAll();
    
    // Create a transformed data object for EHR
    const transformedData = {};
    
    // Apply each field mapping
    for (const mapping of fieldMappings) {
      const localField = mapping.local_field;
      const ehrField = mapping.ehr_field;
      
      // Get the value from the patient object
      let value = patient[localField];
      
      // Apply transformation rule if exists
      if (mapping.transformation_rule && value !== null && value !== undefined) {
        try {
          // Simple transformation using eval (in production, use a safer approach)
          // The transformation_rule should be a function body that uses 'value' and returns the transformed value
          // Example: "return value.toUpperCase();"
          const transformFn = new Function('value', mapping.transformation_rule);
          value = transformFn(value);
        } catch (error) {
          console.error(`Error applying transformation for field ${localField}:`, error);
        }
      }
      
      // Add to transformed data
      transformedData[ehrField] = value;
    }
    
    return transformedData;
  } catch (error) {
    console.error("Error transforming patient data:", error);
    throw error;
  }
}

// Add this function to export patient data to EHR
async function exportPatientToEHR(patient, config) {
  // Transform patient data according to field mappings
  const transformedData = await transformPatientDataForEHR(patient);
  
  // In a real implementation, this would make an API call to the EHR system
  // For simulation, we'll log the data that would be sent
  console.log(`Exporting patient data to EHR: ${config.api_url}`);
  console.log("Transformed data:", JSON.stringify(transformedData, null, 2));
  
  // Simulate API call
  // In production, this would be a real API call using fetch or axios
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // Simulate occasional failures
      if (Math.random() < 0.05) {
        reject(new Error("EHR API connection timeout"));
      } else {
        resolve({
          success: true,
          ehrId: transformedData.ehrId || `EHR-${patient.student_id || patient.patient_id}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          timestamp: new Date().toISOString()
        });
      }
    }, 500);
  });
}

// EHR API Routes
// 1. Get EHR Configuration
app.get("/api/ehr/config", async (req, res) => {
  try {
    const config = await EHRConfig.findOne();
    if (!config) {
      return res.status(404).json({ message: "EHR configuration not found" });
    }
    
    // Don't send the API key in the response for security
    const configData = config.get({ plain: true });
    delete configData.api_key;
    
    res.json(configData);
  } catch (err) {
    console.error("Error fetching EHR configuration:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 2. Update EHR Configuration
app.put("/api/ehr/config", async (req, res) => {
  const { api_url, api_key, enabled, sync_frequency, auto_sync } = req.body;
  
  try {
    let config = await EHRConfig.findOne();
    
    if (!config) {
      config = await EHRConfig.create({
        api_url,
        api_key,
        enabled,
        sync_frequency,
        auto_sync,
      });
    } else {
      // Only update the API key if provided
      const updateData = {
        api_url,
        enabled,
        sync_frequency,
        auto_sync,
        last_updated: new Date()
      };
      
      if (api_key) {
        updateData.api_key = api_key;
      }
      
      await config.update(updateData);
    }
    
    // Don't send the API key in the response for security
    const configData = config.get({ plain: true });
    delete configData.api_key;
    
    res.json({
      message: "EHR configuration updated successfully",
      config: configData
    });
  } catch (err) {
    console.error("Error updating EHR configuration:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 3. Get EHR Status
app.get("/api/ehr/status", async (req, res) => {
  try {
    const config = await EHRConfig.findOne();
    if (!config) {
      return res.status(404).json({ message: "EHR configuration not found" });
    }
    
    // Get patient statistics
    const totalPatients = await Patient.count();
    const totalMappedPatients = await EHRPatientMapping.count({
      where: { status: 'mapped' }
    });
    
    // Calculate time since last sync
    let timeSinceLastSync = null;
    const lastSync = await EHRSyncHistory.findOne({
      where: { status: 'completed' },
      order: [['end_time', 'DESC']]
    });
    
    if (lastSync && lastSync.end_time) {
      const lastSyncDate = new Date(lastSync.end_time);
      const now = new Date();
      timeSinceLastSync = Math.floor((now - lastSyncDate) / (1000 * 60 * 60)); // hours
    }
    
    res.json({
      status: config.enabled && config.api_url ? "operational" : "disconnected",
      apiUrl: config.api_url,
      lastSync: lastSync ? lastSync.end_time : null,
      enabled: config.enabled,
      autoSync: config.auto_sync,
      syncFrequency: config.sync_frequency,
      timeSinceLastSync,
      totalPatients,
      totalMappedPatients,
      unmappedPatients: totalPatients - totalMappedPatients
    });
  } catch (err) {
    console.error("Error fetching EHR status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 4. Get All Patient Mappings
app.get("/api/ehr/mappings", async (req, res) => {
  try {
    const mappings = await EHRPatientMapping.findAll({
      include: [
        {
          model: Patient,
          attributes: ['first_name', 'last_name', 'student_id']
        }
      ]
    });
    
    res.json(mappings);
  } catch (err) {
    console.error("Error fetching EHR patient mappings:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 5. Get Mapping for a Specific Patient
app.get("/api/ehr/mappings/:patientId", async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const mapping = await EHRPatientMapping.findOne({
      where: { patient_id: patientId },
      include: [
        {
          model: Patient,
          attributes: ['first_name', 'last_name', 'student_id']
        }
      ]
    });
    
    if (!mapping) {
      return res.status(404).json({ message: "Patient mapping not found" });
    }
    res.json(mapping);
  } catch (err) {
    console.error("Error fetching patient mapping:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 6. Sync All Patients
app.post("/api/ehr/sync", async (req, res) => {
  try {
    // Check if EHR integration is enabled
    const config = await EHRConfig.findOne();
    if (!config || !config.enabled || !config.api_url) {
      return res.status(400).json({ message: "EHR integration is not properly configured or enabled" });
    }
    
    // Get all patients
    const patients = await Patient.findAll();
    
    // Create a sync history record
    const syncHistory = await EHRSyncHistory.create({
      sync_type: 'full',
      status: 'in_progress',
      total_patients: patients.length,
      initiated_by: req.user ? req.user.username : 'system'
    });
    
    // Process each patient
    const successfulPatients = [];
    const failedPatients = [];
    let syncedCount = 0;
    let failedCount = 0;
    let newMappingsCount = 0;
    let updatedRecordsCount = 0;
    
    for (const patient of patients) {
      try {
        // Export patient data to EHR
        const exportResult = await exportPatientToEHR(patient, config);
        
        // Check if patient already has a mapping
        let mapping = await EHRPatientMapping.findOne({
          where: { patient_id: patient.patient_id }
        });
        
        if (mapping) {
          // Update existing mapping
          await mapping.update({
            status: 'mapped',
            ehr_id: exportResult.ehrId, // Use the EHR ID from the export result
            last_synced: new Date(),
            error_message: null
          });
          updatedRecordsCount++;
        } else {
          // Create new mapping
          mapping = await EHRPatientMapping.create({
            patient_id: patient.patient_id,
            ehr_id: exportResult.ehrId,
            status: 'mapped',
            last_synced: new Date()
          });
          newMappingsCount++;
        }
        
        // Record successful sync
        await EHRSyncDetail.create({
          sync_id: syncHistory.sync_id,
          patient_id: patient.patient_id,
          status: 'success'
        });
        
        successfulPatients.push({
          id: patient.patient_id,
          name: `${patient.first_name} ${patient.last_name}`,
          ehrId: exportResult.ehrId
        });
        
        syncedCount++;
      } catch (error) {
        // Record failed sync
        await EHRSyncDetail.create({
          sync_id: syncHistory.sync_id,
          patient_id: patient.patient_id,
          status: 'failed',
          error_message: error.message
        });
        
        // Update mapping with error if it exists
        const mapping = await EHRPatientMapping.findOne({
          where: { patient_id: patient.patient_id }
        });
        
        if (mapping) {
          await mapping.update({
            status: 'error',
            error_message: error.message
          });
        } else {
          // Create new mapping with error
          await EHRPatientMapping.create({
            patient_id: patient.patient_id,
            ehr_id: `ERROR-${patient.patient_id}-${Date.now()}`,
            status: 'error',
            error_message: error.message
          });
        }
        
        failedPatients.push({
          id: patient.patient_id,
          name: `${patient.first_name} ${patient.last_name}`,
          error: error.message
        });
        
        failedCount++;
      }
    }
    
    // Update sync history record
    await syncHistory.update({
      status: 'completed',
      end_time: new Date(),
      synced_patients: syncedCount,
      failed_patients: failedCount
    });
    
    // Return sync results
    res.json({
      success: true,
      syncStats: {
        syncedPatients: syncedCount,
        failedPatients: failedCount,
        newMappings: newMappingsCount,
        updatedRecords: updatedRecordsCount
      },
      details: {
        successfulPatients,
        failedPatients
      }
    });
  } catch (err) {
    console.error("Error synchronizing with EHR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// 7. Sync a Specific Patient
app.post("/api/ehr/sync/:patientId", async (req, res) => {
  const { patientId } = req.params;
  
  try {
    // Check if EHR integration is enabled
    const config = await EHRConfig.findOne();
    if (!config || !config.enabled || !config.api_url) {
      return res.status(400).json({ message: "EHR integration is not properly configured or enabled" });
    }
    
    // Get the patient with all details
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    // Create a sync history record
    const syncHistory = await EHRSyncHistory.create({
      sync_type: 'patient',
      status: 'in_progress',
      total_patients: 1,
      initiated_by: req.user ? req.user.username : 'system'
    });
    
    try {
      // Export patient data to EHR
      const exportResult = await exportPatientToEHR(patient, config);
      
      // Check if patient already has a mapping
      let mapping = await EHRPatientMapping.findOne({
        where: { patient_id: patientId }
      });
      
      if (mapping) {
        // Update existing mapping
        await mapping.update({
          status: 'mapped',
          ehr_id: exportResult.ehrId, // Use the EHR ID from the export result
          last_synced: new Date(),
          error_message: null
        });
      } else {
        // Create new mapping
        mapping = await EHRPatientMapping.create({
          patient_id: patientId,
          ehr_id: exportResult.ehrId,
          status: 'mapped',
          last_synced: new Date()
        });
      }
      
      // Record successful sync
      await EHRSyncDetail.create({
        sync_id: syncHistory.sync_id,
        patient_id: patientId,
        status: 'success'
      });
      
      // Update sync history record
      await syncHistory.update({
        status: 'completed',
        end_time: new Date(),
        synced_patients: 1,
        failed_patients: 0
      });
      
      res.json({
        success: true,
        message: `Patient ${patientId} synchronized successfully`,
        mapping,
        exportedData: await transformPatientDataForEHR(patient) // Include the transformed data in the response
      });
    } catch (error) {
      // Handle export failure
      // Record failed sync
      await EHRSyncDetail.create({
        sync_id: syncHistory.sync_id,
        patient_id: patientId,
        status: 'failed',
        error_message: error.message
      });
      
      // Update mapping with error if it exists
      const mapping = await EHRPatientMapping.findOne({
        where: { patient_id: patientId }
      });
      
      if (mapping) {
        await mapping.update({
          status: 'error',
          error_message: error.message
        });
      } else {
        // Create new mapping with error
        await EHRPatientMapping.create({
          patient_id: patientId,
          ehr_id: `ERROR-${patientId}-${Date.now()}`,
          status: 'error',
          error_message: error.message
        });
      }
      
      // Update sync history record
      await syncHistory.update({
        status: 'failed',
        end_time: new Date(),
        synced_patients: 0,
        failed_patients: 1,
        error_message: error.message
      });
      
      res.status(500).json({
        success: false,
        message: `Failed to synchronize patient ${patientId}`,
        error: error.message
      });
    }
  } catch (err) {
    console.error("Error synchronizing patient:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 8. Get Synchronization History
app.get("/api/ehr/sync-history", async (req, res) => {
  try {
    const history = await EHRSyncHistory.findAll({
      order: [['start_time', 'DESC']],
      limit: 20
    });
    
    res.json(history);
  } catch (err) {
    console.error("Error fetching sync history:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 9. Get Details of a Specific Sync Operation
app.get("/api/ehr/sync-history/:syncId", async (req, res) => {
  const { syncId } = req.params;
  
  try {
    const syncHistory = await EHRSyncHistory.findByPk(syncId);
    if (!syncHistory) {
      return res.status(404).json({ message: "Sync history record not found" });
    }
    
    const syncDetails = await EHRSyncDetail.findAll({
      where: { sync_id: syncId },
      include: [
        {
          model: Patient,
          attributes: ['first_name', 'last_name', 'student_id']
        }
      ]
    });
    
    res.json({
      syncHistory,
      syncDetails
    });
  } catch (err) {
    console.error("Error fetching sync details:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 10. Get Field Mappings
app.get("/api/ehr/field-mappings", async (req, res) => {
  try {
    const fieldMappings = await EHRFieldMapping.findAll();
    res.json(fieldMappings);
  } catch (err) {
    console.error("Error fetching field mappings:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 11. Update Field Mapping
app.put("/api/ehr/field-mappings/:id", async (req, res) => {
  const { id } = req.params;
  const { local_field, ehr_field, field_type, is_required, transformation_rule } = req.body;
  
  try {
    const fieldMapping = await EHRFieldMapping.findByPk(id);
    if (!fieldMapping) {
      return res.status(404).json({ message: "Field mapping not found" });
    }
    
    await fieldMapping.update({
      local_field,
      ehr_field,
      field_type,
      is_required,
      transformation_rule,
      updated_at: new Date()
    });
    
    res.json({
      message: "Field mapping updated successfully",
      fieldMapping
    });
  } catch (err) {
    console.error("Error updating field mapping:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add this to your server.js file

/**
 * EHR Data Transformation Preview Endpoint
 * GET /api/ehr/preview-transform/:patientId
 * Returns the original patient data, transformed data for EHR, and field mappings
 */
 app.get("/api/ehr/preview-transform/:patientId", async (req, res) => {
  const { patientId } = req.params;

  try {
    // Fetch the patient data using Sequelize ORM
    const patient = await Patient.findOne({ where: { patient_id: patientId } });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Fetch field mappings using Sequelize ORM
    const fieldMappings = await EHRFieldMapping.findAll();

    // Transform the patient data for EHR
    const transformedData = transformPatientDataForEHR(patient);

    // Return the preview data
    res.json({
      originalData: patient,
      transformedData,
      fieldMappings,
    });
  } catch (err) {
    console.error("Error previewing transformed data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Transform patient data for EHR system
 */
function transformPatientDataForEHR(patient) {
  const ehrId = generateEhrId(patient);

  return {
    patientId: ehrId,
    demographics: {
      firstName: patient.first_name,
      lastName: patient.last_name,
      birthDate: formatDateForEHR(patient.date_of_birth),
      sex: transformGender(patient.gender),
      contactInfo: {
        phoneContact: formatPhoneNumber(patient.phone_number),
        emailContact: patient.email || null,
        homeAddress: transformAddress(patient.address),
      },
    },
    clinicalData: {
      medicalHistory: transformMedicalHistory(patient.medical_history),
      allergyIntolerances: transformAllergies(patient.allergies),
    },
    metadata: {
      externalId: patient.student_id || null,
      lastUpdated: new Date().toISOString(),
      source: "HMS",
      version: "1.0",
    },
  };
}

/**
 * Helper functions for data transformation
 */
function generateEhrId(patient) {
  const prefix = "EHR";
  const patientIdentifier = patient.student_id || patient.patient_id;
  return `${prefix}-${patientIdentifier}`;
}

function formatDateForEHR(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
}

function transformGender(gender) {
  switch (gender?.toLowerCase()) {
    case "male":
      return "M";
    case "female":
      return "F";
    default:
      return "O";
  }
}

function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return null;
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  return phoneNumber.startsWith("+") ? `+${digitsOnly}` : `+1${digitsOnly}`; // Assuming US numbers
}

function transformAddress(address) {
  if (!address) return null;
  const parts = address.split(",");
  return {
    addressLine1: parts[0]?.trim() || "",
    addressLine2: parts[1]?.trim() || "",
    city: parts[2]?.trim() || "",
    state: parts[3]?.trim() || "",
    postalCode: parts[4]?.trim() || "",
    country: "USA", // Default to USA
  };
}

function transformMedicalHistory(medicalHistory) {
  if (!medicalHistory) return [];
  return medicalHistory.split(",").map((item) => ({
    condition: item.trim(),
    code: generateMockMedicalCode(item.trim()),
    onsetDate: null,
    status: "Active",
  }));
}

function transformAllergies(allergies) {
  if (!allergies) return [];
  return allergies.split(",").map((item) => ({
    allergen: item.trim(),
    severity: "Unknown",
    code: generateMockAllergyCode(item.trim()),
    reaction: null,
    status: "Active",
  }));
}

function generateMockMedicalCode(condition) {
  return `MH${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
}

function generateMockAllergyCode(allergen) {
  return `AL${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
}
// If you don't already have a field_mappings table, you'll need to create one
// Here's a sample SQL to create the table and insert some mappings

/*t
CREATE TABLE ehr_field_mappings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  local_field VARCHAR(50) NOT NULL,
  ehr_field VARCHAR(50) NOT NULL,
  transformation VARCHAR(255),
  description VARCHAR(255)
);

INSERT INTO ehr_field_mappings 
  (local_field, ehr_field, transformation, description)
VALUES
  ('first_name', 'firstName', NULL, 'Patient first name'),
  ('last_name', 'lastName', NULL, 'Patient last name'),
  ('date_of_birth', 'birthDate', 'Format as YYYY-MM-DD', 'Patient date of birth'),
  ('gender', 'sex', 'Map "Male" to "M", "Female" to "F", "Other" to "O"', 'Patient gender/sex'),
  ('phone_number', 'phoneContact', 'Format as E.164', 'Patient phone number'),
  ('email', 'emailContact', NULL, 'Patient email address'),
  ('address', 'homeAddress', 'Split into addressLine1, city, state, postalCode', 'Patient home address'),
  ('medical_history', 'medicalHistory', 'Convert to structured format', 'Patient medical history'),
  ('allergies', 'allergyIntolerances', 'Convert to coded values', 'Patient allergies'),
  ('student_id', 'externalId', NULL, 'Patient student ID');
*/

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});