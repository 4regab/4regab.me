import { useState, useEffect } from "react";
import { Volume2, Play, Pause, Square, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

const TextToSpeech = () => {
  const [inputText, setInputText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Load available voices on component mount
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      setError("Text-to-Speech is not supported in your browser. Please try using Chrome, Firefox, Safari, or Edge.");
      return;
    }

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Set default voice to first English voice if available
      if (voices.length > 0 && !selectedVoice) {
        const englishVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        setSelectedVoice(englishVoice.name);
      }
    };

    // Load voices immediately if available
    loadVoices();
    
    // Also load when voices become available (some browsers load them async)
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice]);

  // Update settings
  const updateSetting = (key: keyof VoiceSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const speak = () => {
    if (!inputText.trim()) {
      setError("Please enter text to convert to speech");
      return;
    }

    if (!isSupported) {
      setError("Text-to-Speech is not supported in your browser");
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();
    
    setError("");
    
    const utterance = new SpeechSynthesisUtterance(inputText.trim());
    
    // Find and set the selected voice
    const voice = availableVoices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }
    
    // Apply settings
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    // Set up event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentUtterance(utterance);
    };
    
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setError("An error occurred during speech synthesis. Please try again.");
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
    };
    
    // Start speaking
    speechSynthesis.speak(utterance);
  };

  const pauseResume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    } else {
      speechSynthesis.pause();
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentUtterance(null);
  };

  // Get popular voices for quick selection
  const getPopularVoices = () => {
    const popular = availableVoices.filter(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default)
    ).slice(0, 2);
    
    return popular.length > 0 ? popular : availableVoices.slice(0, 2);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      speak();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-surface-primary/30 to-surface-secondary/30">
        <div className="relative container mx-auto px-6 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple-500 via-neon-blue-500 to-neon-green-500">
                Text to Speech
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Text Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="neo-card neon-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neon-blue-500/20">
                    <Volume2 className="w-5 h-5 text-neon-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Enter Text</CardTitle>
                    <CardDescription className="text-sm text-foreground/60">
                      Type or paste text to convert to speech
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter the text you want to convert to speech..."
                  className="min-h-[200px] resize-none text-base"
                  maxLength={5000}
                />
                <div className="text-xs text-foreground/50 text-right">
                  {inputText.length}/5000 characters
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex gap-3">
                  <Button
                    onClick={isPlaying ? pauseResume : speak}
                    size="lg"
                    className="h-12 px-6 bg-neon-blue-500 hover:bg-neon-blue-600 text-white"
                    disabled={!inputText.trim() || !isSupported}
                  >
                    {isPlaying && !isPaused ? (
                      <Pause className="w-5 h-5 mr-2" />
                    ) : (
                      <Play className="w-5 h-5 mr-2" />
                    )}
                    {isPlaying && !isPaused ? "Pause" : isPaused ? "Resume" : "Play"}
                  </Button>
                  
                  <Button
                    onClick={stop}
                    variant="outline"
                    size="lg"
                    className="h-12 px-4 border-red-500/30 hover:bg-red-500/10 text-foreground"
                    disabled={!isPlaying && !isPaused}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            <Card className="neo-card neon-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neon-green-500/20">
                    <Settings className="w-5 h-5 text-neon-green-500" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Voice Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Voice Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Voice</Label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Speech Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Speed</Label>
                    <Badge variant="secondary" className="text-xs">
                      {settings.rate}x
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.rate]}
                    onValueChange={(value) => updateSetting('rate', value[0])}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Speech Pitch */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Pitch</Label>
                    <Badge variant="secondary" className="text-xs">
                      {settings.pitch}x
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.pitch]}
                    onValueChange={(value) => updateSetting('pitch', value[0])}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Volume */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Volume</Label>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(settings.volume * 100)}%
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.volume]}
                    onValueChange={(value) => updateSetting('volume', value[0])}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {!isSupported && (
              <Alert variant="destructive">
                <AlertDescription>
                  Your browser doesn't support text-to-speech. Please try Chrome, Firefox, Safari, or Edge.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
