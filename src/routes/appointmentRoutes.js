// backend/src/routes/appointmentRoutes.js
import express from 'express';
import { createAppointment, getAppointments, updateStatus } from '../controllers/appointmentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

// 🟢 Set mergeParams to true to guarantee route parameters pass seamlessly 
// from parent global routers down to individual controller targets.
const router = express.Router({ mergeParams: true });

/**
 * Route Security Threshold
 * Placing verifyToken right before the controllers protects all endpoints.
 * Anyone attempting to touch these endpoints without a valid JWT token gets blocked!
 */
router.use(verifyToken); 

// Standard CRUD Operations
router.post('/', createAppointment);
router.get('/', getAppointments);

// 🟢 Action Status Modifier
// Explicitly handles PATCH modifications for appointment tracking lifecycles
router.patch('/:id/status', updateStatus);

export default router;