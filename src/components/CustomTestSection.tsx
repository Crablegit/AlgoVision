import React, { useState } from 'react';
import { Play, Loader2, Code2, AlertTriangle } from 'lucide-react';

interface CustomTestSectionProps {
  problemTitle: string;
  problemSummary: string;
  onRunCustomTest: (customInput: string) => Promise<void>;
  isLoading: boolean;
}

export const CustomTestSection: React.FC<CustomTestSectionProps> = ({
  problemTitle,
  onRunCustomTest,
  isLoading
}) => {
  const [customInput, setCustomInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRun = async () => {
    if (!customInput.trim()) {
      setErrorMsg('Vui lòng nhập dữ liệu test case của bạn.');
      return;
    }
    setErrorMsg(null);
    try {
      await onRunCustomTest(customInput.trim());
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi chạy custom test.');
    }
  };

  return (
    <div className="w-full sakura-card p-6 border border-sakura-500/30 flex flex-col gap-4 z-10 relative">
      <div className="flex items-center justify-between border-b border-midnight-700 pb-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-sakura-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Thử nghiệm với Custom Test Case của bạn
          </h3>
        </div>
        <span className="text-[11px] text-emerald-400 font-mono">
          [Đang áp dụng cho bài: {problemTitle}]
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Bạn đã hiểu cách hoạt động của đề bài qua test ví dụ? Hãy nhập một bộ test case bất kỳ do bạn tự nghĩ ra để xem trực quan hóa:
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Ví dụ: nums = [10, 20, 30, 40], target = 50"
          className="w-full sakura-input text-xs font-mono"
        />
        <button
          onClick={handleRun}
          disabled={isLoading || !customInput.trim()}
          className="sakura-btn-primary px-5 py-3 text-xs shrink-0 w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-midnight-950" />
              <span>Đang chạy...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-midnight-950" />
              <span>Chạy mô phỏng test này</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
