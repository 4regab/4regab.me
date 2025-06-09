import React, { useState, useEffect } from "react";
import { Languages, Send, Copy, Check, ArrowUpDown, Globe, Zap, RefreshCw, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DirectTranslationService } from "@/lib/direct-translation-service";

const Translator = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [showTips, setShowTips] = useState(false);

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
      try {        // Check rate limiting before making request
        checkRateLimit();
          // Use the direct translation service (temporary fix for backend issues)
        const response = await DirectTranslationService.translate({
          text: inputText.trim(),
          targetLanguage: 'Filipino',
          sourceLanguage: 'auto'
        });setTranslatedText(response.translatedText);
        setRetryCount(0); // Reset retry count on success
      } catch (err) {
        if (err instanceof Error) {
          // Handle rate limiting and retry logic
          if (err.message.includes('Rate limit') || err.message.includes('429')) {
            if (currentRetry < MAX_RETRIES) {
              currentRetry++;
              setRetryCount(currentRetry);
              
              const backoffTime = 5000 * Math.pow(2, currentRetry - 1); // 5s, 10s
              setError(`Rate limit exceeded. Retrying in ${backoffTime / 1000} seconds... (Attempt ${currentRetry}/${MAX_RETRIES})`);
              
              await sleep(backoffTime);
              return attemptTranslation();
            } else {
              throw new Error('Rate limit exceeded. Please try again later.');
            }
          } else if (err.message.includes('timeout')) {
            if (currentRetry < MAX_RETRIES) {
              currentRetry++;
              setRetryCount(currentRetry);
              
              const backoffTime = 3000 * currentRetry; // 3s, 6s
              setError(`Request timeout. Retrying in ${backoffTime / 1000} seconds... (Attempt ${currentRetry}/${MAX_RETRIES})`);
              
              await sleep(backoffTime);
              return attemptTranslation();
            } else {
              throw new Error('Translation service is not responding. Please try again later.');
            }
          } else {
            throw err;
          }
        } else {
          throw new Error('An unexpected error occurred during translation');
        }
      }
    };

    try {
      await attemptTranslation();
    } catch (err) {
      console.error('Translation error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during translation");
      }
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
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-neon-blue/20 neon-border-blue">
            <Languages className="text-neon-blue" size={32} />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            English to Tagalog Translator
          </h1>
        </div>
        <p className="text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto">
          Instantly translate English text to natural Tagalog with AI-powered translation
        </p>
      </div>

      {/* Main Translation Interface */}
      <Card className="neo-card border-2 border-foreground/10">
        <CardContent className="p-6 space-y-6">
          
          {/* Language Labels */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-neon-green/80"></div>
              <Label className="text-sm font-semibold text-foreground">English</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full border border-foreground/20 hover:border-neon-purple/50 hover:bg-neon-purple/10 transition-all duration-200"
                title="Language swap (coming soon)"
                disabled
              >
                <ArrowUpDown size={14} className="text-foreground/60" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold text-foreground">Tagalog</Label>
              <div className="w-4 h-4 rounded-full bg-neon-orange/80"></div>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                placeholder="Enter English text to translate..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                className={cn(
                  "min-h-[140px] resize-none text-base leading-relaxed font-medium placeholder:text-foreground/40 text-foreground bg-background/50 border-2 transition-all duration-200",
                  inputText ? "border-neon-green/50 bg-neon-green/5" : "border-foreground/20"
                )}
              />
              {inputText && (
                <Button
                  onClick={() => setInputText("")}
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 h-6 w-6 p-0 rounded-full hover:bg-foreground/10"
                >
                  <X size={14} />
                </Button>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground/60">{inputText.length} characters</span>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={translateText} 
                  disabled={isLoading || !inputText.trim()}
                  className={cn(
                    "bg-neon-blue hover:bg-neon-blue/90 text-white font-semibold h-10 px-6 transition-all duration-300",
                    isLoading && "animate-pulse"
                  )}
                >
                  {isLoading ? (
                    <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                  ) : (
                    <Send size={16} className="mr-2" />
                  )}
                  {isLoading 
                    ? retryCount > 0 
                      ? `Retrying...` 
                      : "Translating..."
                    : "Translate"
                  }
                </Button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-3">
            <div className={cn(
              "min-h-[140px] p-4 rounded-lg border-2 transition-all duration-300",
              translatedText 
                ? "border-neon-orange/50 bg-neon-orange/5" 
                : "border-foreground/20 bg-background/50"
            )}>
              {translatedText ? (
                <p className="text-base leading-relaxed font-medium text-foreground whitespace-pre-wrap">
                  {translatedText}
                </p>
              ) : (
                <p className="text-foreground/40 text-base">
                  {isLoading 
                    ? "Translating your text..." 
                    : "Translation will appear here..."
                  }
                </p>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground/60">{translatedText.length} characters</span>
              <div className="flex items-center gap-2">
                {translatedText && (
                  <>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 border-neon-green/50 hover:bg-neon-green/10 hover:border-neon-green transition-all duration-200"
                    >
                      {isCopied ? (
                        <Check size={14} className="mr-2 text-neon-green" />
                      ) : (
                        <Copy size={14} className="mr-2" />
                      )}
                      {isCopied ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      onClick={clearAll}
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 border-foreground/20 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200"
                    >
                      Clear All
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className={cn(
          "border-2 transition-all duration-200",
          error.includes('Service overloaded') || error.includes('Please wait') 
            ? 'border-yellow-500/50 bg-yellow-500/10' 
            : 'border-red-500/50 bg-red-500/10'
        )}>
          <AlertDescription className={cn(
            "font-medium leading-relaxed",
            error.includes('Service overloaded') || error.includes('Please wait')
              ? 'text-yellow-300'
              : 'text-red-300'
          )}>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Collapsible Tips Section */}
      <Card className="neo-card border-2 border-foreground/10">
        <CardContent className="p-4">
          <Button
            onClick={() => setShowTips(!showTips)}
            variant="ghost"
            className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Zap className="text-neon-yellow" size={20} />
              <span className="font-semibold text-foreground">Tips & Features</span>
            </div>
            {showTips ? (
              <ChevronUp size={20} className="text-foreground/60" />
            ) : (
              <ChevronDown size={20} className="text-foreground/60" />
            )}
          </Button>
          
          {showTips && (
            <div className="mt-4 space-y-4 border-t border-foreground/10 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="text-neon-green" size={16} />
                    <h4 className="font-semibold text-sm text-foreground">Natural Language</h4>
                  </div>
                  <p className="text-xs text-foreground/70">
                    Contextual translations that sound natural and culturally appropriate
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Languages className="text-neon-blue" size={16} />
                    <h4 className="font-semibold text-sm text-foreground">Smart Processing</h4>
                  </div>
                  <p className="text-xs text-foreground/70">
                    Handles complex sentences, idioms, and colloquial expressions
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-2 pt-2 border-t border-foreground/10">
                <div className="text-xs text-foreground/70 space-y-1">
                  <div>💡 <strong>Pro Tip:</strong> Use complete sentences for better translations</div>
                  <div>⌨️ <strong>Shortcut:</strong> Press Ctrl + Enter to translate</div>
                  <div>⏱️ <strong>Rate Limited:</strong> 2-second delay between requests for optimal performance</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Translator;
