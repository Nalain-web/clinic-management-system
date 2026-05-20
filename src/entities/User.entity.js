// backend/src/entities/User.entity.js
import { EntitySchema } from "typeorm";

// Ideology: Since we are using pure ES6 JavaScript (not TypeScript), we use TypeORM's 
// EntitySchema layout design. It works exactly like decorators but is fully native to plain JS.
export const UserEntity = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    username: {
      type: "varchar",
      length: 50,
      unique: true,
      nullable: false,
    },
    password_hash: {
      type: "text",
      nullable: false,
    },
    name: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    role: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
  },
});