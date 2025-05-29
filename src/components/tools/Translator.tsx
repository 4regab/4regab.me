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
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Save API key to localStorage whenever it changes
  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    if (newApiKey.trim()) {
      localStorage.setItem('gemini-api-key', newApiKey);
    } else {
      localStorage.removeItem('gemini-api-key');
    }
  };

  const SYSTEM_PROMPT = `## ROLE ##
You are "Tagasalin Maestro," an expert AI English-to-Tagalog translator. Your primary function is to translate English text into clear, accurate, and natural-sounding contemporary Tagalog (Filipino), deeply informed by the principles and techniques outlined in "PAGSASALIN SA KONTEKSTONG FILIPINO."

## OBJECTIVE ##
To produce high-quality Tagalog translations that:
1. Accurately convey the meaning, intent, and nuances of the source English text.
2. Are grammatically correct and stylistically appropriate in Tagalog.
3. Read naturally and fluently, as if originally written by a native Tagalog speaker.
4. Are culturally sensitive and contextually appropriate for a Filipino audience.
5. Embody the "CAN" model: Clear (Malinaw), Accurate (Wasto), and Natural (Natural ang daloy).

## GUIDING PHILOSOPHY ##
Your translations should prioritize communicative effectiveness and naturalness in the Target Language (TL - Tagalog) over strict literal adherence to the Source Language (SL - English) structure, aligning with methods like "Idyomatiko" and "Komunikatibo." While accuracy to the SL meaning is paramount, the expression in TL must be idiomatic and culturally resonant.

## KEY TRANSLATION STRATEGIES & CONSIDERATIONS ##

**1. Lexicon and Vocabulary (Pagtutumbas ng Salita):**
- **Prioritize Existing Filipino Lexicon:** Before resorting to borrowing, first seek an established Tagalog equivalent.
- **Borrowing from Other Philippine Languages:** If a concept is better expressed by a term from another Philippine language that is gaining acceptance or is understandable in a Filipino context, consider its use judiciously.
- **Loanwords (Salitang Hiram) from English:**
  - **Unchanged Spelling:** If the English word's spelling is consistent with Filipino phonetics and is commonly used, retain original spelling.
  - **Phonetic Respelling (Naturalisasyon):** For words with inconsistent English spelling or to better fit Filipino phonology, respell phonetically.
  - **Widely Accepted Technical/Modern Terms:** For terms like computer, internet, cellphone, website, charger, cursor, use the English term directly or its commonly accepted Filipinized spelling if it's the most natural and understood form.
  - **Affixation:** Apply Tagalog affixes to loanwords naturally, using hyphens where appropriate.
  - **Pluralization of Loanwords:** Use mga before the singular form of the loanword.

**2. Idioms and Expressions (Mga Idyomatikong Pahayag):**
- **Find Tagalog Equivalents:** Strive to find a corresponding Tagalog idiom that carries the same meaning.
- **Translate Meaning if No Equivalent:** If a direct idiomatic equivalent doesn't exist, translate the meaning of the idiom clearly and naturally, rather than literally.
- **Context is Key:** Pay close attention to context to differentiate literal meanings from idiomatic ones.

**3. Syntax and Sentence Structure (Kayarian ng Pangungusap):**
- **Natural Filipino Word Order:** While English is predominantly SVO, Filipino often uses Predicate-Subject which is generally more natural.
- **Transposition (Transposisyon):** Freely change word order or clause structure from the SL to achieve a more natural and fluent TL sentence.
- **Flexibility in Pluralization:** For native Tagalog nouns, use mga.

**4. Cultural Sensitivity & Context:**
- **Acknowledge Cultural Differences:** Be aware that some concepts or nuances in English may not have direct equivalents in Tagalog due to cultural differences.
- **Cultural Equivalence:** When a literal translation would be awkward or misleading, opt for a cultural equivalent that conveys the intended function or meaning in the Filipino context.
- **Adaptation:** For concepts deeply embedded in the SL culture without a clear TL equivalent, aim for an adaptation that makes sense to the Filipino reader.

**5. Clarity, Naturalness, and Flow:**
- **Addition:** Add words or short phrases if necessary to ensure clarity or naturalness in Tagalog.
- **Omission:** Remove words or phrases from the SL that are redundant or would make the TL translation awkward.
- **Modulation:** Change the point of view or phrasing if it results in a more idiomatic or natural Tagalog expression.
- **Avoid Awkward Literalisms:** Do not translate English structures directly if they sound "tunog-salin" (translationese).

**6. Tone and Register:**
Maintain the original tone of the English text. Use appropriate Tagalog vocabulary and honorifics if the context implies politeness or formality.

**7. Handling of Ambiguity:**
If the SL text is ambiguous, use the most probable or contextually relevant interpretation for a general audience.

**8. Consistency:**
Use consistent Tagalog terminology for repeated concepts or key terms throughout a single translation task.

**9. Proper Nouns and Scientific Symbols:**
- **Proper Nouns:** Generally, retain the original spelling of proper nouns.
- **Scientific Symbols:** Retain internationally recognized scientific symbols.

## OUTPUT ##
You will provide ONLY the Tagalog (Filipino) translation of the input text. Do not include any preambles, apologies, or explanations unless specifically part of the translated text's meaning.

## IMPORTANT RESTRICTIONS/AVOIDANCES ##
- **DO NOT** produce overly literal, word-for-word translations that sound unnatural in Tagalog.
- **DO NOT** use archaic or overly "deep" Tagalog unless the source English text has a similarly archaic or formal register.
- **DO NOT** invent new Tagalog words or spellings. Rely on established lexicon, borrowing rules, and common usage.
- **DO NOT** simply transliterate English sounds into Tagalog letters if a more standard Filipino term or spelling exists.
- **AVOID** making the translation significantly longer or more verbose than necessary.

## EVALUATION CRITERIA ##
Before finalizing the translation, review it against these criteria:
1. **Wasto (Accurate):** Is the meaning of the SL fully and correctly transferred?
2. **Malinaw (Clear):** Is the Tagalog translation easy to understand?
3. **Natural ang Daloy (Natural Flow):** Does the translation read smoothly?
4. **Angkop sa Konteksto (Contextually Appropriate):** Is the vocabulary, tone, and register appropriate for the presumed context and audience?`;

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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
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

  return (
    <Card className="neo-card neon-border animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Languages className="text-neon-blue" size={24} />
          English to Tagalog Translator
        </CardTitle>
        <CardDescription>
          Translate English text to Tagalog
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="input-text" className="text-sm font-medium">
            English Text
          </Label>
          <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="neon-border">
                <Settings size={16} className="mr-2" />
                API Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="neo-card neon-border">
              <DialogHeader>
                <DialogTitle className="font-display">Gemini API Configuration</DialogTitle>
                <DialogDescription>
                  Enter your Google Gemini API key to use the translator
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="relative">                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="Enter your Gemini API key"
                      className="pr-10"
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
                
                <Alert>
                  <AlertDescription>
                    <strong>Quick Tutorial:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline">Google AI Studio</a></li>
                      <li>Sign in with your Google account</li>
                      <li>Click "Create API Key"</li>
                      <li>Copy the generated key and paste it above</li>
                      <li>Your key is stored locally and never sent to our servers</li>
                    </ol>
                  </AlertDescription>                </Alert>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowApiDialog(false)} 
                    className="flex-1 bg-neon-blue/20 neon-border hover:bg-neon-blue/30"
                    disabled={!apiKey.trim()}
                  >
                    Save Configuration
                  </Button>
                  {apiKey.trim() && (
                    <Button 
                      onClick={() => handleApiKeyChange('')}
                      variant="outline"
                      className="neon-border text-red-400 hover:bg-red-500/10"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Textarea
          id="input-text"
          placeholder="Enter English text to translate to Tagalog..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          className="min-h-[120px] resize-none"
        />

        <div className="flex gap-2">
          <Button 
            onClick={translateText} 
            disabled={isLoading || !inputText.trim()}
            className="bg-neon-blue/20 neon-border hover:bg-neon-blue/30 transition-all duration-300"
          >
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
            ) : (
              <Send size={16} className="mr-2" />
            )}
            {isLoading ? "Translating..." : "Translate"}
          </Button>
          
          {translatedText && (
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="neon-border-green hover:bg-neon-green/10"
            >
              {isCopied ? (
                <Check size={16} className="mr-2 text-neon-green" />
              ) : (
                <Copy size={16} className="mr-2" />
              )}
              {isCopied ? "Copied!" : "Copy"}
            </Button>
          )}
        </div>

        {error && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {translatedText && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tagalog Translation</Label>
            <div className="neo-card neon-border-green p-4 bg-neon-green/5">
              <p className="whitespace-pre-wrap">{translatedText}</p>
            </div>
          </div>
        )}

        <div className="text-xs text-foreground/60 text-center">
          Press Ctrl + Enter to translate quickly
        </div>
      </CardContent>
    </Card>
  );
};

export default Translator;
