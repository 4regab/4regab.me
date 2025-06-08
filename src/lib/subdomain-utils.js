// Utility functions for subdomain navigation
export function getBaseUrl() {
    if (typeof window === 'undefined')
        return '';
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    // For local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${hostname}:${window.location.port}`;
    }
    // For production - extract base domain
    const parts = hostname.split('.');
    if (parts.length > 2) {
        // Remove subdomain to get base domain (e.g., "tools.4regab.me" -> "4regab.me")
        return `${protocol}//${parts.slice(1).join('.')}`;
    }
    return `${protocol}//${hostname}`;
}
export function getSubdomain() {
    if (typeof window === 'undefined')
        return '';
    const hostname = window.location.hostname;
    // For local development, check URL parameters to simulate subdomains
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        const params = new URLSearchParams(window.location.search);
        const subdomain = params.get('subdomain');
        return subdomain || '';
    }
    // For production with custom domain
    const parts = hostname.split('.');
    if (parts.length > 2) {
        return parts[0];
    }
    return '';
}
export function buildSubdomainUrl(subdomain, path = '/') {
    const baseUrl = getBaseUrl();
    // For local development, use regular routing
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
        return `${baseUrl}${path}`;
    }
    // For production, use subdomain routing
    if (subdomain) {
        // Extract protocol and base domain properly
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        let baseDomain;
        if (parts.length > 2) {
            // We're on a subdomain, get the base domain
            baseDomain = parts.slice(1).join('.');
        }
        else {
            // We're on the main domain
            baseDomain = hostname;
        }
        return `${protocol}//${subdomain}.${baseDomain}${path}`;
    }
    return baseUrl + path;
}
export function navigateToSubdomain(subdomain, path = '/') {
    const baseUrl = getBaseUrl();
    // For local development, use query parameters to simulate subdomains
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
        const url = `${baseUrl}${path}?subdomain=${subdomain}`;
        window.location.href = url;
        return;
    }
    // For production, use the existing logic
    const url = buildSubdomainUrl(subdomain, path);
    window.location.href = url;
}
