export namespace Helpers {
	export const formatDate = (date: Date): string => (
		new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);

	export const slugify = (str: string): string => (
		str
			.toString()
			.trim()
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^\w\-]+/g, '')
			.replace(/\-\-+/g, '-')
			.replace(/^-+/, '')
			.replace(/-+$/, '')
	)

	export const generateCategoryData = (categories: Set<string>): { name: string, slug: string }[] => (
		[...categories].map(category => ({
			name: category,
			slug: `${slugify(category)}`,
		}))
	)

	export const normalizeIndex = (nonNormalIndex: number, arrLen: number): number => {
		if (nonNormalIndex >= arrLen) {
			return arrLen - 1;
		} else if (nonNormalIndex < 0) {
			return 0;
		}
		// At this point is safe/normal
		return nonNormalIndex;
	}

	export const getStyle = (el: Element, styleProp: string): string => {
		let value;
		debugger
		const defaultView = el.ownerDocument.defaultView;
		// W3C standard way:
		if (defaultView && defaultView.getComputedStyle) {
			// sanitize property name to css notation (hypen separated words eg. font-Size)
			styleProp = styleProp.replace(/([A-Z])/g, '-$1').toLowerCase();
			const ox = defaultView.getComputedStyle(el, null);
			const xp = ox.getPropertyValue(styleProp);
			return xp;
		} else if (el['currentStyle']) { // IE
			// sanitize property name to camelCase
			styleProp = styleProp.replace(/\-(\w)/g, function (str, letter) {
				return letter.toUpperCase();
			});
			value = el['currentStyle'][styleProp];
			return value;
		}

		return '';
	}
}