'use client'

import { getLucideIcon, LucideIconName } from '@/utilities/lucideIcons'
import React from 'react'

interface LucideIconProps {
	icon: LucideIconName
	className?: string
}

const LucideIcon: React.FC<LucideIconProps> = ({ icon, className }) => {
	const Icon = getLucideIcon(icon)

	if (!Icon) return null

	return <Icon className={className} />
}

export default LucideIcon
