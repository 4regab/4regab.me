import { useState, useEffect } from "react";
import { Volume2, Download, Play, Pause, Settings, Loader2, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VoiceOption {
  name: string;
  description: string;
}

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
  { value: "gemini-2.5-pro-preview-tts", label: "Gemini 2.5 Pro Preview TTS" },
  { value: "gemini-2.5-flash-preview-tts", label: "Gemini 2.5 Flash Preview TTS" }
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
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash-preview-tts");
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [retryCount, setRetryCount] = useState(0);  // Store detected format for download filename
  const [detectedFormat, setDetectedFormat] = useState<string>('mp3');
  const [canRetry, setCanRetry] = useState(false);
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

  const generateSpeech = async () => {
    if (!inputText.trim()) {
      setError("Please enter text to convert to speech");
      return;
    }

    if (!apiKey.trim()) {
      setShowApiDialog(true);
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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: inputText
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: selectedVoice
                }
              }
            }
          }
        })
      });      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        
        if (response.status === 429) {
          errorMessage = "Rate limit exceeded. Please wait 24 hours or change your API key to continue. Consider using shorter text or switching to gemini-2.5-flash-preview-tts for better rate limits.";
        } else if (response.status === 401) {
          errorMessage = "Invalid API key. Please check your Gemini API key and try again.";
        } else if (response.status === 403) {
          errorMessage = "Access forbidden. Your API key may not have permission for TTS or may have exceeded quota.";
        } else if (response.status === 400) {
          const errorData = await response.json().catch(() => null);
          if (errorData?.error?.message) {
            errorMessage = `Bad request: ${errorData.error.message}`;
          } else {
            errorMessage = "Bad request. Please check your input text and selected model.";
          }
        } else if (response.status >= 500) {
          errorMessage = "Server error. Google's TTS service may be temporarily unavailable. Please try again later.";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
        const audioData = data.candidates[0].content.parts[0].inlineData?.data;        if (audioData) {
          // Convert base64 to blob and create URL - improved method
          try {
            const binaryString = atob(audioData);
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
        }      } else {
        throw new Error("Unexpected response format from API");
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
    } else {      setError("Maximum retry attempts reached. Please try again later with shorter text or a different model.");
      setCanRetry(false);
    }
  };  const playAudio = async () => {
    if (audioUrl && !isPlaying) {
      try {
        // Create audio element
        const audio = new Audio();
        setAudioElement(audio);
        
        // Set up event listeners before setting src
        audio.onended = () => {
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
    }
  };  const tryAlternativePlayback = async () => {
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
  };
  const pauseAudio = () => {
    if (audioElement && isPlaying) {
      try {
        audioElement.pause();
        setIsPlaying(false);
        // Don't set audioElement to null so we can resume
      } catch (pauseError) {
        console.error('Pause error:', pauseError);
        setIsPlaying(false);
        setAudioElement(null);
      }
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

  return (
    <Card className="neo-card neon-border animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Volume2 className="text-neon-purple" size={24} />
          Text to Speech
        </CardTitle>
        <CardDescription>
          Convert text to natural-sounding speech using Gemini AI with multiple voice options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="input-text" className="text-sm font-medium">
            Text to Convert
          </Label>
          <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="neon-border">
                <Settings size={16} className="mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="neo-card neon-border">              <DialogHeader>
                <DialogTitle className="font-display">TTS Configuration</DialogTitle>
                <DialogDescription>
                  Configure your Text-to-Speech settings
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); setShowApiDialog(false); }}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">Gemini API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="Enter your Gemini API key"
                    />
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
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      className="flex-1 bg-neon-purple/20 neon-border hover:bg-neon-purple/30"
                      disabled={!apiKey.trim()}                    >
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
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Model and Voice Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="model-select" className="text-sm font-medium mb-2 block">
              Model
            </Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="neon-border">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent className="neo-card neon-border">
                {MODEL_OPTIONS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="voice-select" className="text-sm font-medium mb-2 block">
              Voice
            </Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="neon-border">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent className="neo-card neon-border max-h-60">
                {VOICE_OPTIONS.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name} - {voice.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Textarea
          id="input-text"
          placeholder="Enter text to convert to speech..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          className="min-h-[120px] resize-none"
        />

        <div className="flex gap-2">
          <Button 
            onClick={generateSpeech} 
            disabled={isLoading || !inputText.trim()}
            className="bg-neon-purple/20 neon-border hover:bg-neon-purple/30 transition-all duration-300"
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            ) : (
              <Volume2 size={16} className="mr-2" />
            )}
            {isLoading ? "Generating..." : "Generate Speech"}
          </Button>
        </div>        {error && (
          <Alert className="border-red-500/50 bg-red-500/10">
            <AlertDescription className="text-red-400">
              {error}
              {canRetry && (
                <div className="mt-3">
                  <Button
                    onClick={retryGeneration}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Retry ({3 - retryCount} attempts left)
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {audioUrl && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Generated Audio</Label>
            <div className="neo-card neon-border-purple p-4 bg-neon-purple/5">
              <div className="flex items-center gap-3">                <Button
                  onClick={isPlaying ? pauseAudio : playAudio}
                  variant="outline"
                  size="sm"
                  className="neon-border-purple hover:bg-neon-purple/10"
                >
                  {isPlaying ? (
                    <Pause size={16} className="mr-2" />
                  ) : (
                    <Play size={16} className="mr-2" />
                  )}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                
                {audioElement && (
                  <Button
                    onClick={stopAudio}
                    variant="outline"
                    size="sm"
                    className="neon-border-red hover:bg-red-500/10"
                  >
                    <Square size={16} className="mr-2" />
                    Stop
                  </Button>
                )}
                
                <Button
                  onClick={downloadAudio}
                  variant="outline"
                  size="sm"
                  className="neon-border-green hover:bg-neon-green/10"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
                
                <span className="text-sm text-foreground/60">
                  Voice: {selectedVoice} ({VOICE_OPTIONS.find(v => v.name === selectedVoice)?.description})
                </span>
              </div>
            </div>
          </div>
        )}        <div className="text-xs text-foreground/60 text-center space-y-1">
          <div>Press Ctrl + Enter to generate speech quickly • Supports 24 languages</div>
          <div className="text-foreground/40">
            💡 Tip: Use shorter text for better success rates • Switch to Flash model if you hit rate limits
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextToSpeech;
