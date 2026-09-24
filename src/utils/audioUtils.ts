// Utility for browser audio recording, simulated fallback, and speech synthesis

export interface SpeechRecognitionResultState {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
}

// Convert raw 16-bit mono PCM (e.g. from Gemini TTS) to a playable standard WAV Blob URL
export function createWavUrlFromPcm(
  pcmBase64: string,
  sampleRate = 24000,
  numChannels = 1,
  bitDepth = 16
): string | null {
  try {
    if (!pcmBase64 || typeof pcmBase64 !== 'string') return null;
    const binaryString = atob(pcmBase64);
    const len = binaryString.length;
    if (len === 0) return null;

    const buffer = new ArrayBuffer(44 + len);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // RIFF chunk descriptor
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + len, true);
    writeString(8, 'WAVE');

    // fmt sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // ByteRate
    view.setUint16(32, numChannels * (bitDepth / 8), true); // BlockAlign
    view.setUint16(34, bitDepth, true); // BitsPerSample

    // data sub-chunk
    writeString(36, 'data');
    view.setUint32(40, len, true);

    // Write PCM samples
    const pcmBytes = new Uint8Array(buffer, 44, len);
    for (let i = 0; i < len; i++) {
      pcmBytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('Could not construct WAV from PCM data:', err);
    return null;
  }
}

export interface RecordingResult {
  blob: Blob | null;
  audioUrl: string | null;
  base64: string;
  mimeType: string;
  isSimulated: boolean;
  sizeBytes: number;
  durationMs: number;
  chunkCount: number;
  error?: string;
}

export interface TranscriptionResult {
  transcript: string;
  error?: string;
}

export interface MediaRecorderSupportStatus {
  supported: boolean;
  reason?: string;
  mimeType?: string;
  isSecure: boolean;
  hasGetUserMedia: boolean;
  hasMediaRecorder: boolean;
}

// Check browser support for MediaRecorder, getUserMedia, and secure context
export function checkMediaRecorderSupport(): MediaRecorderSupportStatus {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      reason: 'Non-browser environment',
      isSecure: false,
      hasGetUserMedia: false,
      hasMediaRecorder: false,
    };
  }

  const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const hasGetUserMedia = !!(navigator?.mediaDevices?.getUserMedia);
  const hasMediaRecorder = typeof MediaRecorder !== 'undefined';

  if (!isSecure) {
    return {
      supported: false,
      reason: 'Microphone recording requires a secure origin (HTTPS or localhost).',
      isSecure,
      hasGetUserMedia,
      hasMediaRecorder,
    };
  }

  if (!hasGetUserMedia) {
    return {
      supported: false,
      reason: 'Your browser does not support navigator.mediaDevices.getUserMedia.',
      isSecure,
      hasGetUserMedia,
      hasMediaRecorder,
    };
  }

  if (!hasMediaRecorder) {
    return {
      supported: false,
      reason: 'Your browser does not support the MediaRecorder audio API.',
      isSecure,
      hasGetUserMedia,
      hasMediaRecorder,
    };
  }

  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/aac',
    'audio/wav',
  ];

  let chosenMime: string | undefined;
  for (const candidate of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(candidate)) {
        chosenMime = candidate;
        break;
      }
    } catch {
      // ignore
    }
  }

  return {
    supported: true,
    mimeType: chosenMime || 'audio/webm',
    isSecure,
    hasGetUserMedia,
    hasMediaRecorder,
  };
}

export class AudioRecorderController {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  private simulationIntervalId: any = null;
  private startTime: number = 0;
  private selectedMimeType: string = 'audio/webm';
  private onInterruptionCallback: ((reason: string) => void) | null = null;

  public isSimulated = false;
  public permissionDismissed = false;
  public lastError: string | null = null;

  setInterruptionHandler(handler: (reason: string) => void) {
    this.onInterruptionCallback = handler;
  }

  getBufferedChunkCount(): number {
    return this.audioChunks.length;
  }

