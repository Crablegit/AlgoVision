import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, X, Loader2, AlertTriangle, FileText, Code, ChevronDown } from 'lucide-react';
import { GeminiModelType, ModelOption } from '../types';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Mạnh nhất',
    quota: 'Tư duy logic cao',
    desc: 'Khuyên dùng cho bài toán phức tạp'
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    badge: 'Cân bằng',
    quota: 'Tốc độ & Suy luận',
    desc: 'Mô hình cân bằng nâng cao'
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    badge: 'Ổn định',
    quota: 'Phản hồi nhanh',
    desc: 'Mô hình ổn định'
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    badge: 'Tiết kiệm Token',
    quota: 'Siêu tốc',
    desc: 'Mô hình tiết kiệm token'
  }
];

interface ProblemInputProps {
  onAnalyze: (
    problemText: string,
    imageBase64: string | null,
    userSampleInput: string,
    userSampleOutput: string,
    model: GeminiModelType
  ) => Promise<void>;
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
  const [inputMode, setInputMode] = useState<'image' | 'text'>('image');
  const [problemText, setProblemText] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-3.8-flash');
  
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
        userSampleOutput.trim(),
        selectedModel
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

      {/* 1. Khu vực nạp dữ liệu: 3 cột cùng một dòng (3/5 cho Ảnh/Text, 1/5 cho Input mẫu, 1/5 cho Output mẫu) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-stretch">
        {/* Cột 1: Ảnh chụp hoặc Raw text đề bài (Chiếm 3/5) */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1 truncate">
              {inputMode === 'image' ? (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-sakura-400 shrink-0" />
                  <span>Ảnh chụp đề bài:</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-sakura-400 shrink-0" />
                  <span>Nội dung đề bài (Raw Text):</span>
                </>
              )}
            </label>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              {inputMode === 'image' ? '[Nhấn Ctrl+V để dán ảnh]' : '[Gõ hoặc dán text]'}
            </span>
          </div>

          {inputMode === 'image' ? (
            <div className="flex-1 flex flex-col min-h-0">
              {imageBase64 ? (
                <div className="relative rounded-xl border border-sakura-500/40 bg-midnight-950 p-2 flex flex-col items-center justify-center flex-1 min-h-[220px] group">
                  <img
                    src={imageBase64}
                    alt="Đề bài đã dán"
                    className="max-h-48 object-contain rounded-lg shadow-md"
                  />
                  <button
                    onClick={() => setImageBase64(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-500 transition-all shadow-lg"
                    title="Xóa ảnh này"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-emerald-400 font-mono mt-1.5 font-bold">
                    ✓ Đã nhận ảnh (Ctrl+V để thay ảnh khác)
                  </span>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-midnight-700 hover:border-sakura-500/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-midnight-950/50 cursor-pointer transition-all hover:bg-midnight-900/60 flex-1 min-h-[220px]"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-midnight-800 border border-sakura-500/30 flex items-center justify-center text-sakura-400 shadow-sakura-glow">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 text-center font-bold">
                    Bấm để tải ảnh hoặc nhấn <span className="text-sakura-400 underline font-extrabold">Ctrl + V</span> để dán
                  </p>
                  <p className="text-[11px] text-slate-500 text-center">
                    (Chụp đề LeetCode, Codeforces, bản đồ ma trận, đồ thị... rồi dán vào đây)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Dán toàn bộ nội dung đề bài dạng text raw vào đây..."
                className="w-full flex-1 min-h-[220px] sakura-input text-xs font-mono resize-none leading-relaxed p-3"
              />
            </div>
          )}
        </div>

        {/* Cột 2: Input mẫu (Chiếm 1/5) - Độ cao bằng cột dán ảnh */}
        <div className="lg:col-span-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1 truncate">
              <Code className="w-3.5 h-3.5 text-sakura-400 shrink-0" />
              <span>Input mẫu:</span>
            </label>
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <textarea
              value={userSampleInput}
              onChange={(e) => setUserSampleInput(e.target.value)}
              placeholder={"Ví dụ:\n8 6 2\n4 3 R U\n7 4 R D"}
              className="w-full flex-1 min-h-[220px] sakura-input text-xs font-mono resize-none leading-relaxed p-2.5"
            />
          </div>
        </div>

        {/* Cột 3: Output mẫu (Chiếm 1/5) - Độ cao bằng cột dán ảnh */}
        <div className="lg:col-span-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1 truncate">
              <Code className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Output mẫu:</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono hidden xl:inline">
              [Tùy chọn]
            </span>
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <textarea
              value={userSampleOutput}
              onChange={(e) => setUserSampleOutput(e.target.value)}
              placeholder={"Ví dụ:\n12\n3"}
              className="w-full flex-1 min-h-[220px] sakura-input text-xs font-mono resize-none leading-relaxed p-2.5"
            />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Dòng điều khiển: Chọn mô hình (bên trái) và nút Run Me (đã xóa ngôi sao) */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-midnight-700/60">
        {/* Ô cuộn chọn mô hình (bên trái) */}
        <div className="relative w-full sm:w-72">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as GeminiModelType)}
            className="w-full py-2.5 pl-3.5 pr-10 rounded-xl bg-midnight-950 border border-slate-700 hover:border-sakura-500/60 text-xs font-mono text-white focus:outline-none focus:border-sakura-400 cursor-pointer appearance-none shadow-md transition-all"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-midnight-950 text-slate-200 py-2">
                {m.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-sakura-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Nút Run Me (Đổi từ Trực quan hóa đề bài, xóa hình ngôi sao) */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="sakura-btn-primary py-2.5 px-8 text-xs sm:text-sm font-bold w-full sm:w-auto shrink-0 shadow-lg hover:shadow-sakura-glow transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-midnight-950" />
              <span>Đang phân tích...</span>
            </>
          ) : (
            <span>Run Me</span>
          )}
        </button>
      </div>
    </div>
  );
};
