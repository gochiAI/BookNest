# GitHub Copilot Instructions

## Project Overview
This project is a Nuxt application for managing books, featuring a structured directory layout and various components for user interaction.

## Key Directories
- **components/**: Contains Vue components used throughout the application.
- **config/**: Configuration files for the application settings.
- **prisma/**: Contains Prisma schema and migration files for database management.
- **server/**: Server-side code for handling API requests and business logic.

## Developer Workflows
1. **Setting Up the Environment**: Ensure that all dependencies are installed by running `npm install`.
2. **Running the Application**: Use `npm run dev` to start the development server.
3. **Testing**: Execute tests using `npm run test` to ensure code quality and functionality.

## Integration Points
- **Database**: The application uses Prisma for database interactions. Ensure the database is reset before running tests to maintain consistency.
- **API Endpoints**: CRUD operations for books are defined in the `server/api/` directory.

## Best Practices
- Maintain clear and concise commit messages.
- Regularly update documentation to reflect changes in the codebase.
- Follow coding standards and conventions established in the project.

## Debugging Tips
- Use console logs for debugging during development.
- Ensure the database is in a clean state before running tests to avoid false positives.

## Additional Resources
- Refer to the `README.md` for a comprehensive overview of the project.
- Consult the `nuxt.config.ts` for configuration details.
- Review the `package.json` for available scripts and dependencies.