export function highlightPhrase(text: string, phrase: string) {
	const parts = text.split(new RegExp(`(${phrase})`, 'gi'))

	return parts.map((part, i) => {
		if (part.toLowerCase() === phrase.toLowerCase()) {
			return (
				<span key={i} className="text-accent">
					{part}
				</span>
			)
		}
		return part
	})
}
