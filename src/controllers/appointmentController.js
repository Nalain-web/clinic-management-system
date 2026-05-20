// backend/src/controllers/appointmentController.js
import { AppDataSource } from '../config/data-source.js';

// 1. CREATE APPOINTMENT
export const createAppointment = async (req, res) => {
  const { doctorId, reason, appointmentDate, appointmentTime } = req.body;
  const patientId = req.user.id; 

  try {
    // Inserts the booking and aliases database fields to match frontend expectations
    const result = await AppDataSource.query(
      `INSERT INTO appointments (patient_id, doctor_id, reason, appointment_date, appointment_time) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING 
         id, 
         patient_id as "patientId", 
         doctor_id as "doctorId", 
         reason, 
         status, 
         appointment_date as "date", 
         appointment_time as "time"`,
      [patientId, doctorId, reason, appointmentDate, appointmentTime]
    );

    res.status(201).json({ 
      message: 'Appointment booked successfully', 
      appointment: result[0] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. GET USER-SPECIFIC APPOINTMENTS
export const getAppointments = async (req, res) => {
  const { id, role } = req.user; 

  try {
    let query = '';
    let params = [];

    // Base SELECT statement with clear aliases to map snake_case columns to frontend camelCase properties
    const baseSelect = `
      SELECT 
        a.id,
        a.reason,
        a.status,
        a.appointment_date as "date",
        a.appointment_time as "time",
        a.patient_id as "patientId",
        a.doctor_id as "doctorId",
        p.name as "patientName",
        d.name as "doctorName"
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
    `;

    // Adjust the WHERE filter dynamically based on who is logged in
    if (role === 'PATIENT') {
      query = `${baseSelect} WHERE a.patient_id = $1 ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      params = [id];
    } else if (role === 'DOCTOR') {
      query = `${baseSelect} WHERE a.doctor_id = $1 ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      params = [id];
    } else if (role === 'ADMIN') {
      query = `${baseSelect} ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
    }

    const appointments = await AppDataSource.query(query, params);
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. UPDATE APPOINTMENT STATUS
export const updateStatus = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body;

  try {
    // Updates status and safely returns formatted object values back out to the frontend
    const updated = await AppDataSource.query(
      `UPDATE appointments 
       SET status = $1 
       WHERE id = $2 
       RETURNING 
         id, 
         status, 
         reason, 
         appointment_date as "date", 
         appointment_time as "time"`,
      [status.toUpperCase(), id]
    );

    if (updated.length === 0) {
      return res.status(404).json({ message: 'Appointment entry not found' });
    }

    res.status(200).json({ 
      message: 'Status updated successfully', 
      appointment: updated[0] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};