'use client';

import { forwardRef, ReactNode } from 'react';

import { Box, createPolymorphicComponent } from '@mantine/core';

export type CardFeel = 'flat' | 'elevated' | 'bordered';

type SurfaceProps = {
	children: ReactNode;
	feel?: CardFeel;
	hover?: boolean;
	className?: string;
};

const Surface = createPolymorphicComponent<'div', SurfaceProps>(
	// eslint-disable-next-line react/display-name
	forwardRef<HTMLDivElement, SurfaceProps>(
		({ children, feel, hover = false, className, ...others }, ref) => {
			// Generate classes based on feel and appearance config
			const getCardClasses = () => {
				const classes = [];

				// Base card class
				classes.push('surface-card');

				// Feel-specific classes
				switch (feel || 'elevated') {
					case 'flat':
						classes.push('surface-flat');
						break;
					case 'bordered':
						classes.push('surface-bordered');
						break;
					case 'elevated':
					default:
						classes.push('surface-elevated');
						break;
				}

				// Hover effect
				if (hover) {
					classes.push('surface-hover');
				}

				return classes.join(' ');
			};

			const combinedClassName = [getCardClasses(), className]
				.filter(Boolean)
				.join(' ');

			return (
				<Box
					p="md"
					component="div"
					className={combinedClassName}
					{...others}
					ref={ref}
				>
					{children}
				</Box>
			);
		},
	),
);

Surface.displayName = 'Surface';

export default Surface;