  getBufferedSizeBytes(): number {
    return this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0);
  }

  // Safely close audio tracks and audio context
  cleanupStream() {
    if (this.simulationIntervalId) {
      clearInterval(this.simulationIntervalId);
      this.simulationIntervalId = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close().catch(() => {});
      } catch (e) {}
      this.audioContext = null;
    }

    if (this.audioStream) {
      try {
        this.audioStream.getTracks().forEach((track) => {
          track.onended = null;
          track.stop();
        });
      } catch (e) {}
      this.audioStream = null;
    }
  }

  // Cancel recording and abort active buffers immediately
  abortRecording() {
    this.cleanupStream();
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.ondataavailable = null;
        this.mediaRecorder.onerror = null;
        this.mediaRecorder.onstop = null;
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    this.audioChunks = [];
    this.mediaRecorder = null;
  }

  async startRecording(onAudioLevel?: (level: number) => void): Promise<boolean> {
    this.audioChunks = [];
    this.isSimulated = false;
    this.permissionDismissed = false;
    this.lastError = null;
    this.startTime = Date.now();

    // Check if getUserMedia is supported
    if (!navigator?.mediaDevices?.getUserMedia) {
      this.lastError = 'Browser does not support microphone audio capture (navigator.mediaDevices.getUserMedia missing).';
      console.warn(this.lastError);
      this.startSimulatedLevels(onAudioLevel);
      return true;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.audioStream = stream;

      // Monitor hardware track interruption (e.g. unplugged microphone, bluetooth disconnect, permission revoked)
      stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          console.warn('Audio input track ended unexpectedly.');
          if (this.onInterruptionCallback) {
            this.onInterruptionCallback('Microphone input device was disconnected or interrupted.');
          }
        };
      });

      // Setup audio analyzer for visualizer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 64;
          source.connect(this.analyser);

          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
          const checkLevel = () => {
            if (this.analyser && onAudioLevel) {
              this.analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              onAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
            }
            this.animationFrameId = requestAnimationFrame(checkLevel);
          };
          checkLevel();
        }
      } catch (err) {
        console.warn('AudioContext visualization not available:', err);
      }

      // Determine best supported MIME type
      const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac',
        'audio/wav',
      ];

      let chosenMime = '';
      if (typeof MediaRecorder !== 'undefined') {
        for (const candidate of candidates) {
          if (MediaRecorder.isTypeSupported(candidate)) {
            chosenMime = candidate;
            break;
          }
        }
        this.selectedMimeType = chosenMime || 'audio/webm';

        this.mediaRecorder = chosenMime
          ? new MediaRecorder(stream, { mimeType: chosenMime })
          : new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onerror = (evt: any) => {
          const errDetail = evt?.error?.message || evt?.error?.name || 'MediaRecorder capture error';
          console.warn('MediaRecorder error event:', errDetail);
          if (this.onInterruptionCallback) {
            this.onInterruptionCallback(`Audio recording error: ${errDetail}`);
          }
        };

        // Collect in 250ms chunks to keep continuous streaming buffer
        this.mediaRecorder.start(250);
        return true;
      } else {
        // MediaRecorder not available, activate simulation
        this.lastError = 'MediaRecorder API is not supported in this browser.';
        this.startSimulatedLevels(onAudioLevel);
        return true;
      }
    } catch (error: any) {
      const errMsg = String(error?.message || error?.name || error);
      this.permissionDismissed = true;
      this.lastError =
        error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser settings to record audio.'
          : error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError'
          ? 'No microphone input device was found on this system.'
          : `Microphone unavailable (${errMsg}). Switched to rehearsal mode.`;

      console.warn('Microphone notice:', this.lastError);
      this.startSimulatedLevels(onAudioLevel);
      return true;
    }
  }

  private startSimulatedLevels(onAudioLevel?: (level: number) => void) {
    this.isSimulated = true;
    if (!onAudioLevel) return;

    let step = 0;
    this.simulationIntervalId = setInterval(() => {
      step++;
      const base = 40 + Math.sin(step * 0.4) * 25;
      const noise = (Math.random() - 0.5) * 15;
      const level = Math.max(10, Math.min(85, Math.round(base + noise)));
      onAudioLevel(level);
    }, 120);
  }

  stopRecording(): Promise<RecordingResult> {
    return new Promise((resolve) => {
      const durationMs = this.startTime > 0 ? Date.now() - this.startTime : 0;

      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanupStream();
        resolve({
          blob: null,
          audioUrl: null,
          base64: '',
          mimeType: this.selectedMimeType,
          isSimulated: this.isSimulated,
          sizeBytes: 0,
          durationMs,
          chunkCount: 0,
          error: this.isSimulated
            ? (this.lastError || 'Mic unavailable; simulated audio pattern.')
            : 'Audio recorder was not active.',
        });
        return;
      }

      let resolved = false;
      const handleCompletion = (mimeTypeOverride?: string) => {
        if (resolved) return;
        resolved = true;
        this.cleanupStream();

        const effectiveMime =
          mimeTypeOverride || this.mediaRecorder?.mimeType || this.selectedMimeType || 'audio/webm';
        const totalBytes = this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0);
        const chunkCount = this.audioChunks.length;

        if (totalBytes > 250 && chunkCount > 0) {
          try {
            const blob = new Blob(this.audioChunks, { type: effectiveMime });
            const audioUrl = URL.createObjectURL(blob);

            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = (reader.result as string)?.split(',')[1] || '';
              resolve({
                blob,
                audioUrl,
                base64: base64data,
                mimeType: effectiveMime,
                isSimulated: false,
                sizeBytes: totalBytes,
                durationMs,
                chunkCount,
              });
            };
            reader.onerror = () => {
              resolve({
                blob,
                audioUrl,
                base64: '',
                mimeType: effectiveMime,
                isSimulated: false,
                sizeBytes: totalBytes,
                durationMs,
                chunkCount,
                error: 'Failed to convert audio stream to base64.',
              });
            };
            reader.readAsDataURL(blob);
          } catch (e: any) {
            resolve({
              blob: null,
              audioUrl: null,
              base64: '',
              mimeType: effectiveMime,
              isSimulated: false,
              sizeBytes: totalBytes,
              durationMs,
              chunkCount,
              error: e.message || 'Error packaging audio buffer.',
            });
          }
        } else {
          resolve({
            blob: null,
            audioUrl: null,
            base64: '',
            mimeType: effectiveMime,
            isSimulated: this.isSimulated,
            sizeBytes: totalBytes,
            durationMs,
            chunkCount,
            error:
              totalBytes === 0
                ? 'No audio data was captured.'
                : 'Captured audio stream was too quiet or short.',
          });
        }
      };

      this.mediaRecorder.onstop = () => {
        handleCompletion();
      };

      this.mediaRecorder.onerror = (evt: any) => {
        console.warn('MediaRecorder error event during stop:', evt);
        handleCompletion();
      };

      // Force any in-flight audio data to be flushed to ondataavailable before stopping
      try {
        if (this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.requestData();
        }
      } catch (e) {
        // requestData may fail if recorder is already halting
      }

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        console.warn('Error during mediaRecorder.stop():', err);
        handleCompletion();
      }

      // Safety fallback: if onstop does not fire within 2.5 seconds, finalize collected chunks
      setTimeout(() => {
        if (!resolved) {
          console.warn('MediaRecorder onstop timed out; finalizing buffered chunks.');
          handleCompletion();
        }
      }, 2500);
    });
  }
}

