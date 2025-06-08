import { jsx as _jsx } from "react/jsx-runtime";
import MainApp from "./MainApp";
import ToolsApp from "./ToolsApp";
import TranslatorApp from "./TranslatorApp";
import TTSApp from "./TTSApp";
import HelperApp from "./HelperApp";
function getSubdomain() {
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
const App = () => {
    const subdomain = getSubdomain();
    switch (subdomain) {
        case 'tools':
            return _jsx(ToolsApp, {});
        case 'translator':
            return _jsx(TranslatorApp, {});
        case 'tts':
            return _jsx(TTSApp, {});
        case 'chat':
            return _jsx(HelperApp, {});
        case 'helper':
            return _jsx(HelperApp, {});
        default:
            return _jsx(MainApp, {});
    }
};
export default App;
