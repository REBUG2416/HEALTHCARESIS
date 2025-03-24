// In a real application, this would be a real PostgreSQL connection
// For this demo, we'll simulate the database with in-memory objects

// Simulated database connection
const pool = {
  query: async (text: string, params: any[] = []) => {
    console.log("Executing query:", text, params)

    // Simulate query execution based on the SQL command
    if (text.toLowerCase().includes("select")) {
      return simulateSelect(text, params)
    } else if (text.toLowerCase().includes("insert")) {
      return simulateInsert(text, params)
    } else if (text.toLowerCase().includes("update")) {
      return simulateUpdate(text, params)
    } else if (text.toLowerCase().includes("delete")) {
      return simulateDelete(text, params)
    }

    return { rows: [] }
  },
}

// In-memory database tables
const patients: any[] = [
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
]

const appointments: any[] = [
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
]

const prescriptions: any[] = [
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
]

const users: any[] = [
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
]

const medical_records: any[] = [
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
]

const billings: any[] = [
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
]

// Simulate SELECT queries
function simulateSelect(text: string, params: any[]) {
  // Determine which table to query based on the SQL text
  if (text.toLowerCase().includes("from patients")) {
    return simulatePatientSelect(text, params)
  } else if (text.toLowerCase().includes("from appointments")) {
    return simulateAppointmentSelect(text, params)
  } else if (text.toLowerCase().includes("from prescriptions")) {
    return simulatePrescriptionSelect(text, params)
  } else if (text.toLowerCase().includes("from users")) {
    return simulateUserSelect(text, params)
  } else if (text.toLowerCase().includes("from medical_records")) {
    return simulateMedicalRecordSelect(text, params)
  } else if (text.toLowerCase().includes("from billings")) {
    return simulateBillingSelect(text, params)
  }

  return { rows: [] }
}

function simulatePatientSelect(text: string, params: any[]) {
  let result = [...patients]

  // Apply filters based on WHERE clauses
  if (text.toLowerCase().includes("where") && params.length > 0) {
    if (text.toLowerCase().includes("id =")) {
      result = result.filter((p) => p.id === params[0])
    } else if (text.toLowerCase().includes("student_id =")) {
      result = result.filter((p) => p.student_id === params[0])
    } else if (text.toLowerCase().includes("like")) {
      const searchTerm = params[0].replace(/%/g, "").toLowerCase()
      result = result.filter(
        (p) =>
          p.first_name.toLowerCase().includes(searchTerm) ||
          p.last_name.toLowerCase().includes(searchTerm) ||
          p.student_id.toLowerCase().includes(searchTerm),
      )
    }
  }

  return { rows: result }
}

function simulateAppointmentSelect(text: string, params: any[]) {
  let result = [...appointments]

  // Apply filters based on WHERE clauses
  if (text.toLowerCase().includes("where") && params.length > 0) {
    if (text.toLowerCase().includes("id =")) {
      result = result.filter((a) => a.id === params[0])
    } else if (text.toLowerCase().includes("patient_id =")) {
      result = result.filter((a) => a.patient_id === params[0])
    } else if (text.toLowerCase().includes("status =")) {
      result = result.filter((a) => a.status === params[0])
    } else if (text.toLowerCase().includes("appointment_date >=")) {
      const date = new Date(params[0])
      result = result.filter((a) => new Date(a.appointment_date) >= date)
    } else if (text.toLowerCase().includes("appointment_date <=")) {
      const date = new Date(params[0])
      result = result.filter((a) => new Date(a.appointment_date) <= date)
    }
  }

  return { rows: result }
}

function simulatePrescriptionSelect(text: string, params: any[]) {
  let result = [...prescriptions]

  // Apply filters based on WHERE clauses
  if (text.toLowerCase().includes("where") && params.length > 0) {
    if (text.toLowerCase().includes("id =")) {
      result = result.filter((p) => p.id === params[0])
    } else if (text.toLowerCase().includes("patient_id =")) {
      result = result.filter((p) => p.patient_id === params[0])
    } else if (text.toLowerCase().includes("status =")) {
      result = result.filter((p) => p.status === params[0])
    } else if (text.toLowerCase().includes("like")) {
      const searchTerm = params[0].replace(/%/g, "").toLowerCase()
      result = result.filter((p) => p.medication.toLowerCase().includes(searchTerm))
    }
  }

  return { rows: result }
}

