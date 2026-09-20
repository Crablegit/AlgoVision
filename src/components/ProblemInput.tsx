import React, { useState } from 'react';
import { Sparkles, PlayCircle, BookOpen, Layers, Loader2, AlertTriangle } from 'lucide-react';
import { SAMPLE_PROBLEMS } from '../data/sampleProblems';
import { SampleProblem } from '../types';

interface ProblemInputProps {
  onSelectSample: (sample: SampleProblem) => void;
  onAnalyze: (problemText: string, customInput: string) => Promise<void>;
  isLoading: boolean;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
}

export const ProblemInput: React.FC<ProblemInputProps> = ({
  onSelectSample,
  onAnalyze,
  isLoading,
  hasApiKey,
  onOpenApiKeyModal
}) => {
  const [activeSampleId, setActiveSampleId] = useState<string>(SAMPLE_PROBLEMS[0].id);
  const [problemText, setProblemText] = useState<string>(SAMPLE_PROBLEMS[0].description);
  const [customInput, setCustomInput] = useState<string>(SAMPLE_PROBLEMS[0].defaultInput);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPreset = (sample: SampleProblem) => {
    setActiveSampleId(sample.id);
    setProblemText(sample.description);
    setCustomInput(sample.defaultInput);
    setErrorMsg(null);
    onSelectSample(sample);
  };

  const handleAnalyzeClick = async () => {
    if (!hasApiKey) {
      onOpenApiKeyModal();
      return;
    }

    if (!problemText.trim()) {
      setErrorMsg('Vui lòng nhập đề bài cần phân tích.');
      return;
    }

    setErrorMsg(null);
    try {
      await onAnalyze(problemText, customInput);
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi phân tích đề bài.');
    }
  };

  return (
    <div className="w-full neu-card flex flex-col gap-5">
      {/* Header of card: Preset buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200/60 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-bold text-gray-800">Đề bài & Dữ liệu kiểm thử</h2>
        </div>

        {/* Preset problem pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Mẫu:
          </span>
          {SAMPLE_PROBLEMS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectPreset(sample)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                activeSampleId === sample.id
                  ? 'bg-neu-bg text-blue-600 font-bold shadow-neu-pressed'
                  : 'bg-neu-bg text-gray-600 font-medium shadow-neu-flat hover:text-gray-900'
              }`}
            >
              {sample.title.split(' - ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Description Textarea */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Nội dung đề bài (hoặc dán đề LeetCode / Codeforces vào đây):
          </label>
        </div>
        <textarea
          rows={4}
          value={problemText}
          onChange={(e) => {
            setProblemText(e.target.value);
            setActiveSampleId(''); // Reset preset badge if customized
          }}
          placeholder="Ví dụ: Cho một mảng số nguyên nums và một số nguyên target, tìm hai số..."
          className="w-full neu-input text-xs sm:text-sm resize-y leading-relaxed"
        />
      </div>

      {/* Test Case / Custom Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Test Case / Dữ liệu đầu vào cần mô phỏng:
          </label>
          <span className="text-[11px] text-gray-400 font-medium">
            (Có thể để trống để AI tự sinh test mẫu)
          </span>
        </div>
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Ví dụ: nums = [2, 7, 11, 15], target = 9"
          className="w-full neu-input text-xs sm:text-sm"
        />
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleAnalyzeClick}
          disabled={isLoading}
          className="neu-btn-primary py-3 px-6 text-sm font-bold flex items-center gap-2 w-full sm:w-auto shadow-neu-flat hover:shadow-neu-glow transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Gemini 2.0 Flash đang phân tích đề...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Phân tích & Trực quan hóa đề này</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
