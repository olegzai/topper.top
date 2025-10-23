# Zed IDE Debugger: Instructions for Human Users

This document provides comprehensive instructions for human users on how to effectively utilize the Debugger features within the Zed IDE.

## 1. Introduction to the Zed Debugger

The Zed IDE Debugger is a powerful tool that allows you to pause the execution of your code, inspect its state, and step through it line by line. It supports various programming languages through the Debug Adapter Protocol (DAP), including C, C++, Go, JavaScript, PHP, Python, Rust, and TypeScript.

## 2. Core Debugging Concepts

- **Breakpoints:** Markers you set in your code to tell the debugger where to pause execution.
- **Stepping:** Commands to control the flow of execution (e.g., step over, step into, step out).
- **Call Stack:** Shows the sequence of function calls that led to the current point of execution.
- **Variables:** Displays the current values of variables in the active scope.
- **Watch Expressions:** Allows you to monitor the values of specific expressions as you step through code.

## 3. Key Features and How to Use Them

### 3.1. Setting and Managing Breakpoints

Breakpoints are fundamental to debugging, allowing you to halt execution at points of interest.

**How to Use:**

1.  **Set/Toggle Breakpoint:** Click in the gutter (the area to the left of the line numbers) next to the line of code where you want execution to pause. A red dot will appear, indicating a breakpoint.
2.  **Conditional Breakpoints:** Right-click on an existing breakpoint (or in the gutter) and select "Edit Breakpoint" (or similar). You can then add a condition (a boolean expression) that must evaluate to `true` for the breakpoint to trigger.
3.  **Logpoints (Tracepoints):** Instead of pausing, a logpoint will print a message to the console when hit. This is useful for logging variable values without interrupting execution. Right-click a breakpoint and choose "Convert to Logpoint" or similar option.
4.  **Hit Count Breakpoints:** Configure a breakpoint to only trigger after it has been hit a certain number of times.
5.  **Disable/Enable Breakpoints:** Right-click a breakpoint and select "Disable Breakpoint" to temporarily ignore it without removing it.
6.  **Remove Breakpoints:** Click on an existing breakpoint dot in the gutter to remove it.

### 3.2. Starting a Debugging Session

You can start a debugging session by launching your program with the debugger attached or by attaching the debugger to an already running process.

**How to Use (Launching):**

1.  **Open Debug View:** Look for a debug icon (often a bug or play button with a bug) in the sidebar to open the Debug View.
2.  **Select Configuration:** If you have multiple debug configurations (see 3.3), select the desired one from a dropdown.
3.  **Start Debugging:** Click the "Start Debugging" (play) button in the Debug View or use the corresponding keybinding (e.g., `F5`).

**How to Use (Attaching):**

1.  Ensure your program is running and configured to allow debugger attachment (this is language/runtime specific).
2.  In the Debug View, select an "Attach" configuration (if available) and start the debugging session.

### 3.3. Configuring Debugging Sessions (`.zed/debug.json` or `.vscode/launch.json`)

For more complex projects or specific debugging scenarios, you can define custom launch configurations.

**How to Use:**

1.  Zed typically looks for debug configurations in `.zed/debug.json` or `.vscode/launch.json` (compatible with VS Code configurations).
2.  Create one of these files in your project's root directory if it doesn't exist.
3.  **Example `launch.json` structure (JavaScript/Node.js):**
    ```json
    {
      "version": "0.2.0",
      "configurations": [
        {
          "type": "node",
          "request": "launch",
          "name": "Launch Program",
          "program": "${workspaceFolder}/src/index.js",
          "args": ["--verbose"],
          "cwd": "${workspaceFolder}",
          "env": { "NODE_ENV": "development" }
        },
        {
          "type": "node",
          "request": "attach",
          "name": "Attach to Process",
          "port": 9229
        }
      ]
    }
    ```
4.  Customize the `type`, `request`, `name`, `program`, `args`, `cwd`, `env`, and other properties according to your language and project needs.

### 3.4. Controlling Execution Flow

Once execution is paused at a breakpoint, you can use these commands:

- **Continue (F5):** Resume execution until the next breakpoint or the end of the program.
- **Step Over (F10):** Execute the current line of code and move to the next line, stepping _over_ any function calls (i.e., not entering the function's code).
- **Step Into (F11):** Execute the current line and, if it's a function call, step _into_ that function to debug its internal logic.
- **Step Out (Shift+F11):** If currently inside a function, execute the rest of that function and return to the calling function.
- **Restart:** Restart the debugging session from the beginning.
- **Stop:** Terminate the debugging session.

### 3.5. Inspecting Variables and Call Stack

- **Variables Panel:** In the Debug View, this panel automatically shows local variables and arguments in the current scope. Expand objects and arrays to view their contents.
- **Watch Panel:** Add specific variable names or expressions to this panel to monitor their values throughout the debugging session.
- **Call Stack Panel:** This panel shows the sequence of function calls that led to the current execution point. Click on a stack frame to jump to that function in the editor and inspect its local variables.

## 4. Best Practices for Human Users

- **Start Simple:** Begin with basic breakpoints and stepping to understand the flow of your program.
- **Isolate the Problem:** Use breakpoints strategically to narrow down the section of code where an issue might be occurring.
- **Use Conditional Breakpoints:** For loops or frequently called functions, conditional breakpoints can save a lot of time by only pausing when a specific condition is met.
- **Leverage Logpoints:** When you don't need to pause but want to see values, logpoints are less intrusive than `console.log` statements and can be managed directly by the debugger.
- **Understand the Call Stack:** The call stack is invaluable for understanding how your program arrived at a certain state.
- **Inspect Thoroughly:** Don't just look at one variable. Explore related objects and the call stack to get a complete picture of the program's state.
