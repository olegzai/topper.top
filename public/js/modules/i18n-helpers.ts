/// <reference lib="dom" />
// modules/i18n-helpers.ts
// Internationalization helper functions

// Helper function to update label text
export function updateLabel(element: Element | null, newText: string) {
  if (element) {
    // Get the text node and replace it
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    if (textNodes.length > 0) {
      // Replace the text content of the first text node
      textNodes[0]!.textContent = newText;
    }
  }
}

// Helper function to update label associated with input
export function updateLabelWithInput(
  selector: string | Element,
  newText: string
) {
  if (typeof selector === 'string') {
    const input = document.querySelector(selector);
    if (input) {
      const label = input.nextElementSibling;
      if (label && label.tagName === 'LABEL') {
        updateLabel(label, newText);
      }
    }
  } else {
    const input = selector;
    if (input) {
      const label = input.nextElementSibling;
      if (label && label.tagName === 'LABEL') {
        updateLabel(label, newText);
      }
    }
  }
}
