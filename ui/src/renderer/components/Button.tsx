import React from 'react'
import styles from './Button.module.css'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ children, ...props }: Props) {
	return (
		<button className={styles.root} {...props}>
			{children}
		</button>
	)
}
