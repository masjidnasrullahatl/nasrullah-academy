const escapeMap: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

export const escapeHtml = (value: string | number | null | undefined) =>
	String(value ?? '').replace(/[&<>"']/g, (char) => escapeMap[char]);

const REPORT_STYLES = `
	* { box-sizing: border-box; }
	body { font-family: Arial, Helvetica, sans-serif; color: #1a1b1e; margin: 32px; font-size: 12px; }
	header { border-bottom: 2px solid #228be6; padding-bottom: 12px; margin-bottom: 16px; }
	h1 { font-size: 20px; margin: 0 0 4px; }
	h2 { font-size: 15px; margin: 20px 0 8px; }
	.muted { color: #868e96; }
	.meta { display: flex; flex-wrap: wrap; gap: 4px 24px; margin-top: 6px; }
	.stats { display: flex; gap: 12px; margin: 12px 0; }
	.stat { border: 1px solid #dee2e6; border-radius: 6px; padding: 8px 14px; }
	.stat b { display: block; font-size: 18px; }
	table { width: 100%; border-collapse: collapse; }
	th, td { border: 1px solid #dee2e6; padding: 6px 8px; text-align: left; vertical-align: top; }
	th { background: #f1f3f5; }
	tr { page-break-inside: avoid; }
	.juz-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; }
	.juz { border: 1px solid #dee2e6; border-radius: 6px; padding: 6px 2px; text-align: center; }
	.juz b { display: block; font-size: 14px; }
	.juz.done { background: #fff3bf; border-color: #fab005; }
	.juz small { font-size: 9px; color: #495057; }
	footer { margin-top: 24px; font-size: 10px; color: #868e96; }
	@page { margin: 14mm; }
	@media print { body { margin: 0; } }
`;

/**
 * Opens a print-ready report in a new tab. The tab is opened right away (inside
 * the click) so pop-up blockers allow it, then filled once the data is ready.
 * The browser's print dialog offers "Save as PDF".
 */
export const openPrintWindow = () => {
	const printWindow = window.open('', '_blank');

	printWindow?.document.write(
		'<p style="font-family: Arial; margin: 32px">Preparing report…</p>',
	);

	return {
		render: (title: string, bodyHtml: string) => {
			if (!printWindow) return;

			printWindow.document.open();
			printWindow.document.write(`<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>${escapeHtml(title)}</title>
		<style>${REPORT_STYLES}</style>
	</head>
	<body>
		${bodyHtml}
		<footer>Nasrullah Academy · Generated ${escapeHtml(new Date().toLocaleString('en-US'))}</footer>
	</body>
</html>`);
			printWindow.document.close();
			printWindow.focus();
			setTimeout(() => printWindow.print(), 300);
		},
		close: () => printWindow?.close(),
	};
};
