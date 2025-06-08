import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Volume2, Download, Play, Pause, Loader2, Square, ChevronDown, ChevronUp, Bot, FileText, Zap, Settings, Mic, AudioWaveform, AlertTriangle } from "lucide-react";
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
const DEFAULT_DETAILED_SETTINGS = {
    speed: 0.95,
    stability: 50,
    similarity: 50,
    styleExaggeration: 50,
    speakerBoost: false,
};
const VOICE_OPTIONS = [
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
function calculateVariance(data) {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return variance;
}
// Helper function to create WAV file from raw PCM data
function createWAVFromPCM(pcmData, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
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
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [detectedFormat, setDetectedFormat] = useState('mp3');
    const [canRetry, setCanRetry] = useState(false);
    const [controlMode, setControlMode] = useState("prompt");
    const [detailedSettings, setDetailedSettings] = useState(DEFAULT_DETAILED_SETTINGS);
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    // Helper functions for detailed settings
    const updateDetailedSetting = (key, value) => {
        setDetailedSettings(prev => ({ ...prev, [key]: value }));
    };
    const constructPromptFromSettings = (originalText) => {
        if (controlMode === "prompt") {
            return originalText;
        }
        const instructions = [];
        // Speed mapping
        if (detailedSettings.speed < 0.85) {
            instructions.push("speak very slowly and deliberately");
        }
        else if (detailedSettings.speed < 0.92) {
            instructions.push("speak slowly");
        }
        else if (detailedSettings.speed > 1.10) {
            instructions.push("speak very quickly");
        }
        else if (detailedSettings.speed > 1.02) {
            instructions.push("speak at a brisk pace");
        }
        // Stability mapping
        if (detailedSettings.stability > 75) {
            instructions.push("maintain very consistent tone and pace");
        }
        else if (detailedSettings.stability < 25) {
            instructions.push("vary your tone and expression naturally");
        }
        // Style exaggeration mapping
        if (detailedSettings.styleExaggeration > 75) {
            instructions.push("speak with dramatic emphasis and strong emotional expression");
        }
        else if (detailedSettings.styleExaggeration < 25) {
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
                }
                else if (response.status === 400) {
                    throw new Error(errorData.message || 'Invalid request. Please check your input and try again.');
                }
                else if (response.status === 500) {
                    setCanRetry(true);
                    throw new Error(errorData.message || 'Service temporarily unavailable. Please try again.');
                }
                else {
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
            }
            else if (blobType.includes('wav')) {
                setDetectedFormat('wav');
            }
            else if (blobType.includes('ogg')) {
                setDetectedFormat('ogg');
            }
            else {
                setDetectedFormat('mp3'); // fallback
            }
        }
        catch (err) {
            console.error('TTS Error:', err);
            if (err instanceof Error) {
                setError(err.message);
            }
            else {
                setError("An unexpected error occurred while generating speech");
            }
        }
        finally {
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
        if (!audioUrl)
            return;
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
        }
        catch (playError) {
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
    const handleKeyPress = (e) => {
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
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("div", { className: "relative overflow-hidden bg-gradient-to-br from-background via-surface-primary/30 to-surface-secondary/30", children: _jsx("div", { className: "relative container mx-auto px-6 py-16", children: _jsx("div", { className: "max-w-3xl mx-auto text-center space-y-6", children: _jsx("h1", { className: "text-5xl md:text-6xl font-display font-bold tracking-tight", children: _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-neon-purple-500 via-neon-blue-500 to-neon-green-500", children: "Text to Speech" }) }) }) }) }), _jsxs("div", { className: "container mx-auto px-6 py-12 max-w-7xl", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs(Card, { className: "neo-card neon-border", children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-lg bg-neon-blue-500/20", children: _jsx(FileText, { className: "w-5 h-5 text-neon-blue-500" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg font-semibold", children: "Enter Text" }), _jsx(CardDescription, { className: "text-sm text-foreground/60", children: "Type or paste the text you want to convert to speech" })] })] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [inputText.length, " / 5000"] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(Textarea, { placeholder: "Enter your text here... You can write anything from a simple sentence to a long paragraph. The AI will convert it into natural-sounding speech with the voice and settings you choose.", value: inputText, onChange: (e) => setInputText(e.target.value), onKeyDown: handleKeyPress, className: "min-h-[200px] resize-none text-base leading-relaxed bg-background/50 border-foreground/20 focus:border-neon-blue-500/50 transition-colors" }), _jsxs("div", { className: "flex items-center justify-between text-sm text-foreground/60", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Mic, { className: "w-4 h-4" }), "Ready for synthesis"] }), _jsx("span", { className: "text-xs bg-foreground/10 px-2 py-1 rounded", children: "Ctrl + Enter to generate" })] }), _jsx(Button, { onClick: generateSpeech, disabled: isLoading || !inputText.trim(), className: "w-full h-14 bg-gradient-to-r from-neon-purple-500/20 to-neon-blue-500/20 hover:from-neon-purple-500/30 hover:to-neon-blue-500/30 border border-neon-purple-500/30 text-white font-semibold text-lg transition-all duration-300 group", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "animate-spin w-6 h-6 mr-3" }), "Generating Speech..."] })) : (_jsxs(_Fragment, { children: [_jsx(Volume2, { className: "w-6 h-6 mr-3 group-hover:scale-110 transition-transform" }), "Generate Speech"] })) })] })] }), audioUrl && (_jsxs(Card, { className: "neo-card border-neon-purple-500/30 bg-gradient-to-br from-neon-purple-500/5 to-neon-blue-500/5", children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-lg bg-neon-purple-500/20", children: _jsx(Volume2, { className: "w-5 h-5 text-neon-purple-500" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg font-semibold", children: "Generated Audio" }), _jsxs(CardDescription, { className: "text-sm text-foreground/60", children: ["Your speech is ready \u2022 Voice: ", selectedVoice] })] })] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx("div", { className: "relative h-20 bg-background/30 rounded-lg border border-foreground/10 overflow-hidden", children: _jsxs("div", { className: "absolute inset-0 flex items-center justify-center", children: [_jsx("div", { className: "flex items-center gap-1 h-full px-4", children: Array.from({ length: 64 }, (_, i) => (_jsx("div", { className: cn("w-1 bg-gradient-to-t from-neon-purple-500 to-neon-blue-500 rounded-full transition-all duration-200", isPlaying
                                                                            ? `h-${Math.floor(Math.random() * 16) + 4}`
                                                                            : "h-2"), style: {
                                                                            height: isPlaying
                                                                                ? `${Math.random() * 60 + 10}%`
                                                                                : '20%',
                                                                            opacity: isPlaying ? 0.7 + Math.random() * 0.3 : 0.4
                                                                        } }, i))) }), "                      ", !isPlaying && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx(AudioWaveform, { className: "w-8 h-8 text-foreground/40" }) }))] }) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { onClick: isPlaying ? pauseAudio : playAudio, size: "lg", className: "h-12 px-6 bg-neon-purple-500/20 hover:bg-neon-purple-500/30 border border-neon-purple-500/30 text-white font-medium", children: [isPlaying ? (_jsx(Pause, { className: "w-5 h-5 mr-2" })) : (_jsx(Play, { className: "w-5 h-5 mr-2" })), isPlaying ? "Pause" : "Play"] }), audioElement && (_jsxs(Button, { onClick: stopAudio, variant: "outline", size: "lg", className: "h-12 px-4 border-red-500/30 hover:bg-red-500/10 text-foreground", children: [_jsx(Square, { className: "w-4 h-4 mr-2" }), "Stop"] })), _jsxs(Button, { onClick: downloadAudio, variant: "outline", size: "lg", className: "h-12 px-4 border-neon-green-500/30 hover:bg-neon-green-500/10 text-foreground ml-auto", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download"] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm text-foreground/60 bg-background/30 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Bot, { className: "w-4 h-4" }), _jsxs("span", { children: ["Model: ", MODEL_OPTIONS.find(m => m.value === selectedModel)?.label.split(' ').slice(0, 3).join(' ')] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Volume2, { className: "w-4 h-4" }), _jsx("span", { children: VOICE_OPTIONS.find(v => v.name === selectedVoice)?.description })] })] })] })] }))] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "neo-card neon-border", children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-lg bg-neon-green-500/20", children: _jsx(Bot, { className: "w-5 h-5 text-neon-green-500" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg font-semibold", children: "AI Model" }), _jsx(CardDescription, { className: "text-sm text-foreground/60", children: "Choose your speech synthesis engine" })] })] }) }), _jsx(CardContent, { children: _jsxs(Select, { value: selectedModel, onValueChange: setSelectedModel, children: [_jsx(SelectTrigger, { className: "h-12 bg-background/50 border-foreground/20 focus:border-neon-green-500/50", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { className: "neo-card border-foreground/20", children: MODEL_OPTIONS.map((model) => (_jsx(SelectItem, { value: model.value, className: "py-3", children: _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "font-medium text-sm", children: model.label.split(' ').slice(0, 4).join(' ') }), _jsx("div", { className: "text-xs text-foreground/60", children: model.value.includes('2.5') ? 'Latest Model' : 'Stable Version' })] }) }, model.value))) })] }) })] }), _jsxs(Card, { className: "neo-card neon-border", children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-lg bg-neon-orange-500/20", children: _jsx(Mic, { className: "w-5 h-5 text-neon-orange-500" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg font-semibold", children: "Voice Character" }), _jsx(CardDescription, { className: "text-sm text-foreground/60", children: "Select the perfect voice for your content" })] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-sm font-medium text-foreground/80", children: "Popular Voices" }), "                  ", _jsx("div", { className: "grid grid-cols-1 gap-2", children: VOICE_OPTIONS.slice(0, 2).map((voice) => (_jsx("button", { onClick: () => setSelectedVoice(voice.name), className: cn("p-3 rounded-lg border text-left transition-all duration-200 hover:scale-[1.02]", selectedVoice === voice.name
                                                                        ? "border-neon-orange-500/50 bg-neon-orange-500/10"
                                                                        : "border-foreground/20 bg-background/30 hover:border-foreground/40"), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm text-foreground", children: voice.name }), _jsx("div", { className: "text-xs text-foreground/60 mt-1", children: voice.description })] }), selectedVoice === voice.name && (_jsx("div", { className: "w-2 h-2 bg-neon-orange-500 rounded-full" }))] }) }, voice.name))) })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-3", children: [_jsxs(Button, { variant: "outline", onClick: () => setShowAdvancedSettings(!showAdvancedSettings), className: "w-full justify-between text-sm", children: ["All Voices (", VOICE_OPTIONS.length, ")", showAdvancedSettings ? _jsx(ChevronUp, { className: "w-4 h-4" }) : _jsx(ChevronDown, { className: "w-4 h-4" })] }), showAdvancedSettings && (_jsx("div", { className: "grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2", children: VOICE_OPTIONS.slice(2).map((voice) => (_jsx("button", { onClick: () => setSelectedVoice(voice.name), className: cn("p-3 rounded-lg border text-left transition-all duration-200 hover:scale-[1.02]", selectedVoice === voice.name
                                                                        ? "border-neon-orange-500/50 bg-neon-orange-500/10"
                                                                        : "border-foreground/20 bg-background/30 hover:border-foreground/40"), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm text-foreground", children: voice.name }), _jsx("div", { className: "text-xs text-foreground/60 mt-1", children: voice.description })] }), selectedVoice === voice.name && (_jsx("div", { className: "w-2 h-2 bg-neon-orange-500 rounded-full" }))] }) }, voice.name))) }))] })] })] }), _jsxs(Card, { className: "neo-card neon-border", children: [_jsx(CardHeader, { className: "pb-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-lg bg-neon-cyan-500/20", children: _jsx(Settings, { className: "w-5 h-5 text-neon-cyan-500" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg font-semibold", children: "Settings" }), _jsx(CardDescription, { className: "text-sm text-foreground/60", children: "Fine-tune speech parameters" })] })] }), _jsx(Switch, { checked: controlMode === "detailed", onCheckedChange: (checked) => setControlMode(checked ? "detailed" : "prompt") })] }) }), controlMode === "detailed" && (_jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Label, { className: "text-sm font-medium", children: "Speed" }), _jsx(Badge, { variant: "outline", className: "text-xs", children: detailedSettings.speed < 0.85 ? 'Very Slow' :
                                                                            detailedSettings.speed < 0.92 ? 'Slow' :
                                                                                detailedSettings.speed > 1.10 ? 'Very Fast' :
                                                                                    detailedSettings.speed > 1.02 ? 'Fast' : 'Normal' })] }), _jsx(Slider, { value: [detailedSettings.speed], onValueChange: (value) => updateDetailedSetting('speed', value[0]), max: 1.20, min: 0.70, step: 0.01, className: "w-full" }), _jsxs("div", { className: "flex justify-between text-xs text-foreground/60", children: [_jsx("span", { children: "0.70x" }), _jsx("span", { children: "1.20x" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs font-medium", children: "Stability" }), _jsx(Slider, { value: [detailedSettings.stability], onValueChange: (value) => updateDetailedSetting('stability', value[0]), max: 100, min: 0, step: 1, className: "w-full" }), _jsx("div", { className: "text-xs text-foreground/60", children: "Voice consistency" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs font-medium", children: "Expression" }), _jsx(Slider, { value: [detailedSettings.styleExaggeration], onValueChange: (value) => updateDetailedSetting('styleExaggeration', value[0]), max: 100, min: 0, step: 1, className: "w-full" }), _jsx("div", { className: "text-xs text-foreground/60", children: "Emotional depth" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs font-medium", children: "Similarity" }), _jsx(Slider, { value: [detailedSettings.similarity], onValueChange: (value) => updateDetailedSetting('similarity', value[0]), max: 100, min: 0, step: 1, className: "w-full" }), _jsx("div", { className: "text-xs text-foreground/60", children: "Character fidelity" })] }), _jsxs("div", { className: "space-y-2 flex flex-col justify-center", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "text-xs font-medium", children: "Boost" }), _jsx(Switch, { checked: detailedSettings.speakerBoost, onCheckedChange: (checked) => updateDetailedSetting('speakerBoost', checked) })] }), _jsx("div", { className: "text-xs text-foreground/60", children: "Enhanced clarity" })] })] })] }))] })] })] }), error && (_jsxs(Alert, { className: "mt-8 border-red-500/50 bg-red-500/10", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-400" }), _jsx(AlertDescription, { className: "text-red-300 font-medium leading-relaxed", children: _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx("span", { children: error }), canRetry && (_jsx("div", { className: "pt-2", children: _jsxs(Button, { onClick: retryGeneration, variant: "outline", size: "sm", disabled: isLoading, className: "text-xs font-medium border-red-400/50 hover:bg-red-500/20", children: [_jsx(Zap, { className: "w-3 h-3 mr-1" }), "Retry (", 3 - retryCount, " attempts left)"] }) }))] }) })] })), _jsx(Card, { className: "mt-8 neo-card border-foreground/20 bg-background/30", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 text-sm font-medium text-foreground/80", children: [_jsx(Zap, { className: "w-4 h-4 text-neon-cyan-500" }), "Pro Tips for Better Results"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-foreground/60", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-neon-blue-500 rounded-full" }), _jsx("span", { children: "Use shorter text for faster generation" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-neon-purple-500 rounded-full" }), _jsx("span", { children: "Try different voices to find your perfect match" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-neon-green-500 rounded-full" }), _jsx("span", { children: "Press Ctrl + Enter for quick generation" })] })] })] }) }) })] })] }));
};
export default TextToSpeech;
