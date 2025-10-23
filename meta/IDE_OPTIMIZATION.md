# IDE Configuration and Development Environment Optimization

## Project Setup for Different IDEs

The Topper.top project is designed to work optimally across multiple development environments. Here's how to set up the project for different IDEs and development tools.

## Recommended IDE Setup

### VSCode (Visual Studio Code)

1. Install recommended extensions:

   - `esbenp.prettier-vscode` - Prettier code formatter
   - `ms-vscode.vscode-typescript-next` - TypeScript support
   - `bradlc.vscode-tailwindcss` - Tailwind CSS support (if using)
   - `ms-vscode.vscode-json` - JSON support

2. The project includes configuration in `.vscode/` folder for:
   - Settings specific to the project
   - Recommended extensions
   - Debug configurations

### Cursor

1. Cursor should automatically detect and use the project's ESLint and Prettier configurations
2. TypeScript support is built-in
3. Make sure to enable format-on-save for consistent code style

### Zed

1. Zed supports the project's ESLint and Prettier configurations by default
2. TypeScript language server integration works automatically
3. Configure in `zed/settings.json` for optimal experience

### Other IDEs (WebStorm, IntelliJ, etc.)

1. Import the project and configure TypeScript SDK
2. Set up ESLint and Prettier integration
3. Use the project's tsconfig.json and package.json for configuration

## Development Environment Configuration

### EditorConfig

The project includes an `.editorconfig` file to maintain consistent coding styles across different editors and IDEs.

### ESLint and Prettier

- ESLint configuration: `.eslintrc.js` with TypeScript support
- Prettier configuration: `.prettierrc`
- ESLint + Prettier integration in `vite.config.ts`

### Git Hooks

The project uses Husky and lint-staged for pre-commit hooks:

- Code formatting with Prettier
- Linting with ESLint
- Type checking (if enabled)

## Development Workflow Optimization

### Recommended Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install git hooks:

   ```bash
   npm run prepare
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

### Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run frontend` - Run frontend development server only
- `npm run lint` - Lint and fix code issues
- `npm run format` - Format all code files
- `npm run test` - Run unit tests
- `npm run seed` - Generate sample data

### Docker Development Environment

For a consistent environment across machines:

```bash
docker compose -f docker/docker-compose.yml up --build
```

## Multi-IDE Collaboration Guidelines

### Consistent Code Style

1. Use the provided ESLint and Prettier configurations
2. Enable format-on-save in your IDE
3. Run `npm run format && npm run lint` before committing

### TypeScript Best Practices

1. Use strict TypeScript settings in `tsconfig.json`
2. Enable type checking in your IDE
3. Use JSDoc comments for complex functions

### Git Workflow

1. Use feature branches for new functionality
2. Follow conventional commits (optional but recommended)
3. Run tests before pushing changes
4. Use pre-commit hooks to ensure code quality

## Performance Optimization

### Fast Development Feedback

1. Use Vite for fast hot module replacement
2. Enable TypeScript incremental compilation
3. Use efficient linting configurations

### Testing Strategy

1. Run unit tests frequently: `npm run test`
2. Use test watcher during development: `npm run test:watch`
3. Maintain good test coverage

## Project Structure Optimization

### Organized File Structure

```
/topper.top/
├── public/              # Static assets
├── src/                 # Source code
│   ├── api/            # API server logic
│   ├── types/          # Type definitions
│   └── utils/          # Utility functions
├── tests/              # Test files
├── docs/               # Documentation
├── meta/               # Project meta files
└── scripts/            # Build and utility scripts
```

### TypeScript Configuration

- Strict mode enabled to catch errors early
- Paths configured for easier imports
- Type checking optimized for development speed

## Conclusion

The Topper.top project is configured to provide an optimal development experience across multiple IDEs. By following the setup guidelines and using the provided tools, developers can maintain consistent code quality, benefit from fast feedback loops, and collaborate effectively.

The project's configuration ensures that whether you use VSCode, Cursor, Zed, or other editors, you'll have a consistent and efficient development environment with proper tooling support, type safety, and code quality enforcement.
