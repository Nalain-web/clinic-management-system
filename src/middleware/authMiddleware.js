// backend/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // Grab the authorization token header from the incoming request packet
  const authHeader = req.headers['authorization'];
  
  // JWT tokens are traditionally sent as: "Bearer <token_string>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No authentication token provided' });
  }

  try {
    // Decrypt and verify the token signature using our secret passphrase
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decrypted user payload (id, name, role) directly onto the request object
    req.user = verified;
    
    // 🟢 Core Ideology: next() tells Express to hand the request off to the next function in line
    next(); 
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired session token' });
  }
};