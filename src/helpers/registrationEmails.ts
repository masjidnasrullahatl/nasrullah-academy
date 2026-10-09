import { RegistrationStudent } from '@app/api/public/registrations/types';

import { formatMoney } from '@utils/money';
import { escapeHtml } from '@utils/printReport';

const CONTACT = 'Questions? Call 470-253-9391 or reply to this email.';

type RegistrationInfo = {
	familyName: string;
	students: RegistrationStudent[];
	preferredTime: string | null;
	payByCard: boolean;
	registrationFee: number;
	monthlyFee: number;
	amountDue: number;
};

const layout = (title: string, body: string) => `
<div style="font-family: Arial, Helvetica, sans-serif; color: #1a1b1e; max-width: 560px; margin: 0 auto; line-height: 1.5;">
	<h2 style="color: #1c7ed6; margin-bottom: 8px;">${escapeHtml(title)}</h2>
	${body}
	<p style="margin-top: 24px;">JazakAllahu khairan,<br>Nasrullah Academy<br>Masjid Nasrullah, Lawrenceville, GA</p>
	<p style="color: #868e96; font-size: 12px;">${escapeHtml(CONTACT)}</p>
</div>`;

const studentList = (students: RegistrationStudent[]) =>
	`<ul>${students
		.map(
			(student) =>
				`<li>${escapeHtml(`${student.firstName} ${student.lastName}`)}</li>`,
		)
		.join('')}</ul>`;

const amountRows = (rows: Array<[string, string]>) =>
	`<table style="border-collapse: collapse; margin: 8px 0;">${rows
		.map(
			([label, value]) =>
				`<tr><td style="padding: 4px 16px 4px 0;">${escapeHtml(label)}</td><td style="padding: 4px 0; font-weight: bold;">${escapeHtml(value)}</td></tr>`,
		)
		.join('')}</table>`;

export const registrationReceivedEmail = (
	programName: string,
	registration: RegistrationInfo,
) => ({
	subject: `We received your ${programName} registration`,
	html: layout(
		`${programName} registration received`,
		`
		<p>Assalamu alaikum ${escapeHtml(registration.familyName)},</p>
		<p>Thank you for registering with Nasrullah Academy. We received your registration for:</p>
		${studentList(registration.students)}
		${registration.preferredTime ? `<p>Preferred class time: <b>${escapeHtml(registration.preferredTime)}</b></p>` : ''}
		${amountRows([
			['Registration fee (one-time)', formatMoney(registration.registrationFee)],
			['Monthly tuition (recurring)', formatMoney(registration.monthlyFee)],
			['Due to start', formatMoney(registration.amountDue)],
		])}
		<p>${
			registration.payByCard
				? 'You chose to pay by card. Stripe will email you a receipt once the payment goes through.'
				: 'The Academy office will contact you about payment (Zelle, Cash, Check or Keela).'
		}</p>
		<p>Our staff will review your registration and confirm your child's start shortly.</p>`,
	),
});

export const registrationApprovedEmail = (
	programName: string,
	registration: RegistrationInfo,
	familyMonthlyFee: number,
	isPaid: boolean,
) => ({
	subject: `Welcome to Nasrullah Academy: ${programName} registration approved`,
	html: layout(
		'Your registration is approved',
		`
		<p>Assalamu alaikum ${escapeHtml(registration.familyName)},</p>
		<p>Alhamdulillah, your ${escapeHtml(programName)} registration has been approved. We look forward to welcoming:</p>
		${studentList(registration.students)}
		${registration.preferredTime ? `<p>Class time: <b>${escapeHtml(registration.preferredTime)}</b></p>` : ''}
		${amountRows([['Monthly tuition for your family', formatMoney(familyMonthlyFee)]])}
		<p>${
			isPaid
				? 'Your first payment has been received. Monthly tuition will be charged to your card automatically.'
				: 'Please arrange your registration fee and first month with the Academy office (Zelle, Cash, Check or Keela).'
		}</p>`,
	),
});
