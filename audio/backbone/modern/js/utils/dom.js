/**
 * DOM utility functions to replace jQuery functionality
 */

export const $ = (selector) => {
	if (typeof selector === "string") {
		return document.querySelector(selector);
	}
	return selector;
};

export const $$ = (selector) => {
	return document.querySelectorAll(selector);
};

export const createElement = (tag, className = "", innerHTML = "") => {
	const element = document.createElement(tag);
	if (className) element.className = className;
	if (innerHTML) element.innerHTML = innerHTML;
	return element;
};

export const addEvent = (element, event, handler) => {
	element.addEventListener(event, handler);
};

export const removeEvent = (element, event, handler) => {
	element.removeEventListener(event, handler);
};

export const addClass = (element, className) => {
	element.classList.add(className);
};

export const removeClass = (element, className) => {
	element.classList.remove(className);
};

export const hasClass = (element, className) => {
	return element.classList.contains(className);
};

export const toggleClass = (element, className) => {
	element.classList.toggle(className);
};

export const setStyle = (element, styles) => {
	Object.assign(element.style, styles);
};

export const getOffset = (element) => {
	const rect = element.getBoundingClientRect();
	return {
		left: rect.left + window.scrollX,
		top: rect.top + window.scrollY,
	};
};

export const getRandomPosition = (element) => {
	const windowWidth = window.innerWidth;
	const windowHeight = window.innerHeight;
	const elementWidth = element.offsetWidth || 150;
	const elementHeight = element.offsetHeight || 100;

	return {
		left: Math.floor(Math.random() * (windowWidth - elementWidth - 200) + 100),
		top: Math.floor(Math.random() * (windowHeight - elementHeight - 200) + 100),
	};
};

