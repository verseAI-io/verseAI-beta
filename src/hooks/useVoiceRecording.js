import { useState, useRef, useCallback } from 'react';

class AudioRecorder {
  constructor(onDataAvailable) {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.onDataAvailable = onDataAvailable;
    this.stream = null;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.onDataAvailable(audioBlob);
        this.audioChunks = [];
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }
}

const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef(null);
  const volumeTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  const onAudioData = useCallback(async (audioBlob) => {
    try {
      // Create form data for the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob);

      // Send to Neocortex transcription endpoint
      const response = await fetch('/api/neocortex/audio/transcribe', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.response) {
        return data.response;
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder(onAudioData);
      }
      await recorderRef.current.start();
      setIsRecording(true);

      // Set up audio analysis for voice activity detection
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      // Start monitoring volume
      monitorVolume();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  }, [onAudioData]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }, []);

  const monitorVolume = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;

    // If volume is below threshold for 2 seconds, stop recording
    if (average < 10) {
      volumeTimeoutRef.current = setTimeout(stopRecording, 2000);
    } else if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }

    requestAnimationFrame(monitorVolume);
  }, [isRecording, stopRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};

export default useVoiceRecording;