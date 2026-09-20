import React, { useState } from 'react';
import { Sparkles, BookOpen, Loader2, AlertTriangle } from 'lucide-react';

interface ProblemInputProps {
  onAnalyze: (problemText: string, customInput: string) => Promise<void>;
  isLoading: boolean;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
}

export const ProblemInput: React.FC<ProblemInputProps> = ({
  onAnalyze,
  isLoading,
  hasApiKey,
  onOpenApiKeyModal
}) => {
  const [problemText, setProblemText] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      <div className="flex items-center justify-between border-b border-gray-200/60 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-bold text-gray-800">Nhập đề bài & Test case</h2>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Nội dung đề bài:
          </label>
        </div>
        <textarea
          rows={4}
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          placeholder="Dán đề bài (LeetCode, Codeforces hoặc đề tự tạo) vào đây..."
          className="w-full neu-input text-xs sm:text-sm resize-y leading-relaxed"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Test Case / Dữ liệu đầu vào cần mô phỏng:
          </label>
          <span className="text-[11px] text-gray-400 font-medium">
            (Có thể để trống để AI tự trích xuất test mẫu)
          </span>
        </div>
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Ví dụ: nums = [3, 2, 4], target = 6"
          className="w-full neu-input text-xs sm:text-sm"
        />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleAnalyzeClick}
          disabled={isLoading}
          className="neu-btn-primary py-3 px-6 text-sm font-bold flex items-center gap-2 w-full sm:w-auto shadow-neu-flat hover:shadow-neu-glow transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Gemini 3.1 Flash Lite đang phân tích đề...</span>
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
