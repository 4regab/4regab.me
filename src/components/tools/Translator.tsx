import React, { useState, useEffect } from "react";
import { Languages, Send, Settings, Copy, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

const Translator = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");  const [isCopied, setIsCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Load API key from localStorage on component mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedApiKey = localStorage.getItem('gemini-api-key');
        if (savedApiKey) {
          setApiKey(savedApiKey);
        }
      }
    } catch (error) {
      console.warn('localStorage access blocked:', error);
    }
  }, []);

  // Save API key to localStorage whenever it changes
  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (newApiKey.trim()) {
          localStorage.setItem('gemini-api-key', newApiKey);
        } else {
          localStorage.removeItem('gemini-api-key');
        }
      }    } catch (error) {
      console.warn('localStorage access blocked:', error);
    }
  };

  // Rate limiting utility - minimum 2 seconds between requests
  const RATE_LIMIT_MS = 2000;
  const MAX_RETRIES = 2;

  const checkRateLimit = () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_MS) {
      const waitTime = RATE_LIMIT_MS - timeSinceLastRequest;
      throw new Error(`Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request to avoid rate limits.`);
    }
    
    setLastRequestTime(now);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleApiError = (response: Response, retryAttempt: number) => {
    if (response.status === 429) {
      if (retryAttempt < MAX_RETRIES) {
        // Exponential backoff: 5s, 10s, 20s
        const backoffTime = 5000 * Math.pow(2, retryAttempt);
        throw new Error(`RETRY_AFTER:${backoffTime}`);
      } else {
        throw new Error(`Rate limit exceeded. Your API key has reached its quota limit. Please try again later or check your Google AI Studio quota at https://makersuite.google.com/app/apikey`);
      }
    } else if (response.status === 400) {
      throw new Error(`Invalid request. Please check your input text and try again.`);
    } else if (response.status === 401) {
      throw new Error(`Invalid API key. Please check your Gemini API key in settings.`);
    } else if (response.status === 403) {
      throw new Error(`Access forbidden. Your API key may not have permission to use this model.`);
    } else {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  };  const SYSTEM_PROMPT = `You are "Tagasalin Maestro," a world-class, expert Filipino translator and linguist. You are a native speaker of both contemporary English and Filipino (Tagalog). Your defining skill is your ability to produce translations that are not just technically correct but also culturally resonant, contextually appropriate, and feel as if they were originally written in Filipino. You think and translate based on meaning and intent, not just words.

Core Objective
Translate the given English text into clear, accurate, and natural-sounding Filipino. The final output must embody the CAN Model: Clear (Malinaw), Accurate (Wasto), and Natural (Natural ang Daloy).

Primary Directives
Prioritize Meaning Over Literalism: Your first duty is to the meaning, intent, and nuance of the source text. Do not perform a word-for-word translation. Rephrase, restructure, and adapt as necessary to create a natural and effective message in Filipino.

Embrace Natural Filipino Structure: Liberally use Filipino's flexible sentence structures (e.g., Panaguri-Simuno) and linguistic markers (mga, si/sina, ang/ang mga) to ensure the output sounds authentic. Avoid direct translations of English syntax that result in "tunog-salin" (translationese).

Context is King: Analyze the context of the source text—its purpose, audience, and tone. Your translation must reflect this context. Differentiate between literal statements and idiomatic expressions.

Be a Pragmatic Lexicographer: Use the most appropriate and commonly understood vocabulary. Your word choice hierarchy is:
1st Priority: Common, contemporary Filipino/Tagalog terms.
2nd Priority: Widely understood terms from other Philippine languages.
3rd Priority (Borrowing):
Widely Accepted Terms: Use common loanwords like computer, internet, cellphone, charger directly.
Phonetic Respelling (Naturalisasyon): Respell English words to fit Filipino phonetics (titser for teacher, manedyer for manager) only when this form is more common than the original spelling.
Affixation: Seamlessly integrate Filipino affixes with loanwords (e.g., mag-computer, i-delete, nag-charge). Use a hyphen when affixing to a proper noun or an unchanged English word.

Key Translation Techniques
Idioms & Expressions:
Find Equivalents: Translate the English idiom with a corresponding Filipino idiom (e.g., "It's raining cats and dogs" -> "Napakalakas ng ulan").
Explain Meaning: If no direct equivalent exists, translate the meaning of the idiom, not its literal words (e.g., "Bite the bullet" -> "Kailangan mong tiisin at harapin ito").

Cultural & Contextual Adaptation:
Cultural Equivalence: Replace source-language cultural references with target-language equivalents where appropriate to maintain the original intent (e.g., a reference to "keeping up with the Joneses" might be adapted to a concept of social pressure familiar in a Filipino context).
Adaptation: If a concept is foreign, adapt it to be understandable to a Filipino audience, or use a brief, elegant explanation if necessary.

Structural & Stylistic Adjustments:
Modulation: Change the point of view or phrasing for a more natural result (e.g., "The package was delivered to me" -> "Nakuha ko na ang package").
Addition & Omission: Add words for clarity or omit redundant words that hinder flow in Filipino.

Tone & Register:
Match the Formality: If the source is formal, use formal Filipino (kayo, po/opo). If it's casual, use conversational language. Maintain the original text's tone (humorous, serious, urgent, etc.).
Consistency: For recurring key terms or concepts within a single request, use a consistent Filipino translation.

Constraints & Output Format
Final Output ONLY: Provide ONLY the finished Filipino translation. Do not include preambles, apologies, or explanations like "Heto ang salin..."
No Archaic Language: Avoid deep or archaic Tagalog words unless the source text is intentionally formal or poetic.
Retain Proper Nouns & Symbols: Keep the original spelling of proper names and universally recognized scientific symbols.
No Invention: Do not coin new words. Rely on established vocabulary and borrowing rules.

Pre-Output Self-Correction Checklist
Before providing the final translation, perform a quick mental check:
Wasto ba? (Is it accurate?) — Does it preserve the original meaning?
Malinaw ba? (Is it clear?) — Is it instantly understandable?
Natural ba ang daloy? (Is the flow natural?) — Does it sound like it was written by a Filipino?
Angkop ba sa Konteksto? (Is it contextually appropriate?) — Does the tone and word choice fit?

CRITICAL: Your response must contain ONLY the Filipino translation. No other text, explanations, or formatting.`;const translateText = async () => {
    if (!inputText.trim()) {
      setError("Please enter text to translate");
      return;
    }
    
    if (!apiKey.trim()) {
      setShowApiDialog(true);
      return;
    }

    setIsLoading(true);
    setError("");
    setTranslatedText("");
    
    let currentRetry = 0;
    
    const attemptTranslation = async (): Promise<void> => {
      try {        // Check rate limiting before making request
        checkRateLimit();
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${SYSTEM_PROMPT}\n\nEnglish text to translate:\n"${inputText}"`
                  }
                ]
              }
            ]
          })
        });

        if (!response.ok) {
          handleApiError(response, currentRetry);
        }

        const data = await response.json();        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
          let translation = data.candidates[0].content.parts[0].text;
          
          // Basic cleaning to remove any residual formatting
          translation = translation
            .replace(/^["'](.*)["']$/s, '$1') // Remove surrounding quotes
            .replace(/^\s*[-*]\s*/, '') // Remove leading dash or asterisk
            .replace(/^.*?translation:?\s*/i, '') // Remove "translation:" prefix
            .replace(/^.*?tagalog:?\s*/i, '') // Remove "tagalog:" prefix
            .replace(/^.*?filipino:?\s*/i, '') // Remove "filipino:" prefix
            .trim();
          
          // Validate that the result isn't empty
          if (!translation) {
            throw new Error("Translation failed - no output received from API");
          }
          
          setTranslatedText(translation);
          setRetryCount(0); // Reset retry count on success
        } else {
          throw new Error("Unexpected response format from API");
        }
      } catch (err) {
        if (err instanceof Error && err.message.startsWith('RETRY_AFTER:')) {
          const backoffTime = parseInt(err.message.split(':')[1]);
          currentRetry++;
          setRetryCount(currentRetry);
          
          setError(`Rate limit exceeded. Retrying in ${backoffTime / 1000} seconds... (Attempt ${currentRetry}/${MAX_RETRIES})`);
          
          await sleep(backoffTime);
          return attemptTranslation();
        } else {
          throw err;
        }
      }
    };

    try {
      await attemptTranslation();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during translation";
      setError(errorMessage);
      setRetryCount(0);
    } finally {
      setIsLoading(false);
    }
  };const copyToClipboard = async () => {
    if (translatedText) {
      try {
        await navigator.clipboard.writeText(translatedText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      debouncedTranslate();
    }
  };

  // Debounced translate function to prevent rapid successive calls
  const [translateTimeout, setTranslateTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const debouncedTranslate = () => {
    if (translateTimeout) {
      clearTimeout(translateTimeout);
    }
    
    const timeout = setTimeout(() => {
      translateText();
    }, 300); // 300ms debounce
    
    setTranslateTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (translateTimeout) {
        clearTimeout(translateTimeout);
      }
    };
  }, [translateTimeout]);return (
    <Card className="neo-card neon-border animate-slide-up">
      <CardHeader className="pb-8 border-b border-foreground/10">
        <CardTitle className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight">
          <Languages className="text-neon-blue" size={32} />
          <span className="text-foreground">English to Tagalog Translator</span>
        </CardTitle>
        <CardDescription className="text-lg text-foreground/80 leading-relaxed mt-3 max-w-3xl">
          Translate English text to natural, accurate Tagalog using advanced AI
        </CardDescription>
      </CardHeader>
            
      <CardContent className="space-y-8 pt-6">
        <div className="flex justify-between items-start">
          <div>
            <Label htmlFor="input-text" className="text-lg font-semibold text-foreground block mb-2">
              English Text
            </Label>
            <p className="text-sm text-foreground/60">
              Enter the English text you want to translate to Tagalog
            </p>
          </div>
          <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="neon-border text-sm font-medium">
                <Settings size={16} className="mr-2" />
                API Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="neo-card neon-border max-w-lg">
              <DialogHeader className="pb-6">
                <DialogTitle className="font-display text-xl font-bold text-foreground">Gemini API Configuration</DialogTitle>
                <DialogDescription className="text-base text-foreground/80 leading-relaxed">
                  Enter your Google Gemini API key to enable translation services
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); setShowApiDialog(false); }}>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="api-key" className="text-sm font-semibold text-foreground">API Key</Label>
                    <div className="relative">
                      <Input
                        id="api-key"
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        placeholder="Enter your Gemini API key"
                        className="pr-12 text-sm h-11"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff size={16} className="text-muted-foreground" />
                        ) : (
                          <Eye size={16} className="text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                                    
                  <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                    <AlertDescription className="text-sm text-foreground/90 leading-relaxed">
                      <strong className="text-foreground font-semibold">Quick Tutorial:</strong>
                      <ol className="list-decimal list-inside mt-4 space-y-2 text-sm leading-relaxed">
                        <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline font-medium">Google AI Studio</a></li>
                        <li>Sign in with your Google account</li>
                        <li>Click "Create API Key"</li>
                        <li>Copy the generated key and paste it above</li>
                        <li className="text-foreground/70 text-xs">Your key is stored locally and never sent to our servers</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-3 pt-3">
                    <Button
                      type="submit"
                      className="flex-1 bg-neon-blue/20 neon-border hover:bg-neon-blue/30 font-medium h-11 text-white"
                      disabled={!apiKey.trim()}
                    >
                      Save Configuration
                    </Button>
                    {apiKey.trim() && (
                      <Button
                        type="button"
                        onClick={() => handleApiKeyChange('')}
                        variant="outline"
                        className="neon-border text-red-400 hover:bg-red-500/10 font-medium h-11"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
                
        {/* Text Input Section */}
        <div className="space-y-4">
          <Textarea
            id="input-text"
            placeholder="Enter English text to translate to Tagalog..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[140px] resize-none text-sm leading-relaxed neon-border font-medium"
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">          <Button
            onClick={debouncedTranslate}
            disabled={isLoading || !inputText.trim()}
            className="bg-neon-blue/20 neon-border hover:bg-neon-blue/30 transition-all duration-300 h-12 px-6 font-semibold text-white"
          >            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2" />
            ) : (
              <Send size={18} className="mr-2 text-white" />
            )}
            {isLoading 
              ? retryCount > 0 
                ? `Retrying... (${retryCount}/${MAX_RETRIES})` 
                : "Translating..."
              : "Translate"
            }
          </Button>
                    
          {translatedText && (
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="neon-border-green hover:bg-neon-green/10 h-12 px-6 font-semibold"
            >
              {isCopied ? (
                <Check size={18} className="mr-2 text-neon-green" />
              ) : (
                <Copy size={18} className="mr-2" />
              )}
              {isCopied ? "Copied!" : "Copy"}
            </Button>
          )}
        </div>
          {/* Error Display */}
        {error && (
          <Alert className={`p-4 ${
            error.includes('Rate limit') || error.includes('quota') 
              ? 'border-yellow-500/50 bg-yellow-500/10' 
              : 'border-red-500/50 bg-red-500/10'
          }`}>
            <AlertDescription className={`font-medium leading-relaxed ${
              error.includes('Rate limit') || error.includes('quota')
                ? 'text-yellow-300'
                : 'text-red-300'
            }`}>
              {error}
              {(error.includes('Rate limit') || error.includes('quota')) && (
                <div className="mt-3 text-sm text-yellow-200 space-y-1">
                  <p><strong>💡 Tips to avoid rate limits:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Wait at least 2 seconds between requests</li>
                    <li>Check your <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-yellow-100 hover:underline">API quota usage</a></li>
                    <li>Consider upgrading your Google AI Studio plan if needed</li>
                    <li>Avoid sharing your API key with others</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Translation Output */}
        {translatedText && (
          <div className="space-y-4 border border-foreground/10 rounded-lg p-6 bg-background/50">
            <div className="border-b border-foreground/10 pb-3">
              <Label className="text-lg font-semibold text-foreground">Tagalog Translation</Label>
              <p className="text-sm text-foreground/70 mt-1">
                Your English text has been translated to natural Tagalog
              </p>
            </div>
            <div className="neo-card neon-border-green p-5 bg-neon-green/5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium text-foreground">{translatedText}</p>
            </div>
          </div>
        )}
          {/* Usage Tips */}
        <div className="text-center space-y-3 p-4 bg-background/30 rounded-lg border border-foreground/10">
          <div className="text-sm text-foreground/80 font-medium">
            Press <kbd className="px-2 py-1 bg-foreground/10 rounded text-xs font-semibold">Ctrl + Enter</kbd> to translate quickly
          </div>
          <div className="text-xs text-foreground/60 leading-relaxed space-y-1">
            <div>💡 <strong>Pro Tip:</strong> This translator specializes in natural, contextually accurate Tagalog translations</div>
            <div>⏱️ <strong>Rate Limit:</strong> Automatic 2-second delay between requests to prevent API quota issues</div>
            <div>🔄 <strong>Auto-Retry:</strong> Failed requests are automatically retried with smart backoff timing</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Translator;
