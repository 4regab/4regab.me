import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Languages, Send, Copy, Check, ArrowRight, Globe, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
const Translator = () => {
    const [inputText, setInputText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [lastRequestTime, setLastRequestTime] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    // Rate limiting utility - minimum 2 seconds between requests
    const RATE_LIMIT_MS = 2000;
    const MAX_RETRIES = 2;
    const checkRateLimit = () => {
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < RATE_LIMIT_MS) {
            const waitTime = RATE_LIMIT_MS - timeSinceLastRequest;
            throw new Error(`Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request.`);
        }
        setLastRequestTime(now);
    };
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const translateText = async () => {
        if (!inputText.trim()) {
            setError("Please enter text to translate");
            return;
        }
        setIsLoading(true);
        setError("");
        setTranslatedText("");
        let currentRetry = 0;
        const attemptTranslation = async () => {
            try {
                // Check rate limiting before making request
                checkRateLimit();
                // Call our backend API instead of Gemini directly
                const response = await fetch('/api/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: inputText.trim()
                    })
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    if (response.status === 429) {
                        if (currentRetry < MAX_RETRIES) {
                            // Exponential backoff: 5s, 10s, 20s
                            const backoffTime = errorData.resetIn ? errorData.resetIn * 1000 : 5000 * Math.pow(2, currentRetry);
                            throw new Error(`RETRY_AFTER:${backoffTime}`);
                        }
                        else {
                            throw new Error(errorData.message || 'Rate limit exceeded. Please try again later.');
                        }
                    }
                    else if (response.status === 400) {
                        throw new Error(errorData.message || 'Invalid request. Please check your input text and try again.');
                    }
                    else if (response.status === 500) {
                        throw new Error(errorData.message || 'Translation service is temporarily unavailable. Please try again later.');
                    }
                    else {
                        throw new Error(errorData.message || `Service Error: ${response.status} ${response.statusText}`);
                    }
                }
                const data = await response.json();
                if (data.success && data.translation) {
                    setTranslatedText(data.translation);
                    setRetryCount(0); // Reset retry count on success
                }
                else {
                    throw new Error("Translation failed - no output received from service");
                }
            }
            catch (err) {
                if (err instanceof Error && err.message.startsWith('RETRY_AFTER:')) {
                    const backoffTime = parseInt(err.message.split(':')[1]);
                    currentRetry++;
                    setRetryCount(currentRetry);
                    setError(`Service overloaded. Retrying in ${backoffTime / 1000} seconds... (Attempt ${currentRetry}/${MAX_RETRIES})`);
                    await sleep(backoffTime);
                    return attemptTranslation();
                }
                else {
                    throw err;
                }
            }
        };
        try {
            await attemptTranslation();
        }
        catch (err) {
            console.error('Translation error:', err);
            if (err instanceof Error) {
                setError(err.message);
            }
            else {
                setError("An unexpected error occurred during translation");
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    const copyToClipboard = async () => {
        if (translatedText) {
            try {
                await navigator.clipboard.writeText(translatedText);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }
            catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            translateText();
        }
    };
    const clearAll = () => {
        setInputText("");
        setTranslatedText("");
        setError("");
        setIsCopied(false);
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "text-center space-y-4 mb-8", children: [_jsxs("div", { className: "flex items-center justify-center gap-3 mb-4", children: [_jsx("div", { className: "p-3 rounded-2xl bg-neon-blue/20 neon-border-blue", children: _jsx(Languages, { className: "text-neon-blue", size: 32 }) }), _jsx("h1", { className: "font-display text-4xl font-bold tracking-tight text-foreground", children: "English to Tagalog Translator" })] }), _jsx("p", { className: "text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto", children: "Instantly translate English text to natural Tagalog with AI-powered translation" })] }), _jsx(Card, { className: "neo-card neon-border", children: _jsxs(CardContent, { className: "p-8", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 rounded-lg bg-neon-green/20 neon-border-green", children: _jsx(Globe, { size: 20, className: "text-neon-green" }) }), _jsxs("div", { children: [_jsx(Label, { className: "text-lg font-bold text-foreground", children: "English" }), _jsx("p", { className: "text-sm text-foreground/70", children: "Source language" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Textarea, { placeholder: "Enter English text to translate... Type anything from simple phrases to complex sentences, and our AI will provide natural Tagalog translations.", value: inputText, onChange: (e) => setInputText(e.target.value), onKeyDown: handleKeyPress, className: "min-h-[300px] resize-none text-base leading-relaxed neon-border font-medium placeholder:text-foreground/40 text-foreground bg-background/50" }), _jsxs("div", { className: "flex justify-between items-center text-sm text-foreground/60", children: [_jsxs("span", { children: [inputText.length, " characters"] }), _jsx("span", { className: "text-xs bg-foreground/10 px-2 py-1 rounded", children: "Press Ctrl + Enter to translate" })] })] })] }), _jsx("div", { className: "hidden lg:flex items-center justify-center", children: _jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "p-3 rounded-full bg-neon-purple/20 neon-border-purple", children: _jsx(ArrowRight, { className: "text-neon-purple", size: 24 }) }), _jsx("div", { className: "text-xs text-foreground/60 font-medium", children: "AI Translation" })] }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 rounded-lg bg-neon-orange/20 neon-border-orange", children: _jsx(Globe, { size: 20, className: "text-neon-orange" }) }), _jsxs("div", { children: [_jsx(Label, { className: "text-lg font-bold text-foreground", children: "Tagalog" }), _jsx("p", { className: "text-sm text-foreground/70", children: "Target language" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: cn("min-h-[300px] p-4 rounded-lg border-2 bg-background/50 transition-all duration-200", translatedText
                                                        ? "neon-border-green bg-neon-green/5"
                                                        : "border-foreground/20"), children: translatedText ? (_jsx("p", { className: "text-base leading-relaxed font-medium text-foreground whitespace-pre-wrap", children: translatedText })) : (_jsx("p", { className: "text-foreground/40 text-base", children: isLoading
                                                            ? "Translating your text..."
                                                            : "Translation will appear here..." })) }), _jsxs("div", { className: "flex justify-between items-center text-sm text-foreground/60", children: [_jsxs("span", { children: [translatedText.length, " characters"] }), translatedText && (_jsx("span", { className: "text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded", children: "Translation complete" }))] })] })] })] }), _jsxs("div", { className: "flex flex-wrap gap-3 mt-8 pt-6 border-t border-foreground/10", children: [_jsxs(Button, { onClick: translateText, disabled: isLoading || !inputText.trim(), className: "bg-neon-blue/20 neon-border-blue hover:bg-neon-blue/30 transition-all duration-300 h-12 px-6 font-semibold text-white group", children: [isLoading ? (_jsx(RefreshCw, { className: "animate-spin w-5 h-5 mr-2 text-white" })) : (_jsx(Send, { size: 18, className: "mr-2 text-white group-hover:scale-110 transition-transform" })), isLoading
                                            ? retryCount > 0
                                                ? `Retrying... (${retryCount}/${MAX_RETRIES})`
                                                : "Translating..."
                                            : "Translate"] }), translatedText && (_jsxs(Button, { onClick: copyToClipboard, variant: "outline", className: "neon-border-green hover:bg-neon-green/10 h-12 px-6 font-semibold", children: [isCopied ? (_jsx(Check, { size: 18, className: "mr-2 text-neon-green" })) : (_jsx(Copy, { size: 18, className: "mr-2" })), isCopied ? "Copied!" : "Copy Translation"] })), (inputText || translatedText) && (_jsx(Button, { onClick: clearAll, variant: "outline", className: "neon-border-red hover:bg-red-500/10 h-12 px-6 font-medium", children: "Clear All" }))] })] }) }), error && (_jsx(Alert, { className: `p-4 ${error.includes('Service overloaded') || error.includes('Please wait')
                    ? 'border-yellow-500/50 bg-yellow-500/10'
                    : 'border-red-500/50 bg-red-500/10'}`, children: _jsxs(AlertDescription, { className: `font-medium leading-relaxed ${error.includes('Service overloaded') || error.includes('Please wait')
                        ? 'text-yellow-300'
                        : 'text-red-300'}`, children: [error, (error.includes('Service overloaded') || error.includes('Please wait')) && (_jsxs("div", { className: "mt-3 text-sm text-yellow-200 space-y-1", children: [_jsx("p", { children: _jsx("strong", { children: "\uD83D\uDCA1 Tips:" }) }), _jsxs("ul", { className: "list-disc list-inside space-y-1 ml-4", children: [_jsx("li", { children: "Wait at least 2 seconds between requests" }), _jsx("li", { children: "The service automatically handles retries with smart backoff" }), _jsx("li", { children: "Your request will be processed as soon as possible" })] })] }))] }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx(Card, { className: "neo-card neon-border", children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx(Zap, { className: "text-neon-yellow", size: 24 }), _jsx("h3", { className: "font-bold text-foreground", children: "Instant Translation" })] }), _jsx("p", { className: "text-sm text-foreground/70", children: "Fast, accurate English to Tagalog translation powered by advanced AI" })] }) }), _jsx(Card, { className: "neo-card neon-border", children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx(Globe, { className: "text-neon-green", size: 24 }), _jsx("h3", { className: "font-bold text-foreground", children: "Natural Language" })] }), _jsx("p", { className: "text-sm text-foreground/70", children: "Contextual translations that sound natural and culturally appropriate" })] }) }), _jsx(Card, { className: "neo-card neon-border", children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx(Languages, { className: "text-neon-blue", size: 24 }), _jsx("h3", { className: "font-bold text-foreground", children: "Smart Processing" })] }), _jsx("p", { className: "text-sm text-foreground/70", children: "Handles complex sentences, idioms, and colloquial expressions" })] }) })] }), _jsx(Card, { className: "neo-card neon-border", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center space-y-3", children: [_jsxs("div", { className: "text-sm text-foreground/80 font-medium", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Pro Tips:" }), " Use complete sentences for better translations \u2022 Try different phrasings for varied results"] }), _jsxs("div", { className: "text-xs text-foreground/60 leading-relaxed space-y-1", children: [_jsxs("div", { children: ["\uD83D\uDD12 ", _jsx("strong", { children: "Secure Service:" }), " All translations are processed securely on our servers"] }), _jsxs("div", { children: ["\u23F1\uFE0F ", _jsx("strong", { children: "Rate Limited:" }), " Automatic 2-second delay between requests for optimal performance"] }), _jsxs("div", { children: ["\uD83D\uDD04 ", _jsx("strong", { children: "Auto-Retry:" }), " Failed requests are automatically retried with smart backoff timing"] })] })] }) }) })] }));
};
export default Translator;
