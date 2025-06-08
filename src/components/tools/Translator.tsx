import React, { useState, useEffect } from "react";
import { Languages, Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

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

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const translateText = async () => {
    if (!inputText.trim()) {
      setError("Please enter text to translate");
      return;
    }

    setIsLoading(true);
    setError("");
    setTranslatedText("");
    
    let currentRetry = 0;
    
    const attemptTranslation = async (): Promise<void> => {
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
            } else {
              throw new Error(errorData.message || 'Rate limit exceeded. Please try again later.');
            }
          } else if (response.status === 400) {
            throw new Error(errorData.message || 'Invalid request. Please check your input text and try again.');
          } else if (response.status === 500) {
            throw new Error(errorData.message || 'Translation service is temporarily unavailable. Please try again later.');
          } else {
            throw new Error(errorData.message || `Service Error: ${response.status} ${response.statusText}`);
          }
        }

        const data = await response.json();
        
        if (data.success && data.translation) {
          setTranslatedText(data.translation);
          setRetryCount(0); // Reset retry count on success
        } else {
          throw new Error("Translation failed - no output received from service");
        }
      } catch (err) {
        if (err instanceof Error && err.message.startsWith('RETRY_AFTER:')) {
          const backoffTime = parseInt(err.message.split(':')[1]);
          currentRetry++;
          setRetryCount(currentRetry);
          
          setError(`Service overloaded. Retrying in ${backoffTime / 1000} seconds... (Attempt ${currentRetry}/${MAX_RETRIES})`);
          
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
  };

  const copyToClipboard = async () => {
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
  }, [translateTimeout]);

  return (
    <Card className="neo-card neon-border animate-slide-up">
      <CardHeader className="pb-8 border-b border-foreground/10">
        <CardTitle className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight">
          <Languages className="text-neon-blue" size={32} />
          <span className="text-foreground">English to Tagalog Translator</span>
        </CardTitle>
        <CardDescription className="text-lg text-foreground/80 leading-relaxed mt-3 max-w-3xl">
          Translate English text to natural, accurate Tagalog using our secure translation service
        </CardDescription>
      </CardHeader>
            
      <CardContent className="space-y-8 pt-6">
        <div>
          <Label htmlFor="input-text" className="text-lg font-semibold text-foreground block mb-2">
            English Text
          </Label>
          <p className="text-sm text-foreground/60">
            Enter the English text you want to translate to Tagalog
          </p>
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
        <div className="flex gap-3">
          <Button
            onClick={debouncedTranslate}
            disabled={isLoading || !inputText.trim()}
            className="bg-neon-blue/20 neon-border hover:bg-neon-blue/30 transition-all duration-300 h-12 px-6 font-semibold text-white"
          >
            {isLoading ? (
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
            error.includes('Service overloaded') || error.includes('Please wait') 
              ? 'border-yellow-500/50 bg-yellow-500/10' 
              : 'border-red-500/50 bg-red-500/10'
          }`}>
            <AlertDescription className={`font-medium leading-relaxed ${
              error.includes('Service overloaded') || error.includes('Please wait')
                ? 'text-yellow-300'
                : 'text-red-300'
            }`}>
              {error}
              {(error.includes('Service overloaded') || error.includes('Please wait')) && (
                <div className="mt-3 text-sm text-yellow-200 space-y-1">
                  <p><strong>💡 Tips:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Wait at least 2 seconds between requests</li>
                    <li>The service automatically handles retries with smart backoff</li>
                    <li>Your request will be processed as soon as possible</li>
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
            <div>💡 <strong>Secure Service:</strong> All translations are processed securely on our servers</div>
            <div>⏱️ <strong>Rate Limited:</strong> Automatic 2-second delay between requests for optimal performance</div>
            <div>🔄 <strong>Auto-Retry:</strong> Failed requests are automatically retried with smart backoff timing</div>
            <div>🔒 <strong>Privacy:</strong> No API keys required - everything is handled server-side</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Translator;
