async function main() {
	console.log('Seed placeholder for Sprint 0');
}

main()
	.then(async () => {
		process.exit(0);
	})
	.catch(async (error) => {
		console.error(error);
		process.exit(1);
	});
