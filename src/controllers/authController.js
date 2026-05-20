// backend/src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source.js'; //  Grab TypeORM Data Source

/**
 * Handles account registration for clinical operators, practitioners, and patients
 * Mapping request parameters securely to PostgreSQL constraints
 */
export const register = async (req, res) => {
  const { username, password, name, role } = req.body;

  try {
    //  Safety Guard: Prevent string mutations on undefined variables by falling back to 'PATIENT'
    const finalRole = role ? role.toUpperCase() : 'PATIENT';

    // RAW SQL THROUGH TYPEORM: Checking if user matches registry
    const userCheck = await AppDataSource.query(
      'SELECT * FROM users WHERE username = $1', 
      [username]
    );
    
    if (userCheck.length > 0) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // RAW SQL THROUGH TYPEORM: Running parameterized insertion statement
    const insertResult = await AppDataSource.query(
      'INSERT INTO users (username, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, name, role',
      [username, passwordHash, name, finalRole]
    );

    res.status(201).json({
      message: 'User registered successfully using relational schema parameters',
      user: insertResult[0]
    });
  } catch (err) {
    // Ensure visibility in backend terminal for unexpected schema exceptions
    console.error(" Registration Controller Exception:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Verifies matching relational parameters and dispenses cryptographic authorization tokens
 */
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // RAW SQL THROUGH TYPEORM: Pull user account details
    const userResult = await AppDataSource.query(
      'SELECT * FROM users WHERE username = $1', 
      [username]
    );
    
    if (userResult.length === 0) {
      return res.status(401).json({ message: 'Invalid matching credentials' });
    }

    const user = userResult[0];

    // Cryptographic signature checking matching hashed storage string
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid matching credentials' });
    }

    // Provision signed verification token mapping application operational layer permissions
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error(" Login Controller Exception:", err.message);
    res.status(500).json({ error: err.message });
  }
};