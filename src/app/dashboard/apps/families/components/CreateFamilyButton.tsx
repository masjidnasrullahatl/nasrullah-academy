import { Button } from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconPlus } from '@tabler/icons-react';

import { FamilyForm } from './FamilyForm';

export const CreateFamilyButton = () => {
	const handleOpen = () => {
		modals.open({
			title: 'Create Family',
			size: 'xl',
			children: <FamilyForm />,
		});
	};

	return (
		<Button leftSection={<IconPlus size={16} />} onClick={handleOpen}>
			New Family
		</Button>
	);
};
