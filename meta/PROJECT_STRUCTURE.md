# Project Structure

After refactoring, the project follows this structure:

```
/topper.top/
├───.git/                      # Git version control
├───.github/                   # GitHub Actions CI/CD workflows
├───.husky/                    # Git hooks configuration
├───config/                    # Configuration files
├───data/                      # JSON files acting as a simple database for development
├───dist/                      # Compiled JavaScript output from TypeScript
├───docker/                    # Docker-related files for development environment
├───docs/                      # Project documentation (Markdown files)
├───e2e/                       # End-to-end tests
├───interfaces/                # Legacy or alternative HTML interfaces
├───logs/                      # Application logs
├───node_modules/              # Installed Node.js dependencies
├───public/                    # Static assets served by the backend
├───scripts/                   # Utility scripts (e.g., data seeding)
├───src/                       # Backend TypeScript source code
│   ├───api/                   # API server logic
│   └───utils/                 # Utility functions
├───tests/                     # Unit and integration tests
├───tmp/                       # Temporary files
├───meta/                      # Project meta files and documentation
│   ├───ABOUT.md               # Project overview
│   ├───AGENTS.md              # Information about agents
│   ├───CONTRIBUTING.md        # Contributing guide
│   ├───DEVELOPMENT_MODULES_REPORT.md # Development modules report
│   ├───INDEX.md               # Project index/overview
│   ├───KANBAN.md              # Kanban board for tasks
│   ├───PLANS.md               # Project plans
│   ├───SECURITY.md            # Security policy
│   ├───TESTING.md             # Testing guide
│   ├───Untitled.md            # Miscellaneous notes/content
│   ├───activity_log.txt       # Activity log
│   ├───api-spec.yaml          # API specification
│   ├───interface_screenshot.png # Interface screenshot
│   ├───monitor_server.js      # Monitor server script
│   ├───playwright.config.ts   # Playwright configuration
│   ├───questions.md           # Questions
│   ├───server_output.log      # Server output log
│   ├───setup_initial_files_bundle.md # Initial file setup
│   ├───suggestions.md         # Suggestions
│   ├───test_api.js            # Test API script
│   ├───versions.txt           # Version information
│   ├───vite.config.ts         # Vite configuration
│   ├───vitest.config.ts       # Vitest configuration
│   └───PROJECT_STRUCTURE.md   # This file
├───.eslintignore              # ESLint ignore patterns
├───.eslintrc.js               # ESLint configuration
├───.gitignore                 # Files/directories ignored by Git
├───.prettierignore            # Prettier ignore patterns
├───.prettierrc                # Prettier configuration
├───README.md                  # Main project README
├───interface_screenshot.png   # Interface screenshot
├───package-lock.json          # Node.js dependency lock file
├───package.json               # Project metadata and scripts
├───tsconfig.json              # TypeScript configuration
└───version.txt                # Project version number
```

## Key Changes

- All documentation and meta files moved to `meta/` directory
- Import awesome script completely removed
- Project structure is now more organized and maintainable
