# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in 4regab AI Tools, please help us by reporting it responsibly.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please email us at: **security@4regab.me**

Include the following information:
- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Initial Assessment**: We will provide an initial assessment within 7 days.
- **Updates**: We will keep you informed of our progress.
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days.

## Security Best Practices

### For Users

1. **API Key Security**:
   - Never commit API keys to version control
   - Use environment variables for API keys in production
   - Regularly rotate your API keys
   - Monitor API key usage for unusual activity

2. **File Uploads**:
   - Only upload files from trusted sources
   - Be aware that uploaded files are processed by AI services
   - Avoid uploading sensitive or confidential information

3. **Browser Security**:
   - Keep your browser updated
   - Use HTTPS connections
   - Be cautious with browser extensions that might interfere with the application

### For Developers

1. **Dependencies**:
   - Regularly update dependencies to patch known vulnerabilities
   - Use `npm audit` to check for security issues
   - Follow principle of least privilege for package permissions

2. **Environment Variables**:
   - Never hardcode sensitive information
   - Use proper environment variable management
   - Validate all environment variables

3. **Input Validation**:
   - Sanitize all user inputs
   - Validate file uploads thoroughly
   - Implement rate limiting for API calls

## Known Security Considerations

### API Keys
- This application requires users to provide their own API keys
- API keys are stored locally in browser storage (not transmitted to our servers)
- Users are responsible for securing their own API keys

### File Processing
- Files uploaded to the application are sent to Google's Gemini AI service
- File processing is subject to Google's privacy and security policies
- Users should avoid uploading sensitive or confidential information

### Third-Party Services
- The application integrates with Google's Gemini AI and OpenRouter
- Data handling is subject to these services' privacy policies
- Network requests are made directly to these services from the client

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed and a fix is developed. Updates will be announced through:

- GitHub Security Advisories
- Release notes
- Project README updates

## Contact

For general security questions or concerns, please contact us at security@4regab.me
