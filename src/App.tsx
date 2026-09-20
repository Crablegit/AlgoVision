import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { GuideModal } from './components/GuideModal';
import { ProblemInput } from './components/ProblemInput';
import { VisualizerCanvas } from './components/VisualizerCanvas';
import { StepControls } from './components/StepControls';
import { CustomTestSection } from './components/CustomTestSection';
import { SakuraCanvas } from './components/SakuraCanvas';
import { SimulationResult } from './types';
import { visualizeProblemExample, visualizeCustomTest } from './services/gemini';

export const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1200);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCustomLoading, setIsCustomLoading] = useState<boolean>(false);

  // Model được chọn (mặc định là Gemini 3.5 Flash Lite)
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('gemini_selected_model') || 'gemini-3.5-flash-lite';
  });

  const handleSelectModel = (model: string) => {
    setSelectedModel(model);
    localStorage.setItem('gemini_selected_model', model);
  };

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
    userSampleOutput: string
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
        selectedModel
      );
      setSimulation(result);
      setCurrentFrameIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Chạy mô phỏng Custom Test của người dùng
  const handleRunCustomTest = async (customInput: string) => {
    if (!simulation) return;
    setIsPlaying(false);
    setIsCustomLoading(true);

    try {
      const result = await visualizeCustomTest(
        simulation.problemTitle,
        simulation.problemSummary,
        simulation.viewType,
        customInput,
        apiKey,
        selectedModel
      );
      setSimulation(result);
      setCurrentFrameIndex(0);
    } finally {
      setIsCustomLoading(false);
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
    <div className="min-h-screen bg-midnight-950 text-slate-100 flex flex-col justify-between py-2 px-2 sm:px-4 md:px-6 relative overflow-x-hidden font-mono selection:bg-sakura-500 selection:text-midnight-950">
      {/* Hiệu ứng cánh hoa anh đào pixel rơi lặp lại */}
      <SakuraCanvas />

      {/* Header */}
      <Header
        hasApiKey={!!apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
      />

      {/* Main Container: Mở rộng khung hiển thị, thu hẹp viền 2 bên hơn một nửa */}
      <main className="w-full max-w-[1550px] mx-auto flex flex-col gap-6 my-4 flex-grow z-10 relative">
        {/* Bước 1: Nạp đề bài (Switch: Chụp/Dán ảnh hoặc Gõ raw text + Ô Input/Output mẫu tùy chọn) */}
        <ProblemInput
          onAnalyze={handleAnalyzeProblem}
          isLoading={isLoading}
          hasApiKey={!!apiKey}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          selectedModel={selectedModel}
          onSelectModel={handleSelectModel}
        />

        {/* Khung trực quan hóa: Tên bài, Tags, Input/Output mẫu, Visualise stage, Giải thích */}
        <VisualizerCanvas
          simulation={simulation}
          currentFrameIndex={currentFrameIndex}
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
          />
        )}

        {/* Bước 2: Thử nghiệm với Custom Test Case (chỉ hiện khi đã có đề bài) */}
        {simulation && (
          <CustomTestSection
            problemTitle={simulation.problemTitle}
            problemSummary={simulation.problemSummary}
            onRunCustomTest={handleRunCustomTest}
            isLoading={isCustomLoading}
            selectedModel={selectedModel}
            onSelectModel={handleSelectModel}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1550px] mx-auto py-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-midnight-800/80 mt-6 z-10 relative">
        <p className="font-semibold text-slate-300">
          AlgoVision • Created by Crabrian
        </p>
        <p>
          <a
            href="https://github.com/Crablegit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sakura-400 hover:text-sakura-300 underline underline-offset-2 transition-colors"
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
    </div>
  );
};

export default App;
