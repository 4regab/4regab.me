import { useState, useEffect } from "react";
import { Volume2, Download, Play, Pause, Loader2, Square, Sliders, ChevronDown, ChevronUp, Bot, FileText, Zap, Settings, Mic, AudioWaveform, VolumeX, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface VoiceOption {
  name: string;
  description: string;
}

interface DetailedSettings {
  speed: number;
  stability: number;
  similarity: number;
  styleExaggeration: number;
  speakerBoost: boolean;
}

const DEFAULT_DETAILED_SETTINGS: DetailedSettings = {
  speed: 0.95,
  stability: 50,
  similarity: 50,
  styleExaggeration: 50,
  speakerBoost: false,
};

type ControlMode = "prompt" | "detailed";

const VOICE_OPTIONS: VoiceOption[] = [
  { name: "Zephyr", description: "Bright & Energetic" },
  { name: "Puck", description: "Upbeat & Youthful" },
  { name: "Charon", description: "Informative & Clear" },
  { name: "Kore", description: "Firm & Professional" },
  { name: "Fenrir", description: "Excitable & Dynamic" },
  { name: "Leda", description: "Youthful & Fresh" },
  { name: "Orus", description: "Firm & Authoritative" },
  { name: "Aoede", description: "Breezy & Light" },
  { name: "Callirrhoe", description: "Easy-going & Calm" },
  { name: "Autonoe", description: "Bright & Cheerful" },
  { name: "Enceladus", description: "Breathy & Soft" },
  { name: "Iapetus", description: "Clear & Crisp" },
  { name: "Umbriel", description: "Easy-going & Smooth" },
  { name: "Algieba", description: "Smooth & Sophisticated" },
  { name: "Despina", description: "Smooth & Elegant" },
  { name: "Erinome", description: "Clear & Articulate" },
  { name: "Algenib", description: "Gravelly & Deep" },
  { name: "Rasalgethi", description: "Informative & Mature" },
  { name: "Laomedeia", description: "Upbeat & Vibrant" },
  { name: "Achernar", description: "Soft & Gentle" },
  { name: "Alnilam", description: "Firm & Steady" },
  { name: "Schedar", description: "Even & Balanced" },
  { name: "Gacrux", description: "Mature & Wise" },
  { name: "Pulcherrima", description: "Forward & Bold" },
  { name: "Achird", description: "Friendly & Warm" },
  { name: "Zubenelgenubi", description: "Casual & Relaxed" },
  { name: "Vindemiatrix", description: "Gentle & Soothing" },
  { name: "Sadachbia", description: "Lively & Animated" },
  { name: "Sadaltager", description: "Knowledgeable & Wise" },
  { name: "Sulafat", description: "Warm & Inviting" }
];

const MODEL_OPTIONS = [
  { value: "gemini-2.5-flash-preview-tts", label: "Gemini 2.5 Flash Preview TTS" },
  { value: "gemini-2.5-flash-exp-native-audio-thinking-dialog", label: "Gemini 2.5 Flash Exp Native Audio Thinking Dialog" },
  { value: "gemini-2.5-flash-preview-native-audio-dialog", label: "Gemini 2.5 Flash Preview Native Audio Dialog" },
  { value: "gemini-2.0-flash-live-001", label: "Gemini 2.0 Flash Live 001" }
];

// Helper function to calculate variance (for PCM detection)
function calculateVariance(data: Uint8Array): number {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  return variance;
}

// Helper function to create WAV file from raw PCM data
function createWAVFromPCM(pcmData: Uint8Array, sampleRate: number = 24000, channels: number = 1, bitsPerSample: number = 16): Uint8Array {
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const uint8View = new Uint8Array(buffer);

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, fileSize, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);

  // Copy PCM data
  uint8View.set(pcmData, 44);

  return uint8View;
}

