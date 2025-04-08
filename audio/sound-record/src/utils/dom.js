/**
 * DOM utility functions
 */

/**
 * Create a DOM element with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {Array|Node} children - Child elements or text
 * @returns {HTMLElement} - The created element
 */
export const createElement = (tag, attributes = {}, children = []) => {
	const element = document.createElement(tag);

	// Set attributes
	Object.entries(attributes).forEach(([key, value]) => {
		if (key === "className") {
			element.className = value;
		} else if (key === "style" && typeof value === "object") {
			Object.entries(value).forEach(([cssKey, cssValue]) => {
				element.style[cssKey] = cssValue;
			});
		} else if (key.startsWith("on") && typeof value === "function") {
			const eventName = key.substring(2).toLowerCase();
			element.addEventListener(eventName, value);
		} else {
			element.setAttribute(key, value);
		}
	});

	// Add children
	if (Array.isArray(children)) {
		children.forEach((child) => {
			appendChild(element, child);
		});
	} else {
		appendChild(element, children);
	}

	return element;
};

/**
 * Append a child to an element
 * @param {HTMLElement} parent - Parent element
 * @param {HTMLElement|string} child - Child element or text
 */
export const appendChild = (parent, child) => {
	if (child === null || child === undefined) return;

	if (typeof child === "string" || typeof child === "number") {
		parent.appendChild(document.createTextNode(child));
	} else {
		parent.appendChild(child);
	}
};

/**
 * Create a style element with CSS content
 * @param {string} css - CSS content
 * @returns {HTMLElement} - The style element
 */
export const createStyle = (css) => {
	const style = document.createElement("style");
	style.textContent = css;
	return style;
};

/**
 * Get element by ID with type checking
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} - The found element or null
 */
export const getElement = (id) => document.getElementById(id);
