import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, RotateCcw } from 'lucide-react';

const VoiceRecorder = ({ onSend, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [duration, setDuration] = useState(0);
    const mediaRecorder = useRef(null);
    const recognition = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = true;
            recognition.current.interimResults = true;
            recognition.current.onresult = (event) => {
                let interimTranscription = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setTranscription(prev => prev + event.results[i][0].transcript + ' ');
                    } else {
                        interimTranscription += event.results[i][0].transcript;
                    }
                }
            };
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recognition.current) recognition.current.stop();
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.current.start();
            if (recognition.current) recognition.current.start();
            setIsRecording(true);
            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Microphone access denied');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            if (recognition.current) recognition.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSend = () => {
        if (audioBlob) {
            onSend(audioBlob, transcription);
            reset();
        }
    };

    const reset = () => {
        setAudioBlob(null);
        setTranscription('');
        setDuration(0);
        setIsRecording(false);
    };

    return (
        <div className="bg-gray-50 border rounded-2xl p-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className="font-mono text-sm font-bold">{formatDuration(duration)}</span>
                </div>
                {isRecording ? (
                    <button onClick={stopRecording} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors">
                        <Square size={20} />
                    </button>
                ) : !audioBlob ? (
                    <button onClick={startRecording} className="p-2 bg-primary-light text-primary rounded-full hover:bg-primary/20 transition-colors">
                        <Mic size={20} />
                    </button>
                ) : (
                    <button onClick={reset} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-secondary">
                        <RotateCcw size={18} />
                    </button>
                )}
            </div>

            {/* Transcription Preview */}
            {(transcription || isRecording) && (
                <div className="mb-4 text-sm text-secondary italic bg-white p-3 rounded-xl border border-dashed border-gray-200 max-h-24 overflow-y-auto">
                    {transcription || (isRecording ? "Listening..." : "No speech detected")}
                </div>
            )}

            {audioBlob && !isRecording && (
                <div className="flex gap-2">
                    <button onClick={handleSend} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                        <Send size={18} /> Send Voice Message
                    </button>
                    <button onClick={onCancel} className="btn btn-outline p-2">
                        <Trash2 size={20} className="text-secondary" />
                    </button>
                </div>
            )}

            {isRecording && (
                <button onClick={onCancel} className="btn btn-outline w-full mt-2">Cancel</button>
            )}
        </div>
    );
};

export default VoiceRecorder;
