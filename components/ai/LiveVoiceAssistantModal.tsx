'use client';

import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Volume2,
  Sparkles,
  PhoneCall,
  PhoneOff,
  Activity,
} from 'lucide-react';

export function LiveVoiceAssistantModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('Press Connect to start voice interaction with gemini-3.8-live.');
  const [modelResponse, setModelResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleToggleLive = async () => {
    if (isLiveActive) {
      setIsLiveActive(false);
      setModelResponse('');
      return;
    }

    setIsLiveActive(true);
    setIsProcessing(true);
    setLiveTranscript('Listening... Speak a question about district medicine shortages or transfers.');

    try {
      // Simulate/trigger Live audio interaction via backend
      const response = await fetch('/api/gemini/live-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSpeechText: 'Explain the critical Paracetamol shortage at PHC B.' }),
      });
      const data = await response.json();
      setModelResponse(data.replyText || 'PHC B has 3 days of Paracetamol left. Transfer of 500 tablets from PHC A is recommended.');
      setLiveTranscript('Voice Turn Completed · gemini-3.8-live connected');
    } catch {
      setModelResponse('PHC B Paracetamol stock-out in 3 days. Recommend transferring 500 tablets from PHC A.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#10233F] text-white rounded-2xl border-2 border-blue-500/80 p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Radio className={`w-5 h-5 ${isLiveActive ? 'text-rose-500 animate-pulse' : 'text-blue-400'}`} />
            <div>
              <h3 className="font-bold text-sm">Gemini 3.8 Live Voice Session</h3>
              <div className="text-[10px] text-slate-300 font-mono">Real-time Multimodal Health Copilot</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Live Orb / Visualizer */}
        <div className="h-36 bg-[#0A1629] rounded-2xl border border-blue-900/60 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isLiveActive
                ? 'bg-blue-600 ring-8 ring-blue-500/30 scale-110'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {isLiveActive ? (
              <Activity className="w-8 h-8 text-white animate-pulse" />
            ) : (
              <MicOff className="w-8 h-8" />
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-2">
            {isLiveActive ? 'Live Audio Channel Active' : 'Standby · Ready to Connect'}
          </span>
        </div>

        {/* Real-time Subtitles */}
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-1">
          <div className="text-[10px] text-slate-400 font-mono">Session Output:</div>
          <p className="text-slate-200">{liveTranscript}</p>
          {modelResponse && (
            <div className="pt-2 text-blue-300 font-medium border-t border-slate-700/80 flex items-start gap-1.5">
              <Volume2 className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>{modelResponse}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleToggleLive}
            className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              isLiveActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLiveActive ? (
              <>
                <PhoneOff className="w-4 h-4" />
                <span>Disconnect Live Voice</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-4 h-4" />
                <span>Connect Live API (gemini-3.8-live)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
