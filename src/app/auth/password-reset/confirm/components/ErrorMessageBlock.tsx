import { Alert, Text } from '@mantine/core';

import { IconAlertCircle } from '@tabler/icons-react';

type Props = {
	message: string;
};

export const ErrorMessageBlock = ({ message }: Props) => {
	return (
		<Alert
			icon={<IconAlertCircle size="1rem" />}
			title="Reset Password Error"
			color="red"
			fw="semibold"
			ta="center"
		>
			<Text fz="sm" fw="semibold">
				{message}
			</Text>
		</Alert>
	);
};