function simulateUserSelect(text: string, params: any[]) {
  let result = [...users]

  // Apply filters based on WHERE clauses
  if (text.toLowerCase().includes("where") && params.length > 0) {
    if (text.toLowerCase().includes("id =")) {
      result = result.filter((u) => u.id === params[0])
    } else if (text.toLowerCase().includes("username =")) {
      result = result.filter((u) => u.username === params[0])
    } else if (text.toLowerCase().includes("role =")) {
      result = result.filter((u) => u.role === params[0])
    }
  }

  return { rows: result }
}

function simulateMedicalRecordSelect(text: string, params: any[]) {
  let result = [...medical_records]

  // Apply filters based on WHERE clauses
  if (text.toLowerCase().includes("where") && params.length > 0) {
    if (text.toLowerCase().includes("id =")) {
      result = result.filter((mr) => mr.id === params[0])
    } else if (text.toLowerCase().includes("patient_id =")) {
      result = result.filter((mr) => mr.patient_id === params[0])
    }
  }

  return { rows: result }
}

function simulateBillingSelect(text: string, params: any[]) {
  let result = [...billings]

  // Apply filters based on WHERE clauses
  if (text.toLowerCase().includes("where") && params.length > 0) {
    if (text.toLowerCase().includes("id =")) {
      result = result.filter((b) => b.id === params[0])
    } else if (text.toLowerCase().includes("patient_id =")) {
      result = result.filter((b) => b.patient_id === params[0])
    } else if (text.toLowerCase().includes("status =")) {
      result = result.filter((b) => b.status === params[0])
    }
  }

  return { rows: result }
}

// Simulate INSERT queries
function simulateInsert(text: string, params: any[]) {
  // Determine which table to insert into based on the SQL text
  if (text.toLowerCase().includes("into patients")) {
    return simulatePatientInsert(text, params)
  } else if (text.toLowerCase().includes("into appointments")) {
    return simulateAppointmentInsert(text, params)
  } else if (text.toLowerCase().includes("into prescriptions")) {
    return simulatePrescriptionInsert(text, params)
  } else if (text.toLowerCase().includes("into users")) {
    return simulateUserInsert(text, params)
  } else if (text.toLowerCase().includes("into medical_records")) {
    return simulateMedicalRecordInsert(text, params)
  } else if (text.toLowerCase().includes("into billings")) {
    return simulateBillingInsert(text, params)
  }

  return { rows: [] }
}

function simulatePatientInsert(text: string, params: any[]) {
  // Extract column names from the SQL query
  const columnMatch = text.match(/$$([^)]+)$$/)
  if (!columnMatch) return { rows: [] }

  const columns = columnMatch[1].split(",").map((col) => col.trim())

  // Create a new patient object
  const newPatient: any = {}

  // Assign values to the patient object based on the column order
  columns.forEach((col, index) => {
    newPatient[col] = params[index]
  })

  // Generate an ID if not provided
  if (!newPatient.id) {
    newPatient.id = `STU-2023-${String(patients.length + 1).padStart(4, "0")}`
  }

  // Set created_at and updated_at if not provided
  const now = new Date().toISOString()
  if (!newPatient.created_at) newPatient.created_at = now
  if (!newPatient.updated_at) newPatient.updated_at = now

  // Add the new patient to the patients array
  patients.push(newPatient)

  return { rows: [newPatient] }
}

function simulateAppointmentInsert(text: string, params: any[]) {
  // Extract column names from the SQL query
  const columnMatch = text.match(/$$([^)]+)$$/)
  if (!columnMatch) return { rows: [] }

  const columns = columnMatch[1].split(",").map((col) => col.trim())

  // Create a new appointment object
  const newAppointment: any = {}

  // Assign values to the appointment object based on the column order
  columns.forEach((col, index) => {
    newAppointment[col] = params[index]
  })

  // Generate an ID if not provided
  if (!newAppointment.id) {
    newAppointment.id = `APT-2023-${String(appointments.length + 1).padStart(4, "0")}`
  }

  // Set created_at and updated_at if not provided
  const now = new Date().toISOString()
  if (!newAppointment.created_at) newAppointment.created_at = now
  if (!newAppointment.updated_at) newAppointment.updated_at = now

  // Add the new appointment to the appointments array
  appointments.push(newAppointment)

  return { rows: [newAppointment] }
}

