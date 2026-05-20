// backend/src/config/data-source.js
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { UserEntity } from "../entities/User.entity.js";
import { DoctorEntity } from "../entities/Doctor.entity.js";
import { AppointmentEntity } from "../entities/Appointment.entity.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // 🟢 Core Ideology: synchronize: true tells TypeORM to look at your JS code classes,
  // look at your database, and automatically build/alter the SQL tables to match perfectly on startup.
  synchronize: true, 
  logging: false,
  entities: [UserEntity, DoctorEntity, AppointmentEntity],
  subscribers: [],
  migrations: [],
});