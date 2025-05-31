# Contributing to AI-Powered Multi-Tool Platform

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. **Fork the repo** and create your branch from `main`.
2. **If you've added code** that should be tested, add tests.
3. **If you've changed APIs**, update the documentation.
4. **Ensure the test suite passes**.
5. **Make sure your code lints**.
6. **Issue that pull request**!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [Issues](https://github.com/yourusername/4regab/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/4regab/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Google Gemini API Key
- Git

### Local Development

1. **Clone your fork of the repo**
   ```bash
   git clone https://github.com/yourusername/4regab.git
   cd 4regab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Make your changes** and test them locally

5. **Run linting** to ensure code quality
   ```bash
   npm run lint
   ```

### Code Style Guidelines

- **TypeScript**: Use TypeScript for all new code
- **Components**: Follow React functional component patterns
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add JSDoc comments for complex functions
- **Accessibility**: Ensure all UI components are accessible
- **Responsive**: Design should work on mobile and desktop

### Project Structure Guidelines

- **Components**: Place reusable components in `src/components/`
- **Pages**: Page components go in `src/pages/`
- **Utilities**: Helper functions in `src/lib/`
- **Types**: TypeScript types in `src/types/`
- **Hooks**: Custom hooks in `src/hooks/`

## Feature Development

### AI Agents

When adding new AI agents:

1. **Define the agent** in `src/lib/helper-agents.ts`
2. **Add appropriate prompts** and descriptions
3. **Test with various inputs** to ensure quality responses
4. **Update documentation** if needed

### UI Components

When creating new UI components:

1. **Use Radix UI** as base when possible
2. **Follow existing design patterns**
3. **Add proper TypeScript types**
4. **Ensure responsive design**
5. **Test accessibility** with screen readers

### API Integration

When adding new API integrations:

1. **Follow existing patterns** in `src/lib/`
2. **Add proper error handling**
3. **Include rate limiting** considerations
4. **Document API requirements**

## Testing

- **Manual Testing**: Test all UI interactions
- **Cross-browser**: Verify compatibility with major browsers
- **Mobile Testing**: Ensure responsive behavior
- **API Testing**: Test with real API responses

## Documentation

- **README**: Update if you change functionality
- **Code Comments**: Add JSDoc for complex functions
- **Type Definitions**: Keep TypeScript interfaces updated
- **Examples**: Provide usage examples for new features

## Release Process

Maintainers handle releases:

1. **Version bumping** in package.json
2. **Changelog updates**
3. **Git tagging**
4. **Deployment** to production

## Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive
- **Provide constructive feedback**
- **Help newcomers** get started
- **Stay on topic** in discussions

### Getting Help

- **GitHub Discussions**: For questions and ideas
- **Issues**: For bug reports and feature requests
- **Code Review**: Learn from feedback on PRs

## Recognition

Contributors are recognized in:

- **GitHub contributors list**
- **Release notes** for significant contributions
- **Documentation** acknowledgments

## Questions?

Don't hesitate to ask! Create an issue or start a discussion if you have questions about contributing.

---

By participating in this project, you agree to abide by its terms. Thank you for contributing! 🎉
