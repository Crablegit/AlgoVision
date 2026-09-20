import React, { useState } from 'react';
import { Play, Loader2, Code2, AlertTriangle, Cpu } from 'lucide-react';

interface CustomTestSectionProps {
  problemTitle: string;
  problemSummary: string;
  onRunCustomTest: (customInput: string) => Promise<void>;
  isLoading: boolean;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const CustomTestSection: React.FC<CustomTestSectionProps> = ({
  problemTitle,
  onRunCustomTest,
  isLoading,
  selectedModel,
  onSelectModel
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Ví dụ: 4 5 2 \n 2 2 \n 3 3"
          className="w-full sakura-input text-xs font-mono flex-1"
        />

        {/* Model selector bên cạnh nút chạy test */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-midnight-950 border border-midnight-700 text-xs font-mono text-slate-300 shrink-0">
          <Cpu className="w-3.5 h-3.5 text-sakura-400 shrink-0" />
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer pr-1"
            title="Chọn Gemini Model để chạy test"
          >
            <option value="gemini-3.8-flash" className="bg-midnight-950 text-slate-200">
              ⚡ 3.8 Flash (20 lượt/ngày)
            </option>
            <option value="gemini-3.5-flash-lite" className="bg-midnight-950 text-slate-200">
              ⚖️ 3.5 Flash Lite (500 lượt/ngày)
            </option>
            <option value="gemini-3.1-flash-lite" className="bg-midnight-950 text-slate-200">
              🚀 3.1 Flash Lite (500 lượt/ngày)
            </option>
          </select>
        </div>

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
