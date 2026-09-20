import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { GuideModal } from './components/GuideModal';
import { ProblemInput } from './components/ProblemInput';
import { VisualizerCanvas } from './components/VisualizerCanvas';
import { StepControls } from './components/StepControls';
import { SAMPLE_PROBLEMS } from './data/sampleProblems';
import { SimulationResult, SampleProblem } from './types';
import { analyzeAndVisualizeProblem } from './services/gemini';

export const App: React.FC = () => {
  // State quản lý API Key
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // State mô phỏng thuật toán (mặc định lấy bài Two Sum để người dùng xem ngay)
  const [simulation, setSimulation] = useState<SimulationResult>(
    SAMPLE_PROBLEMS[0].initialResult
  );
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1200); // 1.2s mỗi bước
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Lưu API Key vào localStorage
  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem('gemini_api_key', newKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  // Chọn bài toán mẫu
  const handleSelectSample = (sample: SampleProblem) => {
    setIsPlaying(false);
    setSimulation(sample.initialResult);
    setCurrentFrameIndex(0);
  };

  // Gọi Gemini 2.0 Flash phân tích đề bài mới
  const handleAnalyzeProblem = async (problemText: string, customInput: string) => {
    setIsPlaying(false);
    setIsLoading(true);

    try {
      const result = await analyzeAndVisualizeProblem(problemText, customInput, apiKey);
      setSimulation(result);
      setCurrentFrameIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Điều khiển tua bước
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // Nếu đang ở bước cuối mà bấm Play thì bắt đầu lại từ đầu
      if (currentFrameIndex >= simulation.frames.length - 1) {
        setCurrentFrameIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleNextStep = () => {
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

  // Tự động chuyển bước khi đang Play
  useEffect(() => {
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
  }, [isPlaying, playbackSpeed, simulation.frames.length]);

  return (
    <div className="min-h-screen bg-neu-bg flex flex-col justify-between py-2 px-4 sm:px-6">
      {/* Header */}
      <Header
        hasApiKey={!!apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto flex flex-col gap-6 my-4 flex-grow">
        {/* Section 1: Problem & Input Panel */}
        <ProblemInput
          onSelectSample={handleSelectSample}
          onAnalyze={handleAnalyzeProblem}
          isLoading={isLoading}
          hasApiKey={!!apiKey}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        />

        {/* Section 2: Visualizer Stage */}
        <VisualizerCanvas
          simulation={simulation}
          currentFrameIndex={currentFrameIndex}
        />

        {/* Section 3: Playback Controls */}
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
        />
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-6 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-gray-200/50 mt-6">
        <p>
          Thiết kế theo phong cách <b>Neumorphism (Soft UI)</b> • Được hỗ trợ bởi <b>Gemini 2.0 Flash</b>
        </p>
        <p className="font-mono text-gray-400">
          Chạy 100% Client-side • Bảo mật API Key
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
    </div>
  );
};

export default App;
