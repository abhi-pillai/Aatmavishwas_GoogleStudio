import React from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
  audioLevel?: number; // 0 to 100
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isRecording,
  audioLevel = 0,
  barCount = 28,
}) => {
  return (
    <div 
      id="audio-waveform-container"
      className="flex items-center justify-center gap-1 sm:gap-1.5 h-12 sm:h-14 px-3 sm:px-4 py-2 bg-slate-900/60 rounded-xl border border-slate-800/80 backdrop-blur-sm overflow-hidden w-full"
    >
      {Array.from({ length: barCount }).map((_, index) => {
        // Calculate height based on index distance from center and current audioLevel
        const center = barCount / 2;
        const distanceFromCenter = Math.abs(index - center) / center;
        const baseHeight = isRecording
          ? Math.max(
              12,
              Math.min(
                100,
                (audioLevel * (1 - distanceFromCenter * 0.4) + Math.sin(index + Date.now() / 200) * 15)
              )
            )
          : 12;

        const isOuterBar = index < 4 || index > barCount - 5;

        return (
          <div
            key={index}
            className={`w-1 rounded-full transition-all duration-75 ${
              isOuterBar ? 'hidden xs:block sm:block' : 'block'
            } ${
              isRecording
                ? audioLevel > 20
                  ? 'bg-gradient-to-t from-indigo-500 via-sky-400 to-emerald-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                  : 'bg-indigo-400/60'
                : 'bg-slate-700/40'
            }`}
            style={{
              height: `${baseHeight}%`,
            }}
          />
        );
      })}
    </div>
  );
};
