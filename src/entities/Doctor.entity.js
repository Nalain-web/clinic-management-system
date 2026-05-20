// backend/src/entities/Doctor.entity.js
import { EntitySchema } from "typeorm";

export const DoctorEntity = new EntitySchema({
  name: "Doctor",
  tableName: "doctor_profiles",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    specialty: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    experience: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    status: {
      type: "varchar",
      length: 20,
      default: "Active",
    },
  },
  relations: {
    user: {
      target: "User",
      type: "one-to-one",
      joinColumn: { name: "user_id" },
      onDelete: "CASCADE",
      nullable: false,
    },
  },
});