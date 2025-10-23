# Security Policy

## Known Vulnerabilities

### Moderate Severity Issues

1. **esbuild vulnerability** (GHSA-67mh-4wv8-2f99)

   - **Package**: esbuild (via vite)
   - **Severity**: Moderate
   - **Issue**: esbuild enables any website to send any requests to the development server and read the response
   - **Affected versions**: <=0.24.2
   - **Fix**: Available via `npm audit fix --force` but will install vite@7.1.11 which is a breaking change
   - **Status**: Pending major update

2. **micromatch vulnerability** (GHSA-952p-6rrq-rcjv)
   - **Package**: micromatch (via lint-staged)
   - **Severity**: Moderate
   - **Issue**: Regular Expression Denial of Service (ReDoS) in micromatch
   - **Affected versions**: <4.0.8
   - **Fix**: Available via `npm audit fix`
   - **Status**: Pending update

## Security Best Practices

- Run `npm audit` regularly to check for new vulnerabilities
- Keep dependencies updated with `npm update`
- Address security vulnerabilities promptly
- Review security advisories for dependencies

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. Do not open a public issue
2. Contact the maintainers directly
3. Provide details about the vulnerability
4. Allow time for a fix before disclosure

## Update Schedule

- Regular dependency updates should be performed monthly
- Security updates should be prioritized and addressed within 30 days of disclosure