function simulatePrescriptionInsert(text: string, params: any[]) {
  // Extract column names from the SQL query
  const columnMatch = text.match(/$$([^)]+)$$/)
  if (!columnMatch) return { rows: [] }

  const columns = columnMatch[1].split(",").map((col) => col.trim())

  // Create a new prescription object
  const newPrescription: any = {}

  // Assign values to the prescription object based on the column order
  columns.forEach((col, index) => {
    newPrescription[col] = params[index]
  })

  // Generate an ID if not provided
  if (!newPrescription.id) {
    newPrescription.id = `PRE-2023-${String(prescriptions.length + 1).padStart(4, "0")}`
  }

  // Set created_at and updated_at if not provided
  const now = new Date().toISOString()
  if (!newPrescription.created_at) newPrescription.created_at = now
  if (!newPrescription.updated_at) newPrescription.updated_at = now

  // Add the new prescription to the prescriptions array
  prescriptions.push(newPrescription)

  return { rows: [newPrescription] }
}

function simulateUserInsert(text: string, params: any[]) {
  // Extract column names from the SQL query
  const columnMatch = text.match(/$$([^)]+)$$/)
  if (!columnMatch) return { rows: [] }

  const columns = columnMatch[1].split(",").map((col) => col.trim())

  // Create a new user object
  const newUser: any = {}

  // Assign values to the user object based on the column order
  columns.forEach((col, index) => {
    newUser[col] = params[index]
  })

  // Generate an ID if not provided
  if (!newUser.id) {
    newUser.id = `USR-2023-${String(users.length + 1).padStart(4, "0")}`
  }

  // Set created_at and updated_at if not provided
  const now = new Date().toISOString()
  if (!newUser.created_at) newUser.created_at = now
  if (!newUser.updated_at) newUser.updated_at = now

  // Add the new user to the users array
  users.push(newUser)

  return { rows: [newUser] }
}

function simulateMedicalRecordInsert(text: string, params: any[]) {
  // Extract column names from the SQL query
  const columnMatch = text.match(/$$([^)]+)$$/)
  if (!columnMatch) return { rows: [] }

  const columns = columnMatch[1].split(",").map((col) => col.trim())

  // Create a new medical record object
  const newMedicalRecord: any = {}

  // Assign values to the medical record object based on the column order
  columns.forEach((col, index) => {
    newMedicalRecord[col] = params[index]
  })

  // Generate an ID if not provided
  if (!newMedicalRecord.id) {
    newMedicalRecord.id = `MR-2023-${String(medical_records.length + 1).padStart(4, "0")}`
  }

  // Set created_at and updated_at if not provided
  const now = new Date().toISOString()
  if (!newMedicalRecord.created_at) newMedicalRecord.created_at = now
  if (!newMedicalRecord.updated_at) newMedicalRecord.updated_at = now

  // Add the new medical record to the medical_records array
  medical_records.push(newMedicalRecord)

  return { rows: [newMedicalRecord] }
}

function simulateBillingInsert(text: string, params: any[]) {
  // Extract column names from the SQL query
  const columnMatch = text.match(/$$([^)]+)$$/)
  if (!columnMatch) return { rows: [] }

  const columns = columnMatch[1].split(",").map((col) => col.trim())

  // Create a new billing object
  const newBilling: any = {}

  // Assign values to the billing object based on the column order
  columns.forEach((col, index) => {
    newBilling[col] = params[index]
  })

  // Generate an ID if not provided
  if (!newBilling.id) {
    newBilling.id = `BIL-2023-${String(billings.length + 1).padStart(4, "0")}`
  }

  // Set created_at and updated_at if not provided
  const now = new Date().toISOString()
  if (!newBilling.created_at) newBilling.created_at = now
  if (!newBilling.updated_at) newBilling.updated_at = now

  // Add the new billing to the billings array
  billings.push(newBilling)

  return { rows: [newBilling] }
}

