import { ComponentProps, ReactNode } from 'react';

import { Group } from '@mantine/core';

type ModalFooterProps = ComponentProps<typeof Group> & {
	children: ReactNode;
};

export const ModalFooter = ({ children, ...others }: ModalFooterProps) => (
	<Group
		justify="flex-end"
		gap="sm"
		mt="md"
		pt="md"
		style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}
		{...others}
	>
		{children}
	</Group>
);