const TextToSpeech = () => {
  const [inputText, setInputText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash-preview-tts");
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [detectedFormat, setDetectedFormat] = useState<string>('mp3');
  const [canRetry, setCanRetry] = useState(false);
  const [controlMode, setControlMode] = useState<ControlMode>("prompt");
  const [detailedSettings, setDetailedSettings] = useState<DetailedSettings>(DEFAULT_DETAILED_SETTINGS);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Helper functions for detailed settings
  const updateDetailedSetting = (key: keyof DetailedSettings, value: number | boolean) => {
    setDetailedSettings(prev => ({ ...prev, [key]: value }));
  };

  const constructPromptFromSettings = (originalText: string): string => {
    if (controlMode === "prompt") {
      return originalText;
    }

    const instructions: string[] = [];
    
    // Speed mapping
    if (detailedSettings.speed < 0.85) {
      instructions.push("speak very slowly and deliberately");
    } else if (detailedSettings.speed < 0.92) {
      instructions.push("speak slowly");
    } else if (detailedSettings.speed > 1.10) {
      instructions.push("speak very quickly");
    } else if (detailedSettings.speed > 1.02) {
      instructions.push("speak at a brisk pace");
    }

    // Stability mapping
    if (detailedSettings.stability > 75) {
      instructions.push("maintain very consistent tone and pace");
    } else if (detailedSettings.stability < 25) {
      instructions.push("vary your tone and expression naturally");
    }

    // Style exaggeration mapping
    if (detailedSettings.styleExaggeration > 75) {
      instructions.push("speak with dramatic emphasis and strong emotional expression");
    } else if (detailedSettings.styleExaggeration < 25) {
      instructions.push("speak in a neutral, understated manner");
    }

    // Speaker boost
    if (detailedSettings.speakerBoost) {
      instructions.push("project your voice clearly and confidently");
    }

    if (instructions.length > 0) {
      return `${instructions.join(", ")}. ${originalText}`;
    }

    return originalText;
  };

  const generateSpeech = async () => {
    if (!inputText.trim()) {
      setError("Please enter text to convert to speech");
      return;
    }

    setIsLoading(true);
    setError("");
    setCanRetry(false);
    setRetryCount(0);

    // Clean up previous audio
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }

    try {
      const textToProcess = constructPromptFromSettings(inputText.trim());
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToProcess,
          model: selectedModel,
          voice: selectedVoice,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          setCanRetry(true);
          throw new Error(errorData.message || 'Rate limit exceeded. You can retry in a moment.');
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Invalid request. Please check your input and try again.');
        } else if (response.status === 500) {
          setCanRetry(true);
          throw new Error(errorData.message || 'Service temporarily unavailable. Please try again.');
        } else {
          throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
        }
      }

      const audioBlob = await response.blob();
      
      if (audioBlob.size === 0) {
        throw new Error("No audio data received from the service");
      }

      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Auto-detect format based on blob type or default to mp3
      const blobType = audioBlob.type;
      if (blobType.includes('mp3') || blobType.includes('mpeg')) {
        setDetectedFormat('mp3');
      } else if (blobType.includes('wav')) {
        setDetectedFormat('wav');
      } else if (blobType.includes('ogg')) {
        setDetectedFormat('ogg');
      } else {
        setDetectedFormat('mp3'); // fallback
      }

    } catch (err) {
      console.error('TTS Error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while generating speech");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retryGeneration = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      generateSpeech();
    }
  };

  const playAudio = async () => {
    if (!audioUrl) return;

    try {
      // If we have an existing audio element that's paused, resume it
      if (audioElement && audioElement.paused && !audioElement.ended) {
        setIsPlaying(true);
        await audioElement.play();
        return;
      }
      
      // Create new audio element
      const audio = new Audio();
      setAudioElement(audio);
      
      audio.onended = () => {
        setIsPlaying(false);
        setAudioElement(null);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setAudioElement(null);
        setError("Audio playback failed. Please try downloading the file.");
      };
      
      audio.src = audioUrl;
      audio.load();
      
      setIsPlaying(true);
      await audio.play();
      
    } catch (playError) {
      console.error('Play error:', playError);
      setIsPlaying(false);
      setAudioElement(null);
      setError("Unable to play audio. Please try downloading the file.");
    }
  };

  const pauseAudio = () => {
    if (audioElement && !audioElement.paused) {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
      setAudioElement(null);
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `tts_${selectedVoice}_${Date.now()}.${detectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      generateSpeech();
    }
  };
  // Clean up audio when component unmounts or audioUrl changes
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, audioElement]);
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-surface-primary/30 to-surface-secondary/30">
        {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,212,255,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.08),transparent_50%)]"></div> */}
        
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
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Text Input & Generate */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Text Input Card */}
            <Card className="neo-card neon-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neon-blue-500/20">
                      <FileText className="w-5 h-5 text-neon-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">Enter Text</CardTitle>
                      <CardDescription className="text-sm text-foreground/60">
                        Type or paste the text you want to convert to speech
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {inputText.length} / 5000
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your text here... You can write anything from a simple sentence to a long paragraph. The AI will convert it into natural-sounding speech with the voice and settings you choose."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[200px] resize-none text-base leading-relaxed bg-background/50 border-foreground/20 focus:border-neon-blue-500/50 transition-colors"
                />
                
                <div className="flex items-center justify-between text-sm text-foreground/60">
                  <span className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Ready for synthesis
                  </span>
                  <span className="text-xs bg-foreground/10 px-2 py-1 rounded">
                    Ctrl + Enter to generate
                  </span>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={generateSpeech} 
                  disabled={isLoading || !inputText.trim()}
                  className="w-full h-14 bg-gradient-to-r from-neon-purple-500/20 to-neon-blue-500/20 hover:from-neon-purple-500/30 hover:to-neon-blue-500/30 border border-neon-purple-500/30 text-white font-semibold text-lg transition-all duration-300 group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-6 h-6 mr-3" />
                      Generating Speech...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Generate Speech
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Audio Player Card */}
            {audioUrl && (
              <Card className="neo-card border-neon-purple-500/30 bg-gradient-to-br from-neon-purple-500/5 to-neon-blue-500/5">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neon-purple-500/20">
                      <Volume2 className="w-5 h-5 text-neon-purple-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">Generated Audio</CardTitle>
                      <CardDescription className="text-sm text-foreground/60">
                        Your speech is ready • Voice: {selectedVoice}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Audio Waveform Visualization (Static) */}
                  <div className="relative h-20 bg-background/30 rounded-lg border border-foreground/10 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-1 h-full px-4">
                        {Array.from({ length: 64 }, (_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-1 bg-gradient-to-t from-neon-purple-500 to-neon-blue-500 rounded-full transition-all duration-200",
                              isPlaying 
                                ? `h-${Math.floor(Math.random() * 16) + 4}` 
                                : "h-2"
                            )}
                            style={{
                              height: isPlaying 
                                ? `${Math.random() * 60 + 10}%` 
                                : '20%',
                              opacity: isPlaying ? 0.7 + Math.random() * 0.3 : 0.4
                            }}
                          />
                        ))}
                      </div>                      {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <AudioWaveform className="w-8 h-8 text-foreground/40" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={isPlaying ? pauseAudio : playAudio}
                      size="lg"
                      className="h-12 px-6 bg-neon-purple-500/20 hover:bg-neon-purple-500/30 border border-neon-purple-500/30 text-white font-medium"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 mr-2" />
                      ) : (
                        <Play className="w-5 h-5 mr-2" />
                      )}
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    
                    {audioElement && (
                      <Button
                        onClick={stopAudio}
                        variant="outline"
                        size="lg"
                        className="h-12 px-4 border-red-500/30 hover:bg-red-500/10 text-foreground"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    )}
                    
                    <Button
                      onClick={downloadAudio}
                      variant="outline"
                      size="lg"
                      className="h-12 px-4 border-neon-green-500/30 hover:bg-neon-green-500/10 text-foreground ml-auto"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {/* Audio Info */}
                  <div className="flex items-center justify-between text-sm text-foreground/60 bg-background/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <span>Model: {MODEL_OPTIONS.find(m => m.value === selectedModel)?.label.split(' ').slice(0, 3).join(' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      <span>{VOICE_OPTIONS.find(v => v.name === selectedVoice)?.description}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Voice Settings */}
          <div className="space-y-6">
            
            {/* Model Selection */}
            <Card className="neo-card neon-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neon-green-500/20">
                    <Bot className="w-5 h-5 text-neon-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">AI Model</CardTitle>
                    <CardDescription className="text-sm text-foreground/60">
                      Choose your speech synthesis engine
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="h-12 bg-background/50 border-foreground/20 focus:border-neon-green-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="neo-card border-foreground/20">
                    {MODEL_OPTIONS.map((model) => (
                      <SelectItem key={model.value} value={model.value} className="py-3">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{model.label.split(' ').slice(0, 4).join(' ')}</div>
                          <div className="text-xs text-foreground/60">
                            {model.value.includes('2.5') ? 'Latest Model' : 'Stable Version'}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Voice Selection */}
            <Card className="neo-card neon-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neon-orange-500/20">
                    <Mic className="w-5 h-5 text-neon-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Voice Character</CardTitle>
                    <CardDescription className="text-sm text-foreground/60">
                      Select the perfect voice for your content
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Featured Voices */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground/80">Popular Voices</Label>                  <div className="grid grid-cols-1 gap-2">
                    {VOICE_OPTIONS.slice(0, 2).map((voice) => (
                      <button
                        key={voice.name}
                        onClick={() => setSelectedVoice(voice.name)}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all duration-200 hover:scale-[1.02]",
                          selectedVoice === voice.name
                            ? "border-neon-orange-500/50 bg-neon-orange-500/10"
                            : "border-foreground/20 bg-background/30 hover:border-foreground/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm text-foreground">{voice.name}</div>
                            <div className="text-xs text-foreground/60 mt-1">{voice.description}</div>
                          </div>
                          {selectedVoice === voice.name && (
                            <div className="w-2 h-2 bg-neon-orange-500 rounded-full"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* All Voices Expandable */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className="w-full justify-between text-sm"
                  >
                    All Voices ({VOICE_OPTIONS.length})
                    {showAdvancedSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                  
                  {showAdvancedSettings && (                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                      {VOICE_OPTIONS.slice(2).map((voice) => (
                        <button
                          key={voice.name}
                          onClick={() => setSelectedVoice(voice.name)}
                          className={cn(
                            "p-3 rounded-lg border text-left transition-all duration-200 hover:scale-[1.02]",
                            selectedVoice === voice.name
                              ? "border-neon-orange-500/50 bg-neon-orange-500/10"
                              : "border-foreground/20 bg-background/30 hover:border-foreground/40"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm text-foreground">{voice.name}</div>
                              <div className="text-xs text-foreground/60 mt-1">{voice.description}</div>
                            </div>
                            {selectedVoice === voice.name && (
                              <div className="w-2 h-2 bg-neon-orange-500 rounded-full"></div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card className="neo-card neon-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neon-cyan-500/20">
                      <Settings className="w-5 h-5 text-neon-cyan-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">Settings</CardTitle>
                      <CardDescription className="text-sm text-foreground/60">
                        Fine-tune speech parameters
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={controlMode === "detailed"}
                    onCheckedChange={(checked) => setControlMode(checked ? "detailed" : "prompt")}
                  />
                </div>
              </CardHeader>
              
              {controlMode === "detailed" && (
                <CardContent className="space-y-6">
                  
                  {/* Speed Control */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Speed</Label>
                      <Badge variant="outline" className="text-xs">
                        {detailedSettings.speed < 0.85 ? 'Very Slow' :
                         detailedSettings.speed < 0.92 ? 'Slow' :
                         detailedSettings.speed > 1.10 ? 'Very Fast' :
                         detailedSettings.speed > 1.02 ? 'Fast' : 'Normal'}
                      </Badge>
                    </div>
                    <Slider
                      value={[detailedSettings.speed]}
                      onValueChange={(value) => updateDetailedSetting('speed', value[0])}
                      max={1.20}
                      min={0.70}
                      step={0.01}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-foreground/60">
                      <span>0.70x</span>
                      <span>1.20x</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Other Controls in Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Stability</Label>
                      <Slider
                        value={[detailedSettings.stability]}
                        onValueChange={(value) => updateDetailedSetting('stability', value[0])}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-foreground/60">Voice consistency</div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Expression</Label>
                      <Slider
                        value={[detailedSettings.styleExaggeration]}
                        onValueChange={(value) => updateDetailedSetting('styleExaggeration', value[0])}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-foreground/60">Emotional depth</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Similarity</Label>
                      <Slider
                        value={[detailedSettings.similarity]}
                        onValueChange={(value) => updateDetailedSetting('similarity', value[0])}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-xs text-foreground/60">Character fidelity</div>
                    </div>
                    <div className="space-y-2 flex flex-col justify-center">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium">Boost</Label>
                        <Switch
                          checked={detailedSettings.speakerBoost}
                          onCheckedChange={(checked) => updateDetailedSetting('speakerBoost', checked)}
                        />
                      </div>
                      <div className="text-xs text-foreground/60">Enhanced clarity</div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mt-8 border-red-500/50 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300 font-medium leading-relaxed">
              <div className="flex flex-col space-y-2">
                <span>{error}</span>
                {canRetry && (
                  <div className="pt-2">
                    <Button
                      onClick={retryGeneration}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      className="text-xs font-medium border-red-400/50 hover:bg-red-500/20"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Retry ({3 - retryCount} attempts left)
                    </Button>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Usage Tips */}
        <Card className="mt-8 neo-card border-foreground/20 bg-background/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground/80">
                <Zap className="w-4 h-4 text-neon-cyan-500" />
                Pro Tips for Better Results
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-foreground/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-blue-500 rounded-full"></div>
                  <span>Use shorter text for faster generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-purple-500 rounded-full"></div>
                  <span>Try different voices to find your perfect match</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-green-500 rounded-full"></div>
                  <span>Press Ctrl + Enter for quick generation</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TextToSpeech;