// Simulate UPDATE queries
function simulateUpdate(text: string, params: any[]) {
  // Determine which table to update based on the SQL text
  if (text.toLowerCase().includes("update patients")) {
    return simulatePatientUpdate(text, params)
  } else if (text.toLowerCase().includes("update appointments")) {
    return simulateAppointmentUpdate(text, params)
  } else if (text.toLowerCase().includes("update prescriptions")) {
    return simulatePrescriptionUpdate(text, params)
  } else if (text.toLowerCase().includes("update users")) {
    return simulateUserUpdate(text, params)
  } else if (text.toLowerCase().includes("update medical_records")) {
    return simulateMedicalRecordUpdate(text, params)
  } else if (text.toLowerCase().includes("update billings")) {
    return simulateBillingUpdate(text, params)
  }

  return { rows: [] }
}

function simulatePatientUpdate(text: string, params: any[]) {
  // Extract the ID from the WHERE clause
  const idMatch = text.match(/id\s*=\s*\$(\d+)/)
  if (!idMatch) return { rows: [] }

  const idParamIndex = Number.parseInt(idMatch[1]) - 1
  const id = params[idParamIndex]

  // Find the patient to update
  const patientIndex = patients.findIndex((p) => p.id === id)
  if (patientIndex === -1) return { rows: [] }

  // Extract the SET clause
  const setMatch = text.match(/set\s+([^where]+)/i)
  if (!setMatch) return { rows: [] }

  const setClauses = setMatch[1].split(",").map((clause) => clause.trim())

  // Update the patient object
  setClauses.forEach((clause) => {
    const match = clause.match(/(\w+)\s*=\s*\$(\d+)/)
    if (match) {
      const column = match[1]
      const paramIndex = Number.parseInt(match[2]) - 1
      patients[patientIndex][column] = params[paramIndex]
    }
  })

  // Update the updated_at timestamp
  patients[patientIndex].updated_at = new Date().toISOString()

  return { rows: [patients[patientIndex]] }
}

function simulateAppointmentUpdate(text: string, params: any[]) {
  // Extract the ID from the WHERE clause
  const idMatch = text.match(/id\s*=\s*\$(\d+)/)
  if (!idMatch) return { rows: [] }

  const idParamIndex = Number.parseInt(idMatch[1]) - 1
  const id = params[idParamIndex]

  // Find the appointment to update
  const appointmentIndex = appointments.findIndex((a) => a.id === id)
  if (appointmentIndex === -1) return { rows: [] }

  // Extract the SET clause
  const setMatch = text.match(/set\s+([^where]+)/i)
  if (!setMatch) return { rows: [] }

  const setClauses = setMatch[1].split(",").map((clause) => clause.trim())

  // Update the appointment object
  setClauses.forEach((clause) => {
    const match = clause.match(/(\w+)\s*=\s*\$(\d+)/)
    if (match) {
      const column = match[1]
      const paramIndex = Number.parseInt(match[2]) - 1
      appointments[appointmentIndex][column] = params[paramIndex]
    }
  })

  // Update the updated_at timestamp
  appointments[appointmentIndex].updated_at = new Date().toISOString()

  return { rows: [appointments[appointmentIndex]] }
}

function simulatePrescriptionUpdate(text: string, params: any[]) {
  // Extract the ID from the WHERE clause
  const idMatch = text.match(/id\s*=\s*\$(\d+)/)
  if (!idMatch) return { rows: [] }

  const idParamIndex = Number.parseInt(idMatch[1]) - 1
  const id = params[idParamIndex]

  // Find the prescription to update
  const prescriptionIndex = prescriptions.findIndex((p) => p.id === id)
  if (prescriptionIndex === -1) return { rows: [] }

  // Extract the SET clause
  const setMatch = text.match(/set\s+([^where]+)/i)
  if (!setMatch) return { rows: [] }

  const setClauses = setMatch[1].split(",").map((clause) => clause.trim())

  // Update the prescription object
  setClauses.forEach((clause) => {
    const match = clause.match(/(\w+)\s*=\s*\$(\d+)/)
    if (match) {
      const column = match[1]
      const paramIndex = Number.parseInt(match[2]) - 1
      prescriptions[prescriptionIndex][column] = params[paramIndex]
    }
  })

  // Update the updated_at timestamp
  prescriptions[prescriptionIndex].updated_at = new Date().toISOString()

  return { rows: [prescriptions[prescriptionIndex]] }
}

