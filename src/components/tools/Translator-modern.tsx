import React, { useState, useEffect } from "react";
import { Languages, Send, Copy, Check, ArrowRight, Globe, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TranslatorNew = () => {
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
    <div className="max-w-7xl mx-auto space-y-6">
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
      <Card className="neo-card neon-border">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Source Language Panel */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-neon-green/20 neon-border-green">
                  <Globe size={20} className="text-neon-green" />
                </div>
                <div>
                  <Label className="text-lg font-bold text-foreground">English</Label>
                  <p className="text-sm text-foreground/70">Source language</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Textarea
                  placeholder="Enter English text to translate... Type anything from simple phrases to complex sentences, and our AI will provide natural Tagalog translations."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[300px] resize-none text-base leading-relaxed neon-border font-medium placeholder:text-foreground/40 text-foreground bg-background/50"
                />
                <div className="flex justify-between items-center text-sm text-foreground/60">
                  <span>{inputText.length} characters</span>
                  <span className="text-xs bg-foreground/10 px-2 py-1 rounded">
                    Press Ctrl + Enter to translate
                  </span>
                </div>
              </div>
            </div>

            {/* Arrow/Divider */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 rounded-full bg-neon-purple/20 neon-border-purple">
                  <ArrowRight className="text-neon-purple" size={24} />
                </div>
                <div className="text-xs text-foreground/60 font-medium">
                  AI Translation
                </div>
              </div>
            </div>

            {/* Target Language Panel */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-neon-orange/20 neon-border-orange">
                  <Globe size={20} className="text-neon-orange" />
                </div>
                <div>
                  <Label className="text-lg font-bold text-foreground">Tagalog</Label>
                  <p className="text-sm text-foreground/70">Target language</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className={cn(
                  "min-h-[300px] p-4 rounded-lg border-2 bg-background/50 transition-all duration-200",
                  translatedText 
                    ? "neon-border-green bg-neon-green/5" 
                    : "border-foreground/20"
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
                <div className="flex justify-between items-center text-sm text-foreground/60">
                  <span>{translatedText.length} characters</span>
                  {translatedText && (
                    <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded">
                      Translation complete
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-foreground/10">
            <Button 
              onClick={translateText} 
              disabled={isLoading || !inputText.trim()}
              className="bg-neon-blue/20 neon-border-blue hover:bg-neon-blue/30 transition-all duration-300 h-12 px-6 font-semibold text-white group"
            >
              {isLoading ? (
                <RefreshCw className="animate-spin w-5 h-5 mr-2 text-white" />
              ) : (
                <Send size={18} className="mr-2 text-white group-hover:scale-110 transition-transform" />
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
                {isCopied ? "Copied!" : "Copy Translation"}
              </Button>
            )}

            {(inputText || translatedText) && (
              <Button
                onClick={clearAll}
                variant="outline"
                className="neon-border-red hover:bg-red-500/10 h-12 px-6 font-medium"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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

      {/* Features & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neo-card neon-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="text-neon-yellow" size={24} />
              <h3 className="font-bold text-foreground">Instant Translation</h3>
            </div>
            <p className="text-sm text-foreground/70">
              Fast, accurate English to Tagalog translation powered by advanced AI
            </p>
          </CardContent>
        </Card>

        <Card className="neo-card neon-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="text-neon-green" size={24} />
              <h3 className="font-bold text-foreground">Natural Language</h3>
            </div>
            <p className="text-sm text-foreground/70">
              Contextual translations that sound natural and culturally appropriate
            </p>
          </CardContent>
        </Card>

        <Card className="neo-card neon-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Languages className="text-neon-blue" size={24} />
              <h3 className="font-bold text-foreground">Smart Processing</h3>
            </div>
            <p className="text-sm text-foreground/70">
              Handles complex sentences, idioms, and colloquial expressions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Tips */}
      <Card className="neo-card neon-border">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="text-sm text-foreground/80 font-medium">
              💡 <strong>Pro Tips:</strong> Use complete sentences for better translations • Try different phrasings for varied results
            </div>
            <div className="text-xs text-foreground/60 leading-relaxed space-y-1">
              <div>🔒 <strong>Secure Service:</strong> All translations are processed securely on our servers</div>
              <div>⏱️ <strong>Rate Limited:</strong> Automatic 2-second delay between requests for optimal performance</div>
              <div>🔄 <strong>Auto-Retry:</strong> Failed requests are automatically retried with smart backoff timing</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslatorNew;
