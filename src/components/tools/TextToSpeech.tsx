import { useState, useEffect } from "react";
import { Volume2, Download, Play, Pause, Loader2, RotateCcw, Square, MessageSquare, Sliders, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VoiceOption {
  name: string;
  description: string;
}

interface DetailedSettings {
  speed: number;              // 0.70 to 1.20, 0.95 is normal
  stability: number;          // 0% to 100%, 50% is normal
  similarity: number;         // 0% to 100%, 50% is normal (voice consistency)
  styleExaggeration: number;  // 0% to 100%, 50% is normal (expressiveness level)
  speakerBoost: boolean;      // true/false
}

const DEFAULT_DETAILED_SETTINGS: DetailedSettings = {
  speed: 0.95,       // Normal speed (0.70-1.20 range)
  stability: 50,     // 50% stability
  similarity: 50,    // 50% similarity
  styleExaggeration: 50, // 50% style exaggeration
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
    // New state for control modes and detailed settings
  const [controlMode, setControlMode] = useState<ControlMode>("prompt");
  const [detailedSettings, setDetailedSettings] = useState<DetailedSettings>(DEFAULT_DETAILED_SETTINGS);
  const [isVoiceControlCollapsed, setIsVoiceControlCollapsed] = useState(false);  // Helper functions for detailed settings
  const constructPromptFromSettings = (originalText: string): string => {
    if (controlMode === "prompt") {
      return originalText;
    }

    const instructions: string[] = [];
      // Speed mapping (0.70 to 1.20 range)
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
    if (detailedSettings.stability > 70) {
      instructions.push("with a very stable and consistent voice");
    } else if (detailedSettings.stability > 55) {
      instructions.push("with a stable voice");
    } else if (detailedSettings.stability < 30) {
      instructions.push("with natural voice variations and fluctuations");
    }

    // Similarity mapping (voice consistency)
    if (detailedSettings.similarity > 70) {
      instructions.push("maintaining perfect voice character consistency");
    } else if (detailedSettings.similarity > 55) {
      instructions.push("with consistent voice character");
    } else if (detailedSettings.similarity < 30) {
      instructions.push("with varied voice character and tone");
    }

    // Style Exaggeration mapping (expressiveness level)
    if (detailedSettings.styleExaggeration > 70) {
      instructions.push("with dramatic expression and high emotional intensity");
    } else if (detailedSettings.styleExaggeration > 55) {
      instructions.push("with enhanced expression and emotion");
    } else if (detailedSettings.styleExaggeration < 30) {
      instructions.push("in a subtle, understated style with minimal expression");
    } else if (detailedSettings.styleExaggeration < 45) {
      instructions.push("with moderate, natural expression");
    }

    // Speaker boost mapping
    if (detailedSettings.speakerBoost) {
      instructions.push("with enhanced volume and vocal presence");
    }

    if (instructions.length > 0) {
      const instructionText = instructions.join(", ");
      return `${instructionText}: ${originalText}`;
    }

    return originalText;
  };

  const resetDetailedSettings = () => {
    setDetailedSettings(DEFAULT_DETAILED_SETTINGS);
  };

  const updateDetailedSetting = <K extends keyof DetailedSettings>(
    key: K,
    value: DetailedSettings[K]
  ) => {
    setDetailedSettings(prev => ({
      ...prev,
      [key]: value
    }));  };
  const generateSpeech = async () => {
    if (!inputText.trim()) {
      setError("Please enter text to convert to speech");
      return;
    }

    if (!selectedVoice) {
      setError("Please select a voice");
      return;
    }

    setIsLoading(true);
    setError("");
    setAudioUrl(null);

    try {
      // Construct the final text based on control mode
      const finalText = constructPromptFromSettings(inputText);

      // Call our Vercel serverless function
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: finalText,
          model: selectedModel,
          voice: selectedVoice
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || `TTS Error: ${response.status} ${response.statusText}`;
        
        if (response.status === 429) {
          errorMessage = "Rate limit exceeded. Please wait a moment before trying again. Consider using shorter text.";
        } else if (response.status === 400) {
          errorMessage = errorData.message || "Bad request. Please check your input text and try again.";
        } else if (response.status >= 500) {
          errorMessage = "TTS service may be temporarily unavailable. Please try again later.";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success && data.audioData) {
        // Convert base64 to blob and create URL - improved method
        try {
          const binaryString = atob(data.audioData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // Enhanced format detection and audio processing for Gemini TTS
          let audioBlob;
          let detectedFormat = 'unknown';
          
          // Check format by examining the header bytes more thoroughly
          const header = bytes.slice(0, 32); // Get more header data
          const headerString = String.fromCharCode(...header);
          
          // Log extensive debug info
          console.log('Raw audio data analysis:', {
            totalSize: bytes.length,
            headerHex: Array.from(header.slice(0, 16)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '),
            headerAscii: headerString.replace(/[^\x20-\x7E]/g, '.'),
            firstBytes: Array.from(bytes.slice(0, 4)),
            last4Bytes: Array.from(bytes.slice(-4))
          });
          
          // Check if this is raw PCM audio data (common for TTS)
          let isProbablyPCM = false;
          
          // WAV detection (RIFF header)
          if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
              header[8] === 0x57 && header[9] === 0x41 && header[10] === 0x56 && header[11] === 0x45) {
            audioBlob = new Blob([bytes], { type: 'audio/wav' });
            detectedFormat = 'wav';
            setDetectedFormat('wav');
            console.log('Detected: WAV format');
          }
          // MP3 detection (ID3 tag or MP3 frame sync)
          else if ((header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33) || // ID3v2
                   (header[0] === 0xFF && (header[1] & 0xE0) === 0xE0)) { // MP3 frame sync
            audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
            detectedFormat = 'mp3';
            setDetectedFormat('mp3');
            console.log('Detected: MP3 format');
          }
          // OGG detection
          else if (header[0] === 0x4F && header[1] === 0x67 && header[2] === 0x67 && header[3] === 0x53) {
            audioBlob = new Blob([bytes], { type: 'audio/ogg' });
            detectedFormat = 'ogg';
            setDetectedFormat('ogg');
            console.log('Detected: OGG format');
          }
          // FLAC detection
          else if (header[0] === 0x66 && header[1] === 0x4C && header[2] === 0x61 && header[3] === 0x43) {
            audioBlob = new Blob([bytes], { type: 'audio/flac' });
            detectedFormat = 'flac';
            setDetectedFormat('flac');
            console.log('Detected: FLAC format');
          }
          // M4A/AAC detection
          else if (header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70) {
            audioBlob = new Blob([bytes], { type: 'audio/mp4' });
            detectedFormat = 'mp4';
            setDetectedFormat('m4a');
            console.log('Detected: M4A/AAC format');
          }
          // Check if it might be raw PCM data
          else {
            console.log('No known format detected, analyzing for PCM...');
            
            // Check if the data looks like raw PCM audio
            const sampleVariance = calculateVariance(bytes.slice(0, 1024));
            const isLikelyPCM = sampleVariance > 100 && sampleVariance < 50000;
            
            console.log('PCM analysis:', { sampleVariance, isLikelyPCM });
            
            if (isLikelyPCM) {
              console.log('Data appears to be raw PCM, converting to WAV...');
              // Convert raw PCM to WAV format
              const wavBytes = createWAVFromPCM(bytes);
              audioBlob = new Blob([wavBytes], { type: 'audio/wav' });
              detectedFormat = 'wav';
              setDetectedFormat('wav');
              isProbablyPCM = true;
            } else {
              // Default: Try as MP3 first, then WAV
              console.log('Unknown format, defaulting to MP3...');
              audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
              detectedFormat = 'mp3';
              setDetectedFormat('mp3');
            }
          }
          
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          
          // Log audio info for debugging
          console.log('Audio blob created:', {
            size: audioBlob.size,
            type: audioBlob.type,
            detectedFormat: detectedFormat,
            headerSample: Array.from(header.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')
          });
          
        } catch (audioError) {
          console.error('Audio blob creation error:', audioError);
          throw new Error("Failed to process audio data");
        }
      } else {
        throw new Error("No audio data received from API");
      }
      
      // Reset retry count on success
      setRetryCount(0);
      setCanRetry(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during speech generation";
      setError(errorMessage);
      
      // Enable retry for rate limit and server errors
      if (errorMessage.includes("Rate limit") || errorMessage.includes("Server error") || errorMessage.includes("temporarily unavailable")) {
        setCanRetry(true);
      } else {
        setCanRetry(false);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const retryGeneration = async () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      // Add a small delay before retry
      await new Promise(resolve => setTimeout(resolve, 2000 + (retryCount * 1000)));
      generateSpeech();
    } else {
      setError("Maximum retry attempts reached. Please try again later with shorter text or a different model.");
      setCanRetry(false);
    }
  };const playAudio = async () => {
    if (!audioUrl) return;
    
    try {
      // If we have an existing audio element that's paused, resume it
      if (audioElement && audioElement.paused && !audioElement.ended) {
        console.log('Resuming paused audio');
        setIsPlaying(true);
        await audioElement.play();
        return;
      }
      
      // If audio element exists but is not paused, don't create a new one
      if (audioElement && !audioElement.paused) {
        console.log('Audio is already playing');
        return;
      }
      
      // Create new audio element only if we don't have one or it's ended
      console.log('Creating new audio element');
      const audio = new Audio();
      setAudioElement(audio);
      
      // Set up event listeners before setting src
      audio.onended = () => {
        console.log('Audio ended');
        setIsPlaying(false);
        setAudioElement(null);
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        setAudioElement(null);
        
        // Try alternative approaches
        tryAlternativePlayback();
      };

      audio.oncanplaythrough = () => {
        console.log('Audio can play through');
      };

      audio.onloadstart = () => {
        console.log('Audio load started');
      };

      audio.onloadeddata = () => {
        console.log('Audio data loaded');
      };
      
      // Set source and load
      audio.src = audioUrl;
      audio.load();
      
      // Play the audio and handle promise
      setIsPlaying(true);
      await audio.play();
      
    } catch (playError) {
      console.error('Play error:', playError);
      setIsPlaying(false);
      setAudioElement(null);
      
      // Try alternative playback method
      tryAlternativePlayback();
    }
  };const tryAlternativePlayback = async () => {
    if (!audioUrl) return;
    
    try {
      // Fetch the blob and try to recreate it with different MIME type
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Log detailed analysis of the audio data
      console.log('Alternative playback - analyzing audio data:', {
        size: uint8Array.length,
        firstBytes: Array.from(uint8Array.slice(0, 16)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '),
        variance: calculateVariance(uint8Array.slice(0, Math.min(1024, uint8Array.length)))
      });
      
      // Try different MIME types in order of likelihood for Gemini TTS
      const mimeTypes = [
        'audio/mpeg',     // MP3 - most common for TTS
        'audio/mp4',      // M4A/AAC 
        'audio/wav',      // WAV
        'audio/ogg',      // OGG Vorbis
        'audio/webm',     // WebM
        'audio/aac',      // Raw AAC
        'audio/flac',     // FLAC
        'audio/x-wav',    // Alternative WAV MIME
        'audio/vnd.wav',  // Another WAV variant
        'audio/wave'      // Yet another WAV variant
      ];
      
      console.log('Trying alternative MIME types for audio playback...');
      
      for (let i = 0; i < mimeTypes.length; i++) {
        const mimeType = mimeTypes[i];
        try {
          console.log(`Attempting MIME type ${i + 1}/${mimeTypes.length}: ${mimeType}`);
          
          let blobData = uint8Array;
          
          // If the data looks like it might be raw PCM and we're trying WAV, convert it
          if (mimeType.includes('wav')) {
            const variance = calculateVariance(uint8Array.slice(0, Math.min(1024, uint8Array.length)));
            if (variance > 100 && variance < 50000 && !uint8Array.slice(0, 4).every((b, i) => b === [0x52, 0x49, 0x46, 0x46][i])) {
              console.log('Converting potential PCM data to WAV format');
              blobData = createWAVFromPCM(uint8Array);
            }
          }
          
          const blob = new Blob([blobData], { type: mimeType });
          const url = URL.createObjectURL(blob);
          
          const audio = new Audio(url);
          
          // Test if this MIME type can load the audio
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Load timeout')), 5000);
            
            audio.oncanplaythrough = () => {
              clearTimeout(timeout);
              resolve(true);
            };
            
            audio.onerror = (e) => {
              clearTimeout(timeout);
              reject(e);
            };
            
            audio.onloadstart = () => {
              console.log(`Loading started for ${mimeType}`);
            };
            
            audio.load();
          });
          
          // If we get here, this MIME type works
          console.log(`Success! Audio can be played with MIME type: ${mimeType}`);
          
          // Clean up old URL
          if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
          }
          
          setAudioUrl(url);
          setAudioElement(audio);
          setIsPlaying(true);
          
          // Update detected format for download
          const formatMap: { [key: string]: string } = {
            'audio/mpeg': 'mp3',
            'audio/mp4': 'mp4',
            'audio/wav': 'wav',
            'audio/ogg': 'ogg',
            'audio/webm': 'webm',
            'audio/aac': 'aac',
            'audio/flac': 'flac'
          };
          
          setDetectedFormat(formatMap[mimeType] || 'bin');
          
          audio.onended = () => {
            setIsPlaying(false);
            setAudioElement(null);
          };
          
          audio.onerror = () => {
            setIsPlaying(false);
            setAudioElement(null);
            setError("Audio playback failed. Please try downloading the file.");
          };
          
          await audio.play();
          return; // Success!
          
        } catch (err) {
          console.log(`Failed with ${mimeType}:`, err);
          // Try next MIME type
          continue;
        }
      }
      
      // If all MIME types failed, try Web Audio API
      console.log('All MIME types failed. Trying Web Audio API as final fallback...');
      await playWithWebAudio();
      
    } catch (err) {
      console.error('Alternative playback failed:', err);
      setError("Unable to play audio with any method. The audio format may not be supported by your browser. Please try downloading the file.");
    }
  };  const pauseAudio = () => {
    if (audioElement) {
      try {
        console.log('Pause audio called - current state:', {
          paused: audioElement.paused,
          ended: audioElement.ended,
          currentTime: audioElement.currentTime,
          isPlaying: isPlaying
        });
        
        // Only pause if audio is currently playing and not already paused
        if (!audioElement.paused && !audioElement.ended) {
          audioElement.pause();
          setIsPlaying(false);
          console.log('Audio paused successfully');
        } else {
          // Audio is already paused, just sync our state
          console.log('Audio already paused, syncing state');
          setIsPlaying(false);
        }
        
        // Keep the audioElement reference so we can resume later
        // Don't set it to null like before
        
      } catch (pauseError) {
        console.error('Pause error:', pauseError);
        setIsPlaying(false);
        // Only set to null if there's an actual error
        setAudioElement(null);
      }
    } else {
      // No audio element but somehow playing state is true
      console.log('No audio element found, resetting playing state');
      setIsPlaying(false);
    }
  };
  const stopAudio = () => {
    if (audioElement) {
      try {
        audioElement.pause();
        audioElement.currentTime = 0;
        setIsPlaying(false);
        setAudioElement(null);
      } catch (stopError) {
        console.error('Stop error:', stopError);
        setIsPlaying(false);
        setAudioElement(null);
      }
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
  }, [audioUrl]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
    };
  }, [audioElement]);  const playWithWebAudio = async () => {
    if (!audioUrl) return;
    
    try {
      console.log('Attempting Web Audio API playback...');
      
      // Use Web Audio API as fallback
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported');
      }
      
      const audioContext = new AudioContextClass();
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      console.log('Decoding audio data with Web Audio API...', {
        bufferSize: arrayBuffer.byteLength,
        sampleRate: audioContext.sampleRate
      });
      
      // Decode audio data with better error handling
      let audioBuffer;
      try {
        // Make a copy to avoid ArrayBuffer detachment issues
        const bufferCopy = arrayBuffer.slice(0);
        audioBuffer = await audioContext.decodeAudioData(bufferCopy);
      } catch (decodeError) {
        console.error('First decode attempt failed:', decodeError);
        
        // Try with the original buffer in case the copy caused issues
        try {
          if (!arrayBuffer.byteLength) {
            throw new Error('ArrayBuffer is detached or empty');
          }
          
          // Create a fresh copy from the fetch response
          const response2 = await fetch(audioUrl);
          const freshBuffer = await response2.arrayBuffer();
          audioBuffer = await audioContext.decodeAudioData(freshBuffer);
        } catch (secondDecodeError) {
          console.error('Second decode attempt failed:', secondDecodeError);
          throw new Error(`Unable to decode audio data: ${decodeError.message}`);
        }
      }
      
      // Create source and connect to destination
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      setIsPlaying(true);
      
      source.onended = () => {
        console.log('Web Audio playback ended');
        setIsPlaying(false);
        setAudioElement(null);
        audioContext.close();
      };
      
      // Store reference for stopping
      setAudioElement(source as any);
      
      // Start playback
      source.start(0);
      console.log('Web Audio playback started successfully');
      
    } catch (webAudioError) {
      console.error('Web Audio API failed:', webAudioError);
      
      // Provide more specific error messages
      let errorMessage = "Unable to play audio with any available method. ";
      
      if (webAudioError.name === 'EncodingError' || webAudioError.message.includes('decode')) {
        errorMessage += "The audio format is not supported by your browser. ";
      } else if (webAudioError.message.includes('not supported')) {
        errorMessage += "Your browser doesn't support the required audio features. ";
      } else if (webAudioError.message.includes('detached')) {
        errorMessage += "Audio data processing error occurred. ";
      } else {
        errorMessage += "An unknown audio error occurred. ";
      }
      
      errorMessage += "Please try downloading the file and playing it with an external media player.";
      
      setError(errorMessage);
    }
  };
  // Utility function to sync state with actual audio element state
  const syncAudioState = () => {
    if (audioElement) {
      const actuallyPlaying = !audioElement.paused && !audioElement.ended;
      console.log('Syncing audio state:', {
        actuallyPlaying,
        currentIsPlaying: isPlaying,
        paused: audioElement.paused,
        ended: audioElement.ended,
        currentTime: audioElement.currentTime,
        duration: audioElement.duration
      });
      
      if (actuallyPlaying !== isPlaying) {
        console.log(`State mismatch detected. Setting isPlaying to ${actuallyPlaying}`);
        setIsPlaying(actuallyPlaying);
      }
      
      // If audio has ended, clean up
      if (audioElement.ended && (isPlaying || audioElement)) {
        console.log('Audio ended, cleaning up');
        setIsPlaying(false);
        setAudioElement(null);
      }
    } else if (isPlaying) {
      // No audio element but state says we're playing - this shouldn't happen
      console.log('No audio element but state shows playing, fixing state');
      setIsPlaying(false);
    }
  };

  // Effect to sync audio state periodically and handle edge cases
  useEffect(() => {
    if (!audioElement) return;
    
    const interval = setInterval(() => {
      syncAudioState();
    }, 500); // Check every 500ms (reduced from 100ms for better performance)

    // Also add event listeners for immediate state changes
    const handlePlay = () => {
      console.log('Audio play event');
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log('Audio pause event');
      setIsPlaying(false);
    };
    
    const handleEnded = () => {
      console.log('Audio ended event');
      setIsPlaying(false);
      setAudioElement(null);
    };
    
    if (audioElement) {
      audioElement.addEventListener('play', handlePlay);
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('ended', handleEnded);
    }

    return () => {
      clearInterval(interval);
      if (audioElement) {
        audioElement.removeEventListener('play', handlePlay);
        audioElement.removeEventListener('pause', handlePause);
        audioElement.removeEventListener('ended', handleEnded);
      }
    };
  }, [audioElement]);  return (
    <Card className="neo-card neon-border animate-slide-up">
      <CardHeader className="pb-8 border-b border-foreground/10">
        <CardTitle className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight">
          <Volume2 className="text-neon-purple" size={32} />
          <span className="text-foreground">Text to Speech</span>
        </CardTitle>
        <CardDescription className="text-lg text-foreground/80 leading-relaxed mt-3 max-w-3xl">
          Convert text to natural-sounding speech using Gemini AI with multiple voice options and fine-grained controls
        </CardDescription>
      </CardHeader>      <CardContent className="space-y-8 pt-6">
        <div className="flex justify-between items-start">
          <div>
            <Label htmlFor="input-text" className="text-lg font-semibold text-foreground block mb-2">
              Text to Convert
            </Label>
            <p className="text-sm text-foreground/60">              Enter the text you want to convert to speech
            </p>
          </div>
        </div>{/* Model and Voice Selection */}
        <div className="space-y-6 border border-foreground/10 rounded-lg p-6 bg-background/50">
          <div className="border-b border-foreground/10 pb-3">
            <h3 className="text-xl font-bold text-foreground tracking-tight">
              Model & Voice Configuration
            </h3>
            <p className="text-sm text-foreground/70 mt-1">
              Select your preferred AI model and voice character
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="model-select" className="text-sm font-semibold text-foreground block mb-2">
                  AI Model
                </Label>
                <p className="text-xs text-foreground/60 mb-3">
                  Choose the AI model for speech generation
                </p>
              </div>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="neon-border h-12 text-sm font-medium">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent className="neo-card neon-border">
                  {MODEL_OPTIONS.map((model) => (
                    <SelectItem key={model.value} value={model.value} className="text-sm py-4">
                      <div className="font-medium">{model.label}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>            <div className="space-y-4">
              <div>
                <Label htmlFor="voice-select" className="text-sm font-semibold text-foreground block mb-2">
                  Voice Character
                </Label>
                <p className="text-xs text-foreground/60 mb-3">
                  Pick a voice that matches your content style
                </p>
              </div>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="neon-border h-12 text-sm font-medium">
                  <SelectValue placeholder="Select voice character" />
                </SelectTrigger>
                <SelectContent className="neo-card neon-border max-h-60">
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name} className="text-sm py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{voice.name}</span>
                        <span className="text-xs text-foreground/70">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>        {/* Control Mode Tabs */}
        <div className="space-y-6 border border-foreground/10 rounded-lg p-6 bg-background/50">
          <div className="border-b border-foreground/10 pb-3">
            <button
              onClick={() => setIsVoiceControlCollapsed(!isVoiceControlCollapsed)}
              className="flex items-center justify-between w-full text-left group hover:text-foreground/90 transition-colors"
            >
              <div>
                <h3 className="text-xl font-bold text-foreground tracking-tight">
                  Voice Control Settings
                </h3>
                <p className="text-sm text-foreground/70 mt-1">
                  Choose how you want to control the voice characteristics
                </p>
              </div>
              {isVoiceControlCollapsed ? (
                <ChevronDown className="w-5 h-5 text-foreground/70 group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronUp className="w-5 h-5 text-foreground/70 group-hover:text-foreground transition-colors" />
              )}
            </button>
          </div>
          {!isVoiceControlCollapsed && (
            <Tabs value={controlMode} onValueChange={(value) => setControlMode(value as ControlMode)}>
              <TabsList className="grid w-full grid-cols-2 neon-border h-12">
                <TabsTrigger value="prompt" className="flex items-center gap-2 font-medium">
                  <MessageSquare size={16} />
                  Prompt-Based Control
                </TabsTrigger>
                <TabsTrigger value="detailed" className="flex items-center gap-2 font-medium">
                  <Sliders size={16} />
                  Detailed Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="prompt" className="space-y-4 mt-6">
                <div className="neo-card neon-border-blue p-6 bg-neon-blue/5">
                  <div className="text-sm text-foreground/90 leading-relaxed">
                    <strong className="text-foreground font-semibold">Prompt-Based Control:</strong> Control the voice style, tone, accent, and pace using prompts.
                    <br />
                    <span className="text-xs text-foreground/70 mt-2 block">
                      <strong>Example:</strong> "Speak slowly and clearly: Welcome to our service."
                    </span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="detailed" className="space-y-6 mt-6">
                <div className="neo-card neon-border-purple p-6 bg-neon-purple/5 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-base font-semibold text-foreground">Voice Settings</span>
                      <p className="text-xs text-foreground/70 mt-1">
                        Fine-tune voice characteristics with precise controls
                      </p>
                    </div>
                    <Button
                      onClick={resetDetailedSettings}
                      variant="outline"
                      size="sm"
                      className="text-xs neon-border font-medium"
                    >
                      <RotateCcw size={12} className="mr-1" />
                      Reset
                    </Button>
                  </div>
                    {/* Speed Control */}
                  <div className="space-y-3 p-4 border border-foreground/10 rounded-lg bg-background/30">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold text-foreground">Speed</Label>
                      <span className="text-xs text-foreground/70 font-medium bg-foreground/10 px-2 py-1 rounded">
                        {detailedSettings.speed < 0.85 ? 'Very Slow' :
                         detailedSettings.speed < 0.92 ? 'Slow' :
                         detailedSettings.speed > 1.10 ? 'Very Fast' :
                         detailedSettings.speed > 1.02 ? 'Fast' : 'Normal'} ({detailedSettings.speed.toFixed(2)})
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
                      Controls how fast or slow the speech is delivered
                    </p>
                  </div>

                  {/* Stability Control */}
                  <div className="space-y-3 p-4 border border-foreground/10 rounded-lg bg-background/30">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold text-foreground">Stability</Label>
                      <span className="text-xs text-foreground/70 font-medium bg-foreground/10 px-2 py-1 rounded">
                        {detailedSettings.stability > 70 ? 'Very Stable' :
                         detailedSettings.stability > 55 ? 'Stable' :
                         detailedSettings.stability < 30 ? 'Variable' : 'Normal'} ({detailedSettings.stability}%)
                      </span>
                    </div>
                    <Slider
                      value={[detailedSettings.stability]}
                      onValueChange={(value) => updateDetailedSetting('stability', value[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="neon-border"
                    />
                    <p className="text-xs text-foreground/60">
                      Higher values create more consistent voice output
                    </p>
                  </div>

                  {/* Similarity Control */}
                  <div className="space-y-3 p-4 border border-foreground/10 rounded-lg bg-background/30">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold text-foreground">Similarity</Label>
                      <span className="text-xs text-foreground/70 font-medium bg-foreground/10 px-2 py-1 rounded">
                        {detailedSettings.similarity > 70 ? 'Consistent' :
                         detailedSettings.similarity > 55 ? 'Stable' :
                         detailedSettings.similarity < 30 ? 'Varied' : 'Normal'} ({detailedSettings.similarity}%)
                      </span>
                    </div>
                    <Slider
                      value={[detailedSettings.similarity]}
                      onValueChange={(value) => updateDetailedSetting('similarity', value[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="neon-border"
                    />
                    <p className="text-xs text-foreground/60">
                      Controls how closely the voice follows the original character
                    </p>
                  </div>

                  {/* Style Exaggeration Control */}
                  <div className="space-y-3 p-4 border border-foreground/10 rounded-lg bg-background/30">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-semibold text-foreground">Style Exaggeration</Label>
                      <span className="text-xs text-foreground/70 font-medium bg-foreground/10 px-2 py-1 rounded">
                        {detailedSettings.styleExaggeration > 70 ? 'Dramatic' :
                         detailedSettings.styleExaggeration > 55 ? 'Enhanced' :
                         detailedSettings.styleExaggeration < 30 ? 'Subtle' :
                         detailedSettings.styleExaggeration < 45 ? 'Moderate' : 'Normal'} ({detailedSettings.styleExaggeration}%)
                      </span>
                    </div>
                    <Slider
                      value={[detailedSettings.styleExaggeration]}
                      onValueChange={(value) => updateDetailedSetting('styleExaggeration', value[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="neon-border"
                    />
                    <p className="text-xs text-foreground/60">
                      Adjusts the emotional expressiveness and emphasis in speech
                    </p>
                  </div>

                  {/* Speaker Boost Toggle */}
                  <div className="flex items-center justify-between p-4 border border-foreground/10 rounded-lg bg-background/30">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold text-foreground">Speaker Boost</Label>
                      <p className="text-xs text-foreground/60">
                        Enhance volume and vocal presence for clearer audio
                      </p>
                    </div>
                    <Switch
                      checked={detailedSettings.speakerBoost}
                      onCheckedChange={(checked) => updateDetailedSetting('speakerBoost', checked)}
                    />
                  </div>

                  {/* Settings Preview */}
                  <div className="text-xs text-foreground/70 p-4 bg-background/50 rounded-lg border border-foreground/10">
                    <strong className="text-foreground font-semibold">Generated instructions:</strong> 
                    <span className="text-foreground/80 ml-2">
                      {constructPromptFromSettings("your text").replace("your text", "").replace(/:\s*$/, "") || "No modifications applied"}
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>{/* Text Input Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="input-text" className="text-lg font-semibold text-foreground block mb-2">
              Text Input
            </Label>
            <p className="text-sm text-foreground/70 mb-4">
              Enter or paste the text you want to convert to speech
            </p>
          </div>
          <Textarea
            id="input-text"
            placeholder="Enter text to convert to speech..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[140px] resize-none text-sm leading-relaxed neon-border font-medium"
          />
        </div>        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={generateSpeech} 
            disabled={isLoading || !inputText.trim()}
            className="bg-neon-purple/20 neon-border hover:bg-neon-purple/30 transition-all duration-300 h-12 px-6 font-semibold text-white"
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-5 h-5 mr-2 text-white" />
            ) : (
              <Volume2 size={18} className="mr-2 text-white" />
            )}
            {isLoading ? "Generating..." : "Generate Speech"}
          </Button>
        </div>{/* Error Display */}
        {error && (
          <Alert className="border-red-500/50 bg-red-500/10 p-4">
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

        {/* Audio Output Section */}
        {audioUrl && (
          <div className="space-y-4 border border-foreground/10 rounded-lg p-6 bg-background/50">
            <div className="border-b border-foreground/10 pb-3">
              <Label className="text-lg font-semibold text-foreground">Generated Audio</Label>
              <p className="text-sm text-foreground/70 mt-1">
                Your text has been converted to speech successfully
              </p>
            </div>
            <div className="neo-card neon-border-purple p-5 bg-neon-purple/5">
              <div className="flex items-center gap-4 flex-wrap">                <Button
                  onClick={isPlaying ? pauseAudio : playAudio}
                  variant="outline"
                  size="sm"
                  className="neon-border-purple hover:bg-neon-purple/10 h-11 px-4 font-medium"
                  disabled={!audioUrl}
                >
                  {isPlaying ? (
                    <Pause size={18} className="mr-2" />
                  ) : (
                    <Play size={18} className="mr-2" />
                  )}
                  {isPlaying ? "Pause" : audioElement && audioElement.paused ? "Resume" : "Play"}
                </Button>
                
                {audioElement && (
                  <Button
                    onClick={stopAudio}
                    variant="outline"
                    size="sm"
                    className="neon-border-red hover:bg-red-500/10 h-11 px-4 font-medium"
                  >
                    <Square size={18} className="mr-2" />
                    Stop
                  </Button>
                )}
                
                <Button
                  onClick={downloadAudio}
                  variant="outline"
                  size="sm"
                  className="neon-border-green hover:bg-neon-green/10 h-11 px-4 font-medium"
                >
                  <Download size={18} className="mr-2" />
                  Download
                </Button>
                
                <div className="text-sm text-foreground/70 bg-foreground/10 px-3 py-2 rounded-lg">
                  <span className="font-medium">Voice:</span> {selectedVoice} 
                  <span className="text-foreground/60 ml-1">
                    ({VOICE_OPTIONS.find(v => v.name === selectedVoice)?.description})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}        {/* Usage Tips */}
        <div className="text-center space-y-3 p-4 bg-background/30 rounded-lg border border-foreground/10">
          <div className="text-sm text-foreground/80 font-medium">
            Press <kbd className="px-2 py-1 bg-foreground/10 rounded text-xs font-semibold">Ctrl + Enter</kbd> to generate speech quickly • Supports 24 languages
          </div>
          <div className="text-xs text-foreground/60 leading-relaxed">
            💡 <strong>Pro Tips:</strong> Use shorter text for better success rates • Try different voices to find your perfect match
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextToSpeech;