function simulateUserUpdate(text: string, params: any[]) {
  // Extract the ID from the WHERE clause
  const idMatch = text.match(/id\s*=\s*\$(\d+)/)
  if (!idMatch) return { rows: [] }

  const idParamIndex = Number.parseInt(idMatch[1]) - 1
  const id = params[idParamIndex]

  // Find the user to update
  const userIndex = users.findIndex((u) => u.id === id)
  if (userIndex === -1) return { rows: [] }

  // Extract the SET clause
  const setMatch = text.match(/set\s+([^where]+)/i)
  if (!setMatch) return { rows: [] }

  const setClauses = setMatch[1].split(",").map((clause) => clause.trim())

  // Update the user object
  setClauses.forEach((clause) => {
    const match = clause.match(/(\w+)\s*=\s*\$(\d+)/)
    if (match) {
      const column = match[1]
      const paramIndex = Number.parseInt(match[2]) - 1
      users[userIndex][column] = params[paramIndex]
    }
  })

  // Update the updated_at timestamp
  users[userIndex].updated_at = new Date().toISOString()

  return { rows: [users[userIndex]] }
}

function simulateMedicalRecordUpdate(text: string, params: any[]) {
  // Extract the ID from the WHERE clause
  const idMatch = text.match(/id\s*=\s*\$(\d+)/)
  if (!idMatch) return { rows: [] }

  const idParamIndex = Number.parseInt(idMatch[1]) - 1
  const id = params[idParamIndex]

  // Find the medical record to update
  const medicalRecordIndex = medical_records.findIndex((mr) => mr.id === id)
  if (medicalRecordIndex === -1) return { rows: [] }

  // Extract the SET clause
  const setMatch = text.match(/set\s+([^where]+)/i)
  if (!setMatch) return { rows: [] }

  const setClauses = setMatch[1].split(",").map((clause) => clause.trim())

  // Update the medical record object
  setClauses.forEach((clause) => {
    const match = clause.match(/(\w+)\s*=\s*\$(\d+)/)
    if (match) {
      const column = match[1]
      const paramIndex = Number.parseInt(match[2]) - 1
      medical_records[medicalRecordIndex][column] = params[paramIndex]
    }
  })

  // Update the updated_at timestamp
  medical_records[medicalRecordIndex].updated_at = new Date().toISOString()

  return { rows: [medical_records[medicalRecordIndex]] }
}

function simulateBillingUpdate(text: string, params: any[]) {
  // Extract the ID from the WHERE clause
  const idMatch = text.match(/id\s*=\s*\$(\d+)/)
  if (!idMatch) return { rows: [] }

  const idParamIndex = Number.parseInt(idMatch[1]) - 1
  const id = params[idParamIndex]

  // Find the billing to update
  const billingIndex = billings.findIndex((b) => b.id === id)
  if (billingIndex === -1) return { rows: [] }

  // Extract the SET clause
  const setMatch = text.match(/set\s+([^where]+)/i)
  if (!setMatch) return { rows: [] }

  const setClauses = setMatch[1].split(",").map((clause) => clause.trim())

  // Update the billing object
  setClauses.forEach((clause) => {
    const match = clause.match(/(\w+)\s*=\s*\$(\d+)/)
    if (match) {
      const column = match[1]
      const paramIndex = Number.parseInt(match[2]) - 1
      billings[billingIndex][column] = params[paramIndex]
    }
  })

  // Update the updated_at timestamp
  billings[billingIndex].updated_at = new Date().toISOString()

  return { rows: [billings[billingIndex]] }
}

// Simulate DELETE queries
function simulateDelete(text: string, params: any[]) {
  // Determine which table to delete from based on the SQL text
  if (text.toLowerCase().includes("from patients")) {
    return simulatePatientDelete(text, params)
  } else if (text.toLowerCase().includes("from appointments")) {
    return simulateAppointmentDelete(text, params)
  } else if (text.toLowerCase().includes("from prescriptions")) {
    return simulatePrescriptionDelete(text, params)
  } else if (text.toLowerCase().includes("from users")) {
    return simulateUserDelete(text, params)
  } else if (text.toLowerCase().includes("from medical_records")) {
    return simulateMedicalRecordDelete(text, params)
  } else if (text.toLowerCase().includes("from billings")) {
    return simulateBillingDelete(text, params)
  }

  return { rows: [] }
}

