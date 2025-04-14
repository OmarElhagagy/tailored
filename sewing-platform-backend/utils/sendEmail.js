const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
	// create a transporter
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS 
		}
	});

	// mail options
	const mailOptions = {
		from: `"Support" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: subject,
		text: message
	};

	// send email
	await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
