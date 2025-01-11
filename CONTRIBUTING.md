# Contributing to CryOutNow

First off, thank you for considering contributing to CryOutNow! It's people like you that make CryOutNow such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

1. Be respectful and inclusive
2. Exercise empathy and kindness
3. Give and gracefully accept constructive feedback
4. Focus on what is best for the community
5. Show courtesy and respect towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful
* List some other applications where this enhancement exists, if applicable

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/cryoutnow.git
   cd cryoutnow
   git remote add upstream https://github.com/original/cryoutnow.git
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   * Write meaningful commit messages
   * Follow the coding style
   * Write/update tests as needed
   * Update documentation as needed

4. **Keep Your Fork Updated**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **Submit a Pull Request**
   * Fill in the required template
   * Do not include issue numbers in the PR title
   * Include screenshots and animated GIFs if relevant

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐎 `:racehorse:` when improving performance
    * 📝 `:memo:` when writing docs
    * 🐛 `:bug:` when fixing a bug
    * 🔥 `:fire:` when removing code or files

### JavaScript/TypeScript Styleguide

* Use TypeScript for all new code
* Use 2 spaces for indentation
* Use semicolons
* Use single quotes
* Prefer const over let
* Use meaningful variable names
* Add typing information to all variables and function parameters

### React Styleguide

* Use functional components with hooks
* Use TypeScript for component props
* Keep components small and focused
* Use meaningful component names
* Document complex component behavior
* Use CSS-in-JS with styled-components

### Documentation Styleguide

* Use Markdown
* Reference functions, classes, and variables in backticks
* Use code blocks for examples
* Include links to related documentation
* Keep documentation up to date with code changes

## Testing

* Write unit tests for all new code
* Ensure all tests pass before submitting a PR
* Include integration tests for new features
* Test edge cases and error conditions

## Review Process

1. **Initial Review**
   * Code style and formatting
   * Test coverage
   * Documentation updates
   * Performance implications

2. **Secondary Review**
   * Security implications
   * Architecture considerations
   * Integration points
   * Edge cases

3. **Final Review**
   * Merge conflicts
   * CI/CD pipeline success
   * Documentation completeness

## Community

* Join our [Discord server](https://discord.gg/cryoutnow)
* Follow us on [Twitter](https://twitter.com/cryoutnow)
* Read our [blog](https://blog.cryoutnow.com)

## Questions?

* Feel free to open an issue for any questions
* Join our community channels
* Contact the maintainers directly

## License

By contributing, you agree that your contributions will be licensed under its MIT License. 