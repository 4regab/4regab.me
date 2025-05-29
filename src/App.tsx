import MainApp from "./MainApp";
import ToolsApp from "./ToolsApp";
import TranslatorApp from "./TranslatorApp";
import TTSApp from "./TTSApp";

function getSubdomain() {
  if (typeof window === 'undefined') return '';
  
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
      return <ToolsApp />;
    case 'translator':
      return <TranslatorApp />;
    case 'tts':
      return <TTSApp />;
    default:
      return <MainApp />;
  }
};

export default App;
