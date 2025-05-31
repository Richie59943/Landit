const jwt = require('jsonwebtoken'); // For decoding the JWT

const authMiddleware = (req, res, next) => {
  // Get the Authorization header
  const authHeader = req.headers.authorization;

  // If it doesn't exist or doesn't start with "Bearer", reject it
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Extract just the token (remove the "Bearer " part)
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user ID to the request so we can use it in route handlers
    req.userId = decoded.id;

    // Move on to the next middleware or controller
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
