import { useState, useEffect } from "react";
import { Volume2, Download, Play, Pause, Loader2, Square, Sliders, ChevronDown, ChevronUp, Bot, FileText, Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  { name: "Zephyr", description: "Bright" },
  { name: "Puck", description: "Upbeat" },
  { name: "Charon", description: "Informative" },
  { name: "Kore", description: "Firm" },
  { name: "Fenrir", description: "Excitable" },
  { name: "Leda", description: "Youthful" },
  { name: "Orus", description: "Firm" },
  { name: "Aoede", description: "Breezy" },
  { name: "Callirrhoe", description: "Easy-going" },
  { name: "Autonoe", description: "Bright" },
  { name: "Enceladus", description: "Breathy" },
  { name: "Iapetus", description: "Clear" },
  { name: "Umbriel", description: "Easy-going" },
  { name: "Algieba", description: "Smooth" },
  { name: "Despina", description: "Smooth" },
  { name: "Erinome", description: "Clear" },
  { name: "Algenib", description: "Gravelly" },
  { name: "Rasalgethi", description: "Informative" },
  { name: "Laomedeia", description: "Upbeat" },
  { name: "Achernar", description: "Soft" },
  { name: "Alnilam", description: "Firm" },
  { name: "Schedar", description: "Even" },
  { name: "Gacrux", description: "Mature" },
  { name: "Pulcherrima", description: "Forward" },
  { name: "Achird", description: "Friendly" },
  { name: "Zubenelgenubi", description: "Casual" },
  { name: "Vindemiatrix", description: "Gentle" },
  { name: "Sadachbia", description: "Lively" },
  { name: "Sadaltager", description: "Knowledgeable" },
  { name: "Sulafat", description: "Warm" }
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

const TextToSpeechNew = () => {
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-neon-purple/20 neon-border-purple">
            <Volume2 className="text-neon-purple" size={32} />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            Text to Speech
          </h1>
        </div>
        <p className="text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto">
          Convert text to natural-sounding speech with AI-powered voice synthesis
        </p>
      </div>

      {/* Main Layout - Split Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-[600px]">
        
        {/* Left Panel - Text Input */}
        <Card className="neo-card neon-border h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText size={20} className="text-neon-blue" />
              Your Text
            </CardTitle>
            <CardDescription className="text-foreground/70">
              Enter the text you want to convert to speech
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Input */}
            <div className="space-y-3">
              <Textarea
                id="input-text"
                placeholder="Enter your text here... You can write anything from a simple sentence to a long paragraph. The AI will convert it into natural-sounding speech."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[300px] resize-none text-base leading-relaxed neon-border font-medium placeholder:text-foreground/40 text-foreground bg-background/50"
              />
              <div className="flex justify-between items-center text-sm text-foreground/60">
                <span>{inputText.length} characters</span>
                <span className="text-xs bg-foreground/10 px-2 py-1 rounded">
                  Press Ctrl + Enter to generate
                </span>
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={generateSpeech} 
              disabled={isLoading || !inputText.trim()}
              className="w-full bg-neon-purple/20 neon-border-purple hover:bg-neon-purple/30 transition-all duration-300 h-14 text-lg font-semibold text-white group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-6 h-6 mr-3 text-white" />
              ) : (
                <Volume2 size={20} className="mr-3 text-white group-hover:scale-110 transition-transform" />
              )}
              {isLoading ? "Generating Speech..." : "Generate Speech"}
            </Button>
          </CardContent>
        </Card>

        {/* Right Panel - Voice Settings & Output */}
        <div className="space-y-6">
          
          {/* Voice Selection */}
          <Card className="neo-card neon-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Bot size={20} className="text-neon-green" />
                Voice Selection
              </CardTitle>
              <CardDescription className="text-foreground/70">
                Choose your AI model and voice character
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Model Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="neon-border h-12 text-sm font-medium">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent className="neo-card neon-border">
                    {MODEL_OPTIONS.map((model) => (
                      <SelectItem key={model.value} value={model.value} className="text-sm py-3">
                        <div className="font-medium">{model.label}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Character Selection with Cards */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Voice Character</Label>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                  {VOICE_OPTIONS.slice(0, 12).map((voice) => (
                    <button
                      key={voice.name}
                      onClick={() => setSelectedVoice(voice.name)}
                      className={cn(
                        "p-3 rounded-lg border-2 text-left transition-all duration-200 hover:scale-[1.02]",
                        selectedVoice === voice.name
                          ? "border-neon-purple bg-neon-purple/20 neon-border-purple"
                          : "border-foreground/20 bg-background/50 hover:border-foreground/40"
                      )}
                    >
                      <div className="font-medium text-sm text-foreground">{voice.name}</div>
                      <div className="text-xs text-foreground/70 mt-1">{voice.description}</div>
                    </button>
                  ))}
                </div>
                
                {/* Show All Voices Toggle */}
                {VOICE_OPTIONS.length > 12 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className="w-full text-xs"
                  >
                    {showAdvancedSettings ? 'Show Fewer Voices' : 'Show All Voices'}
                    {showAdvancedSettings ? <ChevronUp size={14} className="ml-2" /> : <ChevronDown size={14} className="ml-2" />}
                  </Button>
                )}
                
                {showAdvancedSettings && (
                  <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto pr-2">
                    {VOICE_OPTIONS.slice(12).map((voice) => (
                      <button
                        key={voice.name}
                        onClick={() => setSelectedVoice(voice.name)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-left transition-all duration-200 hover:scale-[1.02]",
                          selectedVoice === voice.name
                            ? "border-neon-purple bg-neon-purple/20 neon-border-purple"
                            : "border-foreground/20 bg-background/50 hover:border-foreground/40"
                        )}
                      >
                        <div className="font-medium text-sm text-foreground">{voice.name}</div>
                        <div className="text-xs text-foreground/70 mt-1">{voice.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings Toggle */}
          <Card className="neo-card neon-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold text-foreground">Advanced Settings</Label>
                  <p className="text-xs text-foreground/60 mt-1">
                    Fine-tune speech parameters
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={controlMode} onValueChange={(value: ControlMode) => setControlMode(value)}>
                    <SelectTrigger className="w-32 neon-border h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="neo-card neon-border">
                      <SelectItem value="prompt">Simple</SelectItem>
                      <SelectItem value="detailed">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Settings Panel */}
          {controlMode === "detailed" && (
            <Card className="neo-card neon-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sliders size={18} className="text-neon-orange" />
                  Voice Parameters
                </CardTitle>
                <CardDescription className="text-foreground/70">
                  Fine-tune your speech synthesis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Speed Control */}
                <div className="space-y-3 p-4 border border-foreground/10 rounded-lg bg-background/30">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold text-foreground">Speed</Label>
                    <span className="text-xs text-foreground/70 font-medium bg-foreground/10 px-2 py-1 rounded">
                      {detailedSettings.speed < 0.85 ? 'Very Slow' :
                       detailedSettings.speed < 0.92 ? 'Slow' :
                       detailedSettings.speed > 1.10 ? 'Very Fast' :
                       detailedSettings.speed > 1.02 ? 'Fast' : 'Normal'}
                    </span>
                  </div>
                  <Slider
                    value={[detailedSettings.speed]}
                    onValueChange={(value) => updateDetailedSetting('speed', value[0])}
                    max={1.20}
                    min={0.70}
                    step={0.01}
                    className="neon-border"
                  />
                  <p className="text-xs text-foreground/60">
                    Adjust speaking pace (0.70x - 1.20x)
                  </p>
                </div>

                {/* Other settings in a compact grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">Stability</Label>
                    <Slider
                      value={[detailedSettings.stability]}
                      onValueChange={(value) => updateDetailedSetting('stability', value[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="neon-border"
                    />
                    <p className="text-xs text-foreground/60">Voice consistency</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">Similarity</Label>
                    <Slider
                      value={[detailedSettings.similarity]}
                      onValueChange={(value) => updateDetailedSetting('similarity', value[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="neon-border"
                    />
                    <p className="text-xs text-foreground/60">Character fidelity</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">Expression</Label>
                    <Slider
                      value={[detailedSettings.styleExaggeration]}
                      onValueChange={(value) => updateDetailedSetting('styleExaggeration', value[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="neon-border"
                    />
                    <p className="text-xs text-foreground/60">Emotional depth</p>
                  </div>
                  <div className="space-y-2 flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-foreground">Speaker Boost</Label>
                      <Switch
                        checked={detailedSettings.speakerBoost}
                        onCheckedChange={(checked) => updateDetailedSetting('speakerBoost', checked)}
                      />
                    </div>
                    <p className="text-xs text-foreground/60">Enhanced clarity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio Output */}
          {audioUrl && (
            <Card className="neo-card neon-border-purple bg-neon-purple/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Volume2 size={18} className="text-neon-purple" />
                  Generated Audio
                </CardTitle>
                <CardDescription className="text-foreground/70">
                  Your speech is ready to play
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Audio Player Controls */}
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-foreground/20">
                  <Button
                    onClick={isPlaying ? pauseAudio : playAudio}
                    variant="outline"
                    size="lg"
                    className="neon-border-purple hover:bg-neon-purple/10 h-12 px-6 font-medium"
                    disabled={!audioUrl}
                  >
                    {isPlaying ? (
                      <Pause size={20} className="mr-2" />
                    ) : (
                      <Play size={20} className="mr-2" />
                    )}
                    {isPlaying ? "Pause" : audioElement && audioElement.paused ? "Resume" : "Play"}
                  </Button>
                  
                  {audioElement && (
                    <Button
                      onClick={stopAudio}
                      variant="outline"
                      size="lg"
                      className="neon-border-red hover:bg-red-500/10 h-12 px-4 font-medium"
                    >
                      <Square size={18} className="mr-2" />
                      Stop
                    </Button>
                  )}
                  
                  <Button
                    onClick={downloadAudio}
                    variant="outline"
                    size="lg"
                    className="neon-border-green hover:bg-neon-green/10 h-12 px-4 font-medium"
                  >
                    <Download size={18} className="mr-2" />
                    Download
                  </Button>
                </div>
                
                {/* Voice Info */}
                <div className="text-sm text-foreground/70 bg-foreground/10 px-4 py-3 rounded-lg">
                  <span className="font-medium">Voice:</span> {selectedVoice} 
                  <span className="text-foreground/60 ml-2">
                    ({VOICE_OPTIONS.find(v => v.name === selectedVoice)?.description})
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-500/50 bg-red-500/10 p-4 mb-6">
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
                    Retry ({3 - retryCount} attempts left)
                  </Button>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Tips */}
      <Card className="neo-card neon-border">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="text-sm text-foreground/80 font-medium">
              💡 <strong>Pro Tips:</strong> Use shorter text for better success rates • Try different voices to find your perfect match
            </div>
            <div className="text-xs text-foreground/60 leading-relaxed">
              Supports 24 languages • Press Ctrl + Enter for quick generation • Advanced settings for fine-tuning
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextToSpeechNew;
