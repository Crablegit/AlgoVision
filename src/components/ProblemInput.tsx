import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Upload, X, Loader2, AlertTriangle, FileText, Code, Cpu, Info } from 'lucide-react';

interface ProblemInputProps {
  onAnalyze: (
    problemText: string,
    imageBase64: string | null,
    userSampleInput: string,
    userSampleOutput: string
  ) => Promise<void>;
  isLoading: boolean;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const ProblemInput: React.FC<ProblemInputProps> = ({
  onAnalyze,
  isLoading,
  hasApiKey,
  onOpenApiKeyModal,
  selectedModel,
  onSelectModel
}) => {
  const [inputMode, setInputMode] = useState<'image' | 'text'>('image');
  const [problemText, setProblemText] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  
  // 2 ô nhập Input & Output mẫu
  const [userSampleInput, setUserSampleInput] = useState<string>('');
  const [userSampleOutput, setUserSampleOutput] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Xử lý sự kiện paste ảnh bằng Ctrl + V trên toàn trang
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              setImageBase64(reader.result as string);
              setInputMode('image');
              setErrorMsg(null);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Vui lòng chỉ tải lên file hình ảnh (PNG, JPG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!hasApiKey) {
      onOpenApiKeyModal();
      return;
    }

    if (inputMode === 'image' && !imageBase64) {
      setErrorMsg('Vui lòng dán ảnh chụp đề bài (Ctrl+V) hoặc bấm tải ảnh lên.');
      return;
    }

    if (inputMode === 'text' && !problemText.trim()) {
      setErrorMsg('Vui lòng nhập nội dung đề bài dạng text raw.');
      return;
    }

    setErrorMsg(null);
    try {
      await onAnalyze(
        inputMode === 'text' ? problemText : '',
        inputMode === 'image' ? imageBase64 : null,
        userSampleInput.trim(),
        userSampleOutput.trim()
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi trực quan hóa đề bài.');
    }
  };

  return (
    <div className="w-full sakura-card p-6 flex flex-col gap-5 z-10 relative">
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-midnight-700/80 pb-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Nạp đề bài cần trực quan hóa
        </h2>

        {/* Ô chuyển đổi (Switch) */}
        <div className="flex items-center p-1 rounded-xl bg-midnight-950 border border-midnight-700 text-xs font-mono">
          <button
            onClick={() => setInputMode('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              inputMode === 'image'
                ? 'bg-sakura-500 text-midnight-950 font-bold shadow-sakura-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Chụp / Dán ảnh (Mặc định)</span>
          </button>

          <button
            onClick={() => setInputMode('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              inputMode === 'text'
                ? 'bg-sakura-500 text-midnight-950 font-bold shadow-sakura-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Gõ raw text</span>
          </button>
        </div>
      </div>

      {/* 1. Nhập đề bài: Ảnh hoặc Text */}
      {inputMode === 'image' ? (
        <div>
          {imageBase64 ? (
            <div className="relative rounded-xl border border-sakura-500/40 bg-midnight-950 p-2 flex flex-col items-center group">
              <img
                src={imageBase64}
                alt="Đề bài đã dán"
                className="max-h-72 object-contain rounded-lg shadow-md"
              />
              <button
                onClick={() => setImageBase64(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-500 transition-all shadow-lg"
                title="Xóa ảnh này"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-emerald-400 font-mono mt-2 font-bold">
                ✓ Đã nhận ảnh đề bài (Nhấn Ctrl+V để thay thế ảnh khác)
              </span>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-midnight-700 hover:border-sakura-500/60 rounded-xl p-8 flex flex-col items-center justify-center gap-2.5 bg-midnight-950/50 cursor-pointer transition-all hover:bg-midnight-900/60"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-midnight-800 border border-sakura-500/30 flex items-center justify-center text-sakura-400 shadow-sakura-glow">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm text-slate-200 text-center font-bold">
                Bấm để tải ảnh hoặc nhấn <span className="text-sakura-400 underline font-extrabold">Ctrl + V</span> để dán ảnh chụp màn hình
              </p>
              <p className="text-[11px] text-slate-500">
                (Chụp đề LeetCode, Codeforces, bản đồ ma trận, đồ thị... rồi dán thẳng vào đây)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <textarea
            rows={5}
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="Dán toàn bộ nội dung đề bài dạng text raw vào đây..."
            className="w-full sakura-input text-xs font-mono resize-y leading-relaxed"
          />
        </div>
      )}

      {/* 2. Ô nhập Input & Output mẫu / Custom Test Case */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-midnight-800">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-sakura-400" />
              Input mẫu / Test Case cần thử nghiệm:
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              [Nhập test đề hoặc test bạn tự tạo]
            </span>
          </div>
          <textarea
            rows={3}
            value={userSampleInput}
            onChange={(e) => setUserSampleInput(e.target.value)}
            placeholder={"Ví dụ (test mẫu hoặc test bạn tự nghĩ ra):\n8 6 2\n4 3 R U\n7 4 R D"}
            className="w-full sakura-input text-xs font-mono resize-y"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              Output mẫu / Output kỳ vọng (Tùy chọn):
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              [Để trống nếu muốn AI tự tính]
            </span>
          </div>
          <textarea
            rows={3}
            value={userSampleOutput}
            onChange={(e) => setUserSampleOutput(e.target.value)}
            placeholder={"Ví dụ:\n12\n3"}
            className="w-full sakura-input text-xs font-mono resize-y"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-midnight-700/60">
        {/* Bộ chọn Model (Model Selector) */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5 shrink-0">
            <Cpu className="w-4 h-4 text-sakura-400" />
            <span>AI Model:</span>
          </label>
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="bg-midnight-950 border border-midnight-700 hover:border-sakura-500/50 text-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-sakura-500 transition-all cursor-pointer shadow-inner"
          >
            <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
            <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
          </select>
        </div>

        {/* Nút Trực quan hóa */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="sakura-btn-primary py-3 px-6 text-xs sm:text-sm font-bold w-full sm:w-auto shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-midnight-950" />
              <span>AI đang phân tích & trực quan hóa...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-midnight-950 fill-current" />
              <span>Trực quan hóa đề bài</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
