// src/blocks/Form/widthToColSpan.ts
export function widthToColSpan(width?: number): string {
	const w = typeof width === 'number' ? width : 100

	if (w >= 100) return 'col-span-12'
	if (w >= 75) return 'col-span-9'
	if (w >= 67) return 'col-span-8'
	if (w >= 50) return 'col-span-6'
	if (w >= 34) return 'col-span-4'
	if (w >= 25) return 'col-span-3'
	return 'col-span-12'
}
