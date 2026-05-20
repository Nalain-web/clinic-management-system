// backend/src/entities/Appointment.entity.js
import { EntitySchema } from "typeorm";

export const AppointmentEntity = new EntitySchema({
  name: "Appointment",
  tableName: "appointments",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    reason: {
      type: "text",
      nullable: false,
    },
    appointment_date: {
      type: "date",
      nullable: false,
    },
    appointment_time: {
      type: "time",
      nullable: false,
    },
    status: {
      type: "varchar",
      length: 20,
      default: "PENDING",
    },
  },
  relations: {
    patient: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "patient_id" },
      onDelete: "CASCADE",
      nullable: false,
    },
    doctor: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "doctor_id" },
      onDelete: "CASCADE",
      nullable: false,
    },
  },
});