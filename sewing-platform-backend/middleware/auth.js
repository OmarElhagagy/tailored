const jwt = require('jsonwebtoken');

// middleware to verify JWT and optionally check role
function auth (role = null) {
	return (req, res, next) => {
		// get token from authorization header
		const authHeader = req.header('Authorization');
		if (!authHeader) {
			return res.status(401).json({message: 'No token provided, Authorizarion denied'});
		}

		const token = authHeader.split(' ')[1]; //extract token after "Bearer"
		if (!token) {
			return res.status(401).json({message: 'Invalid token format, authorization denied'});
		}

		try{
			// verify token using JWT_SECRET
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// attach decoded user info (id, role) to request
			req.user = decoded;

			// if role is specified check it
			if (role && decoded.role !== role){
				return res.status(403).json({ message: 'Access denied, insufficient permissions' });
			}

			next();
		} catch(err) {
			return res.status(401).json({ message: 'Token is invalid or expired' });
		}
	}
}

module.exports = auth;
