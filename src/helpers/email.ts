// Emails are sent through Resend's REST API. Sending is switched on by the
// RESEND_API_KEY environment variable; without it emails are skipped.
const RESEND_API = 'https://api.resend.com/emails';

export const EMAIL_FROM = 'Nasrullah Academy <admin@masjidnasrullah.org>';
export const EMAIL_REPLY_TO = [
	'admin@masjidnasrullah.org',
	'info@masjidnasrullah.org',
];

type SendEmailParams = {
	to: string;
	subject: string;
	html: string;
};

/**
 * Sends one email. Never throws: a failed email must not undo the
 * registration or approval that triggered it, so problems are only logged.
 */
export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
	const apiKey = process.env.RESEND_API_KEY;

	if (!apiKey) {
		console.log(`Email skipped (RESEND_API_KEY not set): ${subject}`);
		return false;
	}

	try {
		const response = await fetch(RESEND_API, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: EMAIL_FROM,
				reply_to: EMAIL_REPLY_TO,
				to,
				subject,
				html,
			}),
		});

		if (!response.ok) {
			console.log('Email send failed', response.status, await response.text());
			return false;
		}

		return true;
	} catch (error) {
		console.log('Email send error', error);
		return false;
	}
};
