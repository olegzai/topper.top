# Zed IDE Diagnostics: Instructions for Human Users

This document provides instructions for human users on how to effectively utilize the Diagnostics features within the Zed IDE.

## 1. Understanding Diagnostics

Zed IDE integrates with Language Servers (LSPs) to provide real-time feedback on your code. This feedback, known as diagnostics, includes errors, warnings, and hints that help you identify and fix issues as you write code.

## 2. Visualizing Diagnostics

Diagnostics are visually represented in several ways within Zed:

- **Underlined Text:** Issues are highlighted directly in your code with wavy underlines (e.g., red for errors, yellow for warnings).
- **Scrollbar Markers:** The scrollbar on the right side of the editor will display small markers indicating the location of diagnostics within the file.
- **Project Panel & Editor Tabs:** Files and editor tabs with diagnostics will have color-coded indicators (e.g., a red dot for errors) to quickly show which files have issues.

## 3. Key Features and How to Use Them

### 3.1. Enabling Inline Diagnostics (Error Lens)

Inline diagnostics display the diagnostic message directly next to the problematic code line, making it easier to understand the issue without hovering or looking at a separate panel.

**How to Use:**

1.  Open Zed's settings (usually `Cmd+,` on macOS or `Ctrl+,` on Linux/Windows).
2.  Search for "diagnostics" or "error lens."
3.  Enable the option for "inline diagnostics" or a similar setting. The exact name might vary slightly based on Zed's version.

### 3.2. Filtering Diagnostics by Severity

You can control which types of diagnostic messages are displayed, allowing you to focus on critical errors or review all warnings.

**How to Use:**

1.  Locate the Diagnostics Panel (often accessible via a sidebar icon or a specific keybinding).
2.  Within the Diagnostics Panel, look for filtering options. These typically include checkboxes or dropdowns for different severity levels:
    - Errors
    - Warnings
    - Hints
    - Information
3.  Select or deselect the severity levels to filter the displayed messages according to your current task. For example, you might deselect "Hints" to focus only on actionable problems.

### 3.3. Navigating and Interacting with Diagnostics

- **Hovering:** Hover your mouse over an underlined section of code to see a tooltip with the full diagnostic message.
- **Clicking Scrollbar Markers:** Clicking on a diagnostic marker in the scrollbar will jump your cursor to the corresponding line of code.
- **Diagnostics Panel:** The Diagnostics Panel provides a comprehensive list of all issues in the current file or project. You can click on an entry in this panel to navigate directly to the code location.

## 4. Best Practices for Human Users

- **Address Errors First:** Always prioritize fixing errors (red underlines) as they often prevent your code from compiling or running correctly.
- **Review Warnings Regularly:** Warnings (yellow underlines) indicate potential problems or suboptimal code. While they might not break your application, addressing them can improve code quality, performance, and maintainability.
- **Use Inline Diagnostics for Quick Feedback:** Keep inline diagnostics enabled for immediate feedback, especially during active coding sessions.
- **Filter When Overwhelmed:** If you have a large number of diagnostics, use the filtering options to reduce visual clutter and focus on the most important issues.
- **Understand the Message:** Don't just blindly fix what the diagnostic suggests. Read and understand the message to learn why the issue exists and how your fix addresses the underlying problem.
