const jwt = require('jsonwebtoken');

// middleware to verify JWT and optionally check role
function auth (role = null) {
	return (req, res, next) => {
		// get token from authorization header or cookies
		let token;
		const authHeader = req.header('Authorization');
		
		// Check for token in Authorization header
		if (authHeader && authHeader.startsWith('Bearer ')) {
			token = authHeader.split(' ')[1]; // extract token after "Bearer"
		} 
		// Check for token in cookies
		else if (req.cookies && req.cookies.authToken) {
			token = req.cookies.authToken;
		}
		
		// If no token found, deny access
		if (!token) {
			return res.status(401).json({
				success: false,
				errors: [{ message: 'No token provided, Authorization denied' }]
			});
		}

		try {
			// verify token using JWT_SECRET
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Check if token is expired
			const currentTime = Math.floor(Date.now() / 1000);
			if (decoded.exp && decoded.exp < currentTime) {
				// Clear the cookie if it exists
				if (req.cookies && req.cookies.authToken) {
					res.clearCookie('authToken');
				}
				
				return res.status(401).json({
					success: false,
					errors: [{ message: 'Token has expired, please login again' }]
				});
			}

			// attach decoded user info (id, role) to request
			req.user = decoded.user;

			// if role is specified check it
			if (role && !Array.isArray(role)) {
				// Single role check
				if (req.user.role !== role) {
					return res.status(403).json({
						success: false,
						errors: [{ message: 'Access denied, insufficient permissions' }]
					});
				}
			} else if (role && Array.isArray(role)) {
				// Multiple role check
				if (!role.includes(req.user.role)) {
					return res.status(403).json({
						success: false,
						errors: [{ message: 'Access denied, insufficient permissions' }]
					});
				}
			}

			next();
		} catch(err) {
			console.error('Auth error:', err.message);
			
			// Clear the cookie if token is invalid
			if (req.cookies && req.cookies.authToken) {
				res.clearCookie('authToken');
			}
			
			if (err.name === 'JsonWebTokenError') {
				return res.status(401).json({
					success: false,
					errors: [{ message: 'Invalid token, authentication failed' }]
				});
			}
			
			if (err.name === 'TokenExpiredError') {
				return res.status(401).json({
					success: false,
					errors: [{ message: 'Token has expired, please login again' }]
				});
			}
			
			return res.status(401).json({
				success: false,
				errors: [{ message: 'Token is invalid or expired' }]
			});
		}
	}
}

module.exports = auth;
