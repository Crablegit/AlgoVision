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
    <div className="w-full neu-card flex flex-col md:flex-row items-center justify-between gap-5">
      {/* Step Counter & Progress Bar */}
      <div className="w-full md:w-1/3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-gray-600">
          <span>Tiến trình mô phỏng:</span>
          <span className="font-mono text-blue-600">
            Bước {currentStep + 1} / {totalSteps} ({progressPercentage}%)
          </span>
        </div>
        {/* Inset progress track */}
        <div className="w-full h-3 rounded-full bg-neu-bg shadow-neu-pressed overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Playback Control Buttons (Neumorphic) */}
      <div className="flex items-center gap-3">
        {/* Reset Button */}
        <button
          onClick={onReset}
          className="neu-btn p-3 rounded-2xl"
          title="Bắt đầu lại từ bước đầu"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>

        {/* Previous Step */}
        <button
          onClick={onPrevStep}
          disabled={currentStep === 0}
          className="neu-btn p-3 rounded-2xl"
          title="Lùi 1 bước"
        >
          <SkipBack className="w-4 h-4 text-gray-600" />
        </button>

        {/* Play / Pause Primary Button */}
        <button
          onClick={onPlayPause}
          className={`px-5 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all duration-200 cursor-pointer ${
            isPlaying
              ? 'bg-neu-bg shadow-neu-pressed text-blue-600'
              : 'neu-btn-primary shadow-neu-flat'
          }`}
          title={isPlaying ? "Tạm dừng" : "Tự động chạy các bước"}
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Dừng</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Chạy tự động</span>
            </>
          )}
        </button>

        {/* Next Step */}
        <button
          onClick={onNextStep}
          disabled={currentStep >= totalSteps - 1}
          className="neu-btn p-3 rounded-2xl"
          title="Tiến 1 bước"
        >
          <SkipForward className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Speed Controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" /> Tốc độ:
        </span>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neu-bg shadow-neu-pressed">
          {[
            { label: '0.5x', value: 2000 },
            { label: '1x', value: 1200 },
            { label: '2x', value: 600 }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => onChangeSpeed(item.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                playbackSpeed === item.value
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
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
