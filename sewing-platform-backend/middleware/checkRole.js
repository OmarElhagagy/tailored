/**
 * @param {string|string[]} requiredRole
 * A role (or array of roles) that is allowed
*/
module.exports = function checkRole(requiredRole) {
	return (req, res, next) => {
		if (!req.user || !req.user.role) {
			return res.status(401).json({ errors: [{ message: 'Authorization denied' }] });
		}

		const userRole = req.user.role;
		const allowed = Array.isArray(requiredRole)
			? requiredRole.includes(userRole)
			: userRole === requiredRole

		if (!allowed) {
			return res.status(403).json({ errors: [{ message: 'Access denied, insufficient permission' }] });
		}

		next();
	};
};