// Check if browser native SpeechRecognition is supported
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

// Transcribe recorded audio with server-side Gemini AI model with robust error handling
export async function transcribeAudioWithAI(
  audioBase64: string,
  mimeType = 'audio/webm'
): Promise<TranscriptionResult> {
  if (!audioBase64 || audioBase64.trim().length === 0) {
    return { transcript: '', error: 'No audio data captured to transcribe.' };
  }

  try {
    const res = await fetch('/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType }),
    });

    if (!res.ok) {
      let errMsg = `Transcription service returned status ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson.error) errMsg = errJson.error;
      } catch (e) {}
      return { transcript: '', error: errMsg };
    }

    const data = await res.json();
    const transcript = (data.transcript || '').trim();
    return { 
      transcript, 
      error: data.error || (transcript ? undefined : (data.message || 'No speech detected in the audio recording.')) 
    };
  } catch (err: any) {
    console.warn('AI audio transcription error:', err);
    return { 
      transcript: '', 
      error: err.message || 'Network error while contacting transcription service.' 
    };
  }
}

// Browser Speech Recognition Wrapper with safety guards and auto-restart on pause
export function createSpeechRecognizer(
  onTranscriptChange: (text: string, isFinal: boolean) => void,
  onError?: (errorMsg: string) => void
) {
  if (typeof window === 'undefined') return null;
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let isActive = false;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + item[0].transcript.trim();
        } else {
          interimTranscript += item[0].transcript;
        }
      }
      const combined = (finalTranscript + (finalTranscript && interimTranscript ? ' ' : '') + interimTranscript).trim();
      onTranscriptChange(combined, false);
    };

    recognition.onerror = (event: any) => {
      // Benign errors like 'no-speech' or 'aborted' should not terminate recording
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Speech recognition notice:', event.error);
      }
      if (onError && event.error !== 'no-speech' && event.error !== 'aborted') {
        onError(event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if user is still actively recording (WebKit stops on pauses)
      if (isActive) {
        try {
          recognition.start();
        } catch (e) {
          // already started or transitioning
        }
      }
    };

    return {
      start: () => {
        isActive = true;
        try {
          recognition.start();
        } catch (e) {
          // ignore
        }
      },
      stop: () => {
        isActive = false;
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      },
      reset: () => {
        // no-op reset
      },
    };
  } catch (err) {
    console.warn('Could not initialize SpeechRecognition:', err);
    return null;
  }
}

// Safe client-side text-to-speech fallback
export function speakTextWithBrowser(text: string, onEnd?: () => void, rate = 0.95) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('SpeechSynthesis error:', e);
    if (onEnd) onEnd();
  }
}
