import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload to request object
    next(); // Proceed to next middleware or route handler
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

export default authenticateToken;
