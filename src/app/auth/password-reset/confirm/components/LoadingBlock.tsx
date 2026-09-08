import { Flex, Loader } from '@mantine/core';

export const LoadingBlock = () => {
	return (
		<Flex mt="lg" w="100vw" justify="center" align="center">
			<Loader />
		</Flex>
	);
};
