# Zed IDE Debugger: Instructions for LLM Agents

This document provides comprehensive instructions for LLM agents on how to programmatically interact with and utilize the Debugger features within the Zed IDE environment.

## 1. Introduction to Debugging for LLM Agents

For an LLM agent, the Zed IDE Debugger (via its underlying DAP-compatible APIs) is a powerful tool for dynamic code analysis, bug reproduction, root cause analysis, and verification of fixes. It allows the agent to execute code in a controlled environment, observe runtime behavior, and inspect program state.

## 2. Core Debugging Primitives for LLM Agents

LLM agents should assume access to programmatic interfaces for the following debugger functionalities:

- **Setting/Clearing Breakpoints:** Ability to set various types of breakpoints (line, conditional, logpoints) and clear them.
- **Controlling Execution:** Commands to start, stop, pause, continue, step over, step into, and step out of code execution.
- **Inspecting State:** Access to the call stack, local variables, global variables, and the ability to evaluate expressions at runtime.
- **Configuration Management:** Ability to read and potentially modify debug configurations (e.g., `.zed/debug.json`, `.vscode/launch.json`).

## 3. Key Instructions for LLM Agents

### 3.1. Automate Breakpoint Placement for Issue Reproduction

**Instruction:** When tasked with debugging a reported issue or verifying a hypothesis, the LLM agent _must_ analyze the problem description, relevant code changes, or test failures to infer potential problematic code sections. Based on this analysis, the agent should programmatically set temporary breakpoints at strategic locations to reproduce the bug or observe specific program behavior.

**Rationale:** Efficient bug reproduction is the first step in debugging. Automated breakpoint placement allows the LLM to quickly narrow down the search space for the root cause without manual intervention.

**Actionable Steps for LLM Agent:**

1.  **Analyze Problem Context:** Parse the user's request, bug report, or test failure logs to identify:
    - The file(s) and function(s) likely involved.
    - Specific conditions or inputs that trigger the issue.
    - Expected versus actual behavior.
2.  **Identify Breakpoint Locations:** Based on the analysis, determine logical points in the code where execution should be paused. This might include:
    - Function entry points of suspected functions.
    - Lines where critical variables are modified.
    - Conditional statements related to the bug's trigger.
    - Lines immediately preceding an observed error or crash.
3.  **Set Breakpoints Programmatically:** Use the debugger API to set line breakpoints. For complex scenarios, consider:
    - **Conditional Breakpoints:** If the bug occurs only under specific data conditions, set a condition on the breakpoint (e.g., `if (variableX === null)`).
    - **Logpoints:** If the goal is to observe values without pausing, set logpoints to output variable states to the debug console.
4.  **Configure and Start Debug Session:** Load or create a debug configuration (e.g., from `.zed/debug.json`) that launches the application with the necessary inputs or attaches to a running process. Start the debug session.
5.  **Monitor and Adjust:** Observe if the breakpoints are hit and if the program state aligns with the bug reproduction steps. If not, adjust breakpoint locations or conditions and restart the session.

### 3.2. Extract and Analyze Variable States for Root Cause Identification

**Instruction:** During a debugging session, when execution is paused at a breakpoint, the LLM agent _must_ programmatically extract the values of relevant variables (local, global, and function arguments) and analyze their states. This analysis is critical for identifying discrepancies, unexpected values, or incorrect data flows that indicate the root cause of a bug.

**Rationale:** Understanding the program's state at various execution points is fundamental to debugging. By analyzing variable values, the LLM can form hypotheses about why the program is behaving unexpectedly.

**Actionable Steps for LLM Agent:**

1.  **Pause at Breakpoint:** Ensure the program execution is paused at a breakpoint.
2.  **Retrieve Variable Information:** Use the debugger API to fetch:
    - **Call Stack:** To understand the sequence of function calls.
    - **Local Variables:** For the current stack frame.
    - **Function Arguments:** For the current stack frame.
    - **Global Variables:** If relevant to the context.
3.  **Evaluate Expressions (Optional but Recommended):** If specific expressions or object properties are of interest but not directly available as variables, use the debugger's expression evaluation capability to get their values (e.g., `myObject.property.nestedValue`).
4.  **Analyze State:** Compare the retrieved variable values against expected values based on the code logic and problem description. Look for:
    - `null` or `undefined` values where an object is expected.
    - Incorrect data types.
    - Unexpected numerical values (e.g., off-by-one errors, division by zero).
    - Incorrect array lengths or contents.
    - Boolean flags set to the wrong state.
5.  **Formulate Hypothesis:** Based on the observed state, generate a hypothesis about the root cause of the bug (e.g., "`user` object is null because the API call failed," "`counter` is not incrementing correctly due to a race condition").
6.  **Propose Fix or Further Investigation:** Based on the hypothesis, either propose a code fix or suggest further debugging steps (e.g., setting more breakpoints, stepping through a specific function).

## 4. Advanced Debugging Strategies for LLM Agents

- **Automated Stepping:** For specific code paths, the LLM can automate stepping through functions (`step_into`, `step_over`) while continuously monitoring variable states to pinpoint the exact line where an issue originates.
- **Re-running with Modified State:** In some advanced scenarios, the LLM might be able to modify variable values at runtime (if the debugger API supports it) to test different execution paths or validate a fix without restarting the entire application.
- **Integration with Test Suites:** Use the debugger to run specific unit or integration tests in debug mode, allowing for detailed inspection of failures.
