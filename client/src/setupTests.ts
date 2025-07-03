/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Polyfill ResizeObserver for JSDOM environment
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  callback: ResizeObserverCallback;
  observe() {}
  disconnect() {}
  unobserve() {}
} as any;

// Mock IntersectionObserver for JSDOM environment
(global as any).IntersectionObserver = class MockIntersectionObserver {
  callback: any;
  root: any;
  rootMargin: string;
  thresholds: number[];
  
  constructor(callback: any) {
    this.callback = callback;
    this.root = null;
    this.rootMargin = '0px';
    this.thresholds = [0];
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() { return []; }
};

// Mock window.matchMedia for Radix UI components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.HTMLElement.prototype.scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock HTMLDialogElement for Radix UI dialogs
if (!window.HTMLDialogElement) {
  window.HTMLDialogElement = window.HTMLElement as any;
}

// Mock window.requestAnimationFrame
window.requestAnimationFrame = jest.fn().mockImplementation(cb => setTimeout(cb, 0));
window.cancelAnimationFrame = jest.fn();

// Mock window.getComputedStyle
window.getComputedStyle = jest.fn().mockImplementation(() => ({
  getPropertyValue: jest.fn(),
}));