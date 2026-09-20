import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Zap } from 'lucide-react';

interface StepControlsProps {
  totalSteps: number;
  currentStep: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const StepControls: React.FC<StepControlsProps> = ({
  totalSteps,
  currentStep,
  isPlaying,
  onPlayPause,
  onNextStep,
  onPrevStep,
  onReset,
  playbackSpeed,
  onChangeSpeed
}) => {
  if (totalSteps <= 0) return null;

  const progressPercentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="w-full sakura-card p-5 flex flex-col md:flex-row items-center justify-between gap-5 z-10 relative">
      {/* Progress */}
      <div className="w-full md:w-1/3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>Tiến trình:</span>
          <span className="font-mono text-sakura-400">
            Bước {currentStep + 1} / {totalSteps} ({progressPercentage}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-midnight-950 border border-midnight-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sakura-500 to-rose-400 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onReset}
          className="p-2.5 rounded-xl bg-midnight-800 hover:bg-midnight-700 text-slate-300 transition-all border border-midnight-700"
          title="Bắt đầu lại"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onPrevStep}
          disabled={currentStep === 0}
          className="p-2.5 rounded-xl bg-midnight-800 hover:bg-midnight-700 text-slate-300 disabled:opacity-40 transition-all border border-midnight-700"
          title="Lùi 1 bước"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onPlayPause}
          className="sakura-btn-primary px-5 py-2.5 text-xs font-bold"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Dừng</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Tự động chạy</span>
            </>
          )}
        </button>

        <button
          onClick={onNextStep}
          disabled={currentStep >= totalSteps - 1}
          className="p-2.5 rounded-xl bg-midnight-800 hover:bg-midnight-700 text-slate-300 disabled:opacity-40 transition-all border border-midnight-700"
          title="Tiến 1 bước"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-sakura-400" /> Tốc độ:
        </span>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-midnight-950 border border-midnight-800">
          {[
            { label: '0.5x', value: 2000 },
            { label: '1x', value: 1200 },
            { label: '2x', value: 600 }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => onChangeSpeed(item.value)}
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                playbackSpeed === item.value
                  ? 'bg-sakura-500 text-midnight-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
