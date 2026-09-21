import React from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

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
  currentLanguage?: Language;
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
  onChangeSpeed,
  currentLanguage = 'vi'
}) => {
  if (totalSteps <= 0) return null;

  const t = translations[currentLanguage];
  const progressPercentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="w-full sakura-card p-5 flex flex-col md:flex-row items-center justify-between gap-5 z-10 relative">
      {/* Progress */}
      <div className="w-full md:w-1/3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>{t.stepText}:</span>
          <span className="font-mono" style={{ color: 'var(--theme-accent, #ff7597)' }}>
            {t.stepText} {currentStep + 1} / {totalSteps} ({progressPercentage}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: 'var(--theme-accent, #ff7597)'
            }}
          />
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-3">
        {/* Reset Button */}
        <button
          onClick={onReset}
          className="p-2.5 rounded-xl bg-black/30 hover:bg-white/10 text-slate-300 transition-all border border-white/10"
          title={t.resetBtn}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Nút lùi 1 bước: Hình tam giác thuần túy */}
        <button
          onClick={onPrevStep}
          disabled={currentStep === 0}
          className="p-2.5 rounded-xl bg-black/30 hover:bg-white/10 text-slate-300 disabled:opacity-30 transition-all border border-white/10 flex items-center justify-center"
          title={t.prevBtn}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <polygon points="17,4 5,12 17,20" fill="currentColor" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={onPlayPause}
          className="sakura-btn-primary px-5 py-2.5 text-xs font-bold"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>{t.pauseBtn}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>{t.playBtn}</span>
            </>
          )}
        </button>

        {/* Nút tiến 1 bước */}
        <button
          onClick={onNextStep}
          disabled={currentStep >= totalSteps - 1}
          className="p-2.5 rounded-xl bg-black/30 hover:bg-white/10 text-slate-300 disabled:opacity-30 transition-all border border-white/10 flex items-center justify-center"
          title={t.nextBtn}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <polygon points="7,4 19,12 7,20" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Speed */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-300 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent, #ff7597)' }} /> {t.speedText}:
        </span>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-black/40 border border-white/10">
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
                  ? 'sakura-btn-primary py-0.5 px-2 text-xs'
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
