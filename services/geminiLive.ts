import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getSystemInstruction, LIVE_API_MODEL } from '../constants';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from './audioUtils';
import { ApplicantData, TranscriptItem } from '../types';

export class GeminiLiveClient {
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private videoInterval: number | null = null;
  private session: any = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private onVolumeChange: (vol: number) => void;
  private onDisconnect: () => void;
  
  // Transcription state
  private transcript: TranscriptItem[] = [];
  private currentInputTranscription = '';
  private currentOutputTranscription = '';

  constructor(onVolumeChange: (vol: number) => void, onDisconnect: () => void) {
    this.onVolumeChange = onVolumeChange;
    this.onDisconnect = onDisconnect;
  }

  async connect(videoElement: HTMLVideoElement, applicantData: ApplicantData) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = this.inputAudioContext.createMediaStreamSource(stream);
      const scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
      
      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        this.onVolumeChange(rms * 5);

        if (this.session) {
          const pcmBlob = createPcmBlob(inputData, 16000);
          this.session.sendRealtimeInput({ media: pcmBlob });
        }
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(this.inputAudioContext.destination);

      const sessionPromise = ai.live.connect({
        model: LIVE_API_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Leda' } },
          },
          systemInstruction: getSystemInstruction(applicantData),
          // Enable transcription
          inputAudioTranscription: { model: "google-1.5-flash-latest" }, // Use a valid model for transcription if required, or empty object if default works
          outputAudioTranscription: { model: "google-1.5-flash-latest" }, 
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connection Opened');
          },
          onmessage: async (message: LiveServerMessage) => {
            this.handleServerMessage(message);
          },
          onclose: (e) => {
            console.log('Gemini Live Connection Closed', e);
            this.disconnect();
          },
          onerror: (e) => {
            console.error('Gemini Live Error', e);
            this.disconnect();
          },
        },
      });

      this.session = await sessionPromise;

      if (videoElement) {
          this.startVideoStream(videoElement);
      }
    } catch (error) {
      this.disconnect();
      throw error;
    }
  }

  getTranscript(): TranscriptItem[] {
      return this.transcript;
  }

  sendText(text: string) {
    if (!this.session) return;
    this.stopAudioPlayback();
    this.session.send({
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text }]
        }],
        turnComplete: true
      }
    });
  }

  private startVideoStream(videoElement: HTMLVideoElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const FRAME_RATE = 1;

    this.videoInterval = window.setInterval(() => {
        if (!this.session || !ctx) return;
        if(videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            canvas.width = videoElement.videoWidth * 0.5;
            canvas.height = videoElement.videoHeight * 0.5;
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const base64Data = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
            this.session.sendRealtimeInput({
                media: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                }
            });
        }
    }, 1000 / FRAME_RATE);
  }

  private async handleServerMessage(message: LiveServerMessage) {
    const { serverContent } = message;

    // Handle Transcription
    if (serverContent?.outputTranscription?.text) {
        this.currentOutputTranscription += serverContent.outputTranscription.text;
    }
    if (serverContent?.inputTranscription?.text) {
        this.currentInputTranscription += serverContent.inputTranscription.text;
    }

    if (serverContent?.turnComplete) {
        if (this.currentInputTranscription.trim()) {
            this.transcript.push({
                role: 'user',
                text: this.currentInputTranscription,
                timestamp: new Date().toISOString()
            });
            this.currentInputTranscription = '';
        }
        if (this.currentOutputTranscription.trim()) {
            this.transcript.push({
                role: 'model',
                text: this.currentOutputTranscription,
                timestamp: new Date().toISOString()
            });
            this.currentOutputTranscription = '';
        }
    }
    
    // Handle Audio
    if (serverContent?.modelTurn?.parts?.[0]?.inlineData) {
        const audioData = serverContent.modelTurn.parts[0].inlineData.data;
        if (audioData && this.outputAudioContext) {
            this.playAudioChunk(audioData);
        }
    }

    if (serverContent?.interrupted) {
        this.stopAudioPlayback();
    }
  }

  private async playAudioChunk(base64Audio: string) {
    if (!this.outputAudioContext) return;

    try {
        const audioBytes = base64ToUint8Array(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, this.outputAudioContext);
        
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        const outputNode = this.outputAudioContext.createGain();
        source.connect(outputNode);
        outputNode.connect(this.outputAudioContext.destination);

        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;

        this.sources.add(source);
        source.onended = () => {
            this.sources.delete(source);
        };
    } catch (err) {
        console.error("Error decoding audio chunk", err);
    }
  }

  private stopAudioPlayback() {
    this.sources.forEach(source => {
        try { source.stop(); } catch (e) { }
    });
    this.sources.clear();
    if(this.outputAudioContext) {
        this.nextStartTime = this.outputAudioContext.currentTime;
    }
  }

  disconnect() {
    this.onDisconnect();
    if (this.videoInterval) {
        clearInterval(this.videoInterval);
        this.videoInterval = null;
    }
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    this.inputAudioContext = null;
    this.outputAudioContext = null;
    this.session = null;
  }
}
