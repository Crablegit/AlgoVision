import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { GuideModal } from './components/GuideModal';
import { SettingsModal } from './components/SettingsModal';
import { ProblemInput } from './components/ProblemInput';
import { VisualizerCanvas } from './components/VisualizerCanvas';
import { StepControls } from './components/StepControls';
import { DynamicThemeCanvas } from './components/DynamicThemeCanvas';
import { SimulationResult } from './types';
import { ThemeId } from './types/themes';
import { Language, getBrowserLanguage } from './i18n/translations';
import {
  DEFAULT_THEME_ID,
  DEFAULT_GLASS_OPACITY,
  applyThemeToDocument
} from './styles/themeVariables';
import { visualizeProblemExample } from './services/gemini';

export const App: React.FC = () => {
  // 1. API Key State
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // 2. Theme & Customization State
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('algonav_theme');
    return (saved as ThemeId) || DEFAULT_THEME_ID;
  });

  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    return getBrowserLanguage();
  });

  const [glassOpacity, setGlassOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('algonav_glass_opacity');
    return saved ? Number(saved) : DEFAULT_GLASS_OPACITY;
  });

  // Apply CSS Variables for Theme & Liquid Glass effect
  useEffect(() => {
    applyThemeToDocument(currentTheme, glassOpacity);
  }, [currentTheme, glassOpacity]);

  // Handlers for settings updates
  const handleSelectTheme = (newTheme: ThemeId) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('algonav_theme', newTheme);
  };

  const handleChangeLanguage = (newLang: Language) => {
    setCurrentLanguage(newLang);
    localStorage.setItem('algonav_language', newLang);
  };

  const handleChangeGlassOpacity = (newOpacity: number) => {
    setGlassOpacity(newOpacity);
    localStorage.setItem('algonav_glass_opacity', newOpacity.toString());
  };

  // 3. Algorithm Simulation State
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1200);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem('gemini_api_key', newKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  // Bước 1: Trực quan hóa test đề bài (ưu tiên Input/Output mẫu nếu có nhập)
  const handleAnalyzeProblem = async (
    problemText: string,
    imageBase64: string | null,
    userSampleInput: string,
    userSampleOutput: string,
    model: any = 'gemini-3.5-flash-lite'
  ) => {
    setIsPlaying(false);
    setIsLoading(true);

    try {
      const result = await visualizeProblemExample(
        problemText,
        imageBase64,
        userSampleInput,
        userSampleOutput,
        apiKey,
        model
      );
      setSimulation(result);
      setCurrentFrameIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!simulation) return;
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentFrameIndex >= simulation.frames.length - 1) {
        setCurrentFrameIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleNextStep = () => {
    if (!simulation) return;
    if (currentFrameIndex < simulation.frames.length - 1) {
      setCurrentFrameIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevStep = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  useEffect(() => {
    if (!simulation) return;

    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentFrameIndex((prev) => {
          if (prev < simulation.frames.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, simulation]);

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col justify-between py-2 px-4 sm:px-8 md:px-12 relative overflow-x-hidden font-mono transition-colors duration-500"
      style={{
        backgroundColor: 'var(--theme-bg, #070b14)'
      }}
    >
      {/* Dynamic Pixel Canvas 60FPS Engine */}
      <DynamicThemeCanvas
        themeId={currentTheme}
      />

      {/* Header with Gear Settings icon */}
      <Header
        hasApiKey={!!apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        currentLanguage={currentLanguage}
      />

      {/* Main Container */}
      <main className="w-[94%] max-w-[1650px] mx-auto flex flex-col gap-6 my-4 flex-grow z-10 relative">
        {/* Bước 1: Nạp đề bài (Switch: Chụp/Dán ảnh hoặc Gõ raw text + Ô Input/Output mẫu tùy chọn) */}
        <ProblemInput
          onAnalyze={handleAnalyzeProblem}
          isLoading={isLoading}
          hasApiKey={!!apiKey}
          onOpenApiKeyModal={() => setIsSettingsModalOpen(true)}
          currentLanguage={currentLanguage}
        />

        {/* Khung trực quan hóa: Tên bài, Tags, Input/Output mẫu, Visualise stage, Giải thích */}
        <VisualizerCanvas
          simulation={simulation}
          currentFrameIndex={currentFrameIndex}
          currentLanguage={currentLanguage}
        />

        {/* Thanh điều khiển tua bước (Nút tam giác thuần túy) */}
        {simulation && simulation.frames && simulation.frames.length > 0 && (
          <StepControls
            totalSteps={simulation.frames.length}
            currentStep={currentFrameIndex}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
            onReset={handleReset}
            playbackSpeed={playbackSpeed}
            onChangeSpeed={setPlaybackSpeed}
            currentLanguage={currentLanguage}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-[94%] max-w-[1650px] mx-auto py-6 px-4 sm:px-8 md:px-12 text-center text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10 mt-6 z-10 relative">
        <p className="font-semibold text-slate-200">
          AlgoVision • Created by Crabrian
        </p>
        <p>
          <a
            href="https://github.com/Crablegit"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-white"
            style={{ color: 'var(--theme-accent, #ff7597)' }}
          >
            https://github.com/Crablegit
          </a>
        </p>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* System Settings Modal: API Key, 38 Themes, Languages, Liquid Glass Transparency */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        currentLanguage={currentLanguage}
        onChangeLanguage={handleChangeLanguage}
        glassOpacity={glassOpacity}
        onChangeGlassOpacity={handleChangeGlassOpacity}
      />
    </div>
  );
};

export default App;
