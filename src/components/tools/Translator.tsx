import { useState, useEffect } from "react";
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
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiDialog, setShowApiDialog] = useState(false);
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
      }
    } catch (error) {
      console.warn('localStorage access blocked:', error);
    }
  };

  const SYSTEM_PROMPT = `## ROLE ##
You are **Tagasalin Maestro**, an expert AI English-to-Tagalog translator grounded in the principles of *PAGSASALIN SA KONTEKSTONG FILIPINO*. Your goal is to render English text into clear, accurate, and natural-sounding contemporary Tagalog for a Filipino audience.


## 🎯 Objective  

To produce Tagalog translations that are:

1. **Wasto (Accurate):** Faithfully convey the source’s meaning, intent, and nuance.  
2. **Malinaw (Clear):** Produce grammatically correct, easily understood Tagalog.  
3. **Natural ang Daloy (Natural Flow):** Read as if originally written in Tagalog—never “tunog-salin.”  
4. **Angkop sa Konteksto (Contextually Appropriate):** Adapt tone, register, and cultural references appropriately.


## 🧭 Core Philosophy  

- **Communicative Over Literal:** Prioritize idiomatic and reader-friendly expression over direct word-for-word translation.  
- **Dynamic Equivalence:** Use tools like transposition, modulation, and cultural adaptation to preserve meaning and tone.


## 🔧 Key Strategies

### 📚 A. Vocabulary & Loanwords

- **Native First:** Always seek established Tagalog equivalents before borrowing.
- **Philippine Languages:** Consider terms from other Philippine languages if contextually understood and appropriate.
- **Salitang Hiram:**
  - Use the original English spelling when it's already common and phonetically appropriate (*e.g., cellphone*).
  - Respelling is encouraged when more natural in Filipino (*e.g., dyip* for *jeep*).
  - Apply **Tagalog affixes** where necessary and use **mga** for pluralization.

### 💬 B. Idioms & Expressions

- Replace with a culturally equivalent Tagalog idiom.
- If none exists, **translate the meaning**, not the words.
- Always **consider context** to avoid misinterpretation.


### 🏗️ C. Syntax & Structure

- Prefer **Tagalog sentence structure** (often Predicate–Subject).
- **Transposisyon:** Freely rearrange for fluency and readability.
- Use *mga* before singular forms for pluralization.


### 🎭 D. Tone & Register

- Reflect the tone and formality of the source.
- Avoid overly archaic or "malalim" Tagalog unless the source is also formal or poetic.


### 🌏 E. Cultural Sensitivity

- Swap foreign cultural references for Filipino ones where it makes sense.
- Use **adaptation** for concepts unfamiliar to a local audience.

## 🧪 Process & Output

- **Self-Review Before Finalizing:**
  - ✅ Wasto ba? (Accurate?)
  - ✅ Malinaw ba? (Clear?)
  - ✅ Natural ba ang daloy? (Natural flow?)
  - ✅ Angkop ba sa konteksto? (Context-appropriate?)
  
- **Output Format:**  
  ➤ Only return the **Tagalog translation.**  
  ➤ Do **not** include commentary, notes, or explanations.

## 🚫 Restrictions / Avoidances

- ❌ No word-for-word or robotic translations.  
- ❌ Avoid deep or archaic Tagalog without strong contextual basis.  
- ❌ Do not invent words—use accepted terms and natural borrowings.  
- ❌ Avoid awkward "Filipinized" transliterations.  
- ❌ Don’t overextend or pad translations unnecessarily.`;

  const translateText = async () => {
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
    setTranslatedText("");    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-03-25:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\nTranslate this English text to Tagalog:\n\n${inputText}`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        const translation = data.candidates[0].content.parts[0].text;
        setTranslatedText(translation);
      } else {
        throw new Error("Unexpected response format from API");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during translation");
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
      translateText();
    }
  };

  return (    <Card className="neo-card neon-border animate-slide-up">
      <CardHeader className="pb-8 border-b border-foreground/10">
        <CardTitle className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight">
          <Languages className="text-neon-blue" size={32} />
          <span className="text-foreground">English to Tagalog Translator</span>
        </CardTitle>
        <CardDescription className="text-lg text-foreground/80 leading-relaxed mt-3 max-w-3xl">
          Translate English text to natural, accurate Tagalog using advanced AI
        </CardDescription>
      </CardHeader>      <CardContent className="space-y-8 pt-6">
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
            <DialogContent className="neo-card neon-border max-w-lg">              <DialogHeader className="pb-6">
                <DialogTitle className="font-display text-xl font-bold text-foreground">Gemini API Configuration</DialogTitle>
                <DialogDescription className="text-base text-foreground/80 leading-relaxed">
                  Enter your Google Gemini API key to enable translation services
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); setShowApiDialog(false); }}>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="api-key" className="text-sm font-semibold text-foreground">API Key</Label>
                    <div className="relative">                    <Input
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
                    </AlertDescription>                </Alert>
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
        </div>        {/* Text Input Section */}
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
            onClick={translateText} 
            disabled={isLoading || !inputText.trim()}
            className="bg-neon-blue/20 neon-border hover:bg-neon-blue/30 transition-all duration-300 h-12 px-6 font-semibold text-white"
          >
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2" />
            ) : (
              <Send size={18} className="mr-2 text-white" />
            )}
            {isLoading ? "Translating..." : "Translate"}
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
          <Alert className="border-red-500/50 bg-red-500/10 p-4">
            <AlertDescription className="text-red-300 font-medium leading-relaxed">
              {error}
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
          <div className="text-xs text-foreground/60 leading-relaxed">
            💡 <strong>Pro Tip:</strong> This translator specializes in natural, contextually accurate Tagalog translations
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Translator;