function simulatePatientDelete(text: string, params: any[]) {
  // Extract the ID from the WHERE clause
  const idMatch = text.match(/id\s*=\s*\$(\d+)/)
  if (!idMatch) return { rows: [] }

  const idParamIndex = Number.parseInt(idMatch[1]) - 1
  const id = params[idParamIndex]

  // Find the patient to delete
  const patientIndex = patients.findIndex((p) => p.id === id)
  if (patientIndex === -1) return { rows: [] }

  // Remove the patient from the patients array
  const deletedPatient = patients.splice(patientIndex, 1)[0]

  return { rows: [deletedPatient] }
}

function simulateAppointmentDelete(text: string, params: any[]) {
  // Extract the ID from the WHERE clause
  const idMatch = text.match(/id\s*=\s*\$(\d+)/)
  if (!idMatch) return { rows: [] }

  const idParamIndex = Number.parseInt(idMatch[1]) - 1
  const id = params[idParamIndex]

  // Find the appointment to delete
  const appointmentIndex = appointments.findIndex((a) => a.id === id)
  if (appointmentIndex === -1) return { rows: [] }

  // Remove the appointment from the appointments array
  const deletedAppointment = appointments.splice(appointmentIndex, 1)[0]

  return { rows: [deletedAppointment] }
}

function simulatePrescriptionDelete(text: string, params: any[]) {
  // Extract the ID from the WHERE clause
  const idMatch = text.match(/id\s*=\s*\$(\d+)/)
  if (!idMatch) return { rows: [] }

  const idParamIndex = Number.parseInt(idMatch[1]) - 1
  const id = params[idParamIndex]

  // Find the prescription to delete
  const prescriptionIndex = prescriptions.findIndex((p) => p.id === id)
  if (prescriptionIndex === -1) return { rows: [] }

  // Remove the prescription from the prescriptions array
  const deletedPrescription = prescriptions.splice(prescriptionIndex, 1)[0]

  return { rows: [deletedPrescription] }
}

function simulateUserDelete(text: string, params: any[]) {
  // Extract the ID from the WHERE clause
  const idMatch = text.match(/id\s*=\s*\$(\d+)/)
  if (!idMatch) return { rows: [] }

  const idParamIndex = Number.parseInt(idMatch[1]) - 1
  const id = params[idParamIndex]

  // Find the user to delete
  const userIndex = users.findIndex((u) => u.id === id)
  if (userIndex === -1) return { rows: [] }

  // Remove the user from the users array
  const deletedUser = users.splice(userIndex, 1)[0]

  return { rows: [deletedUser] }
}

function simulateMedicalRecordDelete(text: string, params: any[]) {
  // Extract the ID from the WHERE clause
  const idMatch = text.match(/id\s*=\s*\$(\d+)/)
  if (!idMatch) return { rows: [] }

  const idParamIndex = Number.parseInt(idMatch[1]) - 1
  const id = params[idParamIndex]

  // Find the medical record to delete
  const medicalRecordIndex = medical_records.findIndex((mr) => mr.id === id)
  if (medicalRecordIndex === -1) return { rows: [] }

  // Remove the medical record from the medical_records array
  const deletedMedicalRecord = medical_records.splice(medicalRecordIndex, 1)[0]

  return { rows: [deletedMedicalRecord] }
}

function simulateBillingDelete(text: string, params: any[]) {
  // Extract the ID from the WHERE clause
  const idMatch = text.match(/id\s*=\s*\$(\d+)/)
  if (!idMatch) return { rows: [] }

  const idParamIndex = Number.parseInt(idMatch[1]) - 1
  const id = params[idParamIndex]

  // Find the billing to delete
  const billingIndex = billings.findIndex((b) => b.id === id)
  if (billingIndex === -1) return { rows: [] }

  // Remove the billing from the billings array
  const deletedBilling = billings.splice(billingIndex, 1)[0]

  return { rows: [deletedBilling] }
}

export default pool

