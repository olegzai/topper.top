# Contributing to TOPPER.top

We welcome contributions to the TOPPER.top project! By contributing, you help us improve and grow. Please take a moment to review this document to understand our contribution guidelines.

## How to Contribute

### 1. Reporting Bugs

If you find a bug, please open an issue on our GitHub repository. When reporting a bug, please include:

- A clear and concise description of the bug.
- Steps to reproduce the behavior.
- Expected behavior.
- Screenshots or error messages if applicable.
- Your operating system and browser.

### 2. Suggesting Enhancements

We love new ideas! If you have a suggestion for an enhancement or a new feature, please open an issue on GitHub. Describe your idea clearly and explain why you think it would be a valuable addition to TOPPER.top.

### 3. Code Contributions

If you'd like to contribute code, please follow these steps:

1.  **Fork the Repository:** Start by forking the TOPPER.top repository to your GitHub account.
2.  **Clone Your Fork:** Clone your forked repository to your local machine:
    ```bash
    git clone https://github.com/your-username/topper.top.git
    cd topper.top
    ```
3.  **Install Dependencies:** Make sure you have Node.js (LTS) and npm installed. Then, install the project dependencies:
    ```bash
    npm install
    ```
4.  **Create a New Branch:** Create a new branch for your feature or bug fix. Use a descriptive name (e.g., `feature/add-dark-mode`, `bugfix/fix-api-error`).
    ```bash
    git checkout -b feature/your-feature-name
    ```
5.  **Make Your Changes:** Implement your changes, adhering to the existing code style and conventions.

    - **Code Style:** We use ESLint and Prettier to maintain consistent code style. Before committing, run:
      ```bash
      npm run lint
      npm run format
      ```
      These commands will automatically fix most formatting issues and report any linting errors.
    - **TypeScript:** All new backend code should be written in TypeScript.
    - **Comments:** Add comments where necessary to explain complex logic, but strive for self-documenting code.

6.  **Write Tests:** If you're adding new features or fixing bugs, please write appropriate unit or integration tests to cover your changes. We use Vitest for testing.
    ```bash
    npm run test
    ```
7.  **Run the Development Server:** You can run the development server to test your changes locally:

    ```bash
    npm run dev
    ```

    Access the application at `http://localhost:3000`.

8.  **Commit Your Changes:** Write clear and concise commit messages. Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification if possible.
    ```bash
    git add .
    git commit -m "feat: add new feature"
    ```
9.  **Push to Your Fork:** Push your local branch to your forked repository on GitHub.
    ```bash
    git push origin feature/your-feature-name
    ```
10. **Open a Pull Request (PR):** Go to the original TOPPER.top repository on GitHub and open a new pull request from your forked branch to our `main` branch. Please provide a detailed description of your changes in the PR.

### 4. Documentation Contributions

Improvements to our documentation are always welcome! If you find any inaccuracies, ambiguities, or areas that could be better explained, please open an issue or submit a pull request with your suggested changes.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

Thank you for contributing to TOPPER.top!
