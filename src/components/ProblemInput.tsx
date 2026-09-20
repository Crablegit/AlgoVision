import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Upload, X, Loader2, AlertTriangle, FileText } from 'lucide-react';

interface ProblemInputProps {
  onAnalyze: (problemText: string, imageBase64: string | null) => Promise<void>;
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
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Xử lý sự kiện paste ảnh bằng Ctrl + V trên toàn trang hoặc vào ô
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

    if (!problemText.trim() && !imageBase64) {
      setErrorMsg('Vui lòng dán ảnh chụp đề bài (Ctrl+V) hoặc nhập văn bản đề bài.');
      return;
    }

    setErrorMsg(null);
    try {
      await onAnalyze(problemText, imageBase64);
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi trực quan hóa đề bài.');
    }
  };

  return (
    <div className="w-full sakura-card p-6 flex flex-col gap-5 z-10 relative">
      <div className="flex items-center justify-between border-b border-midnight-700/80 pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-sakura-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Nhập đề bài (Dán ảnh Ctrl+V hoặc gõ chữ)
          </h2>
        </div>
        <span className="text-[11px] text-sakura-300/80 font-mono">
          [Hỗ trợ ảnh chụp màn hình]
        </span>
      </div>

      {/* Vùng Dropzone / Paste ảnh */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          1. Ảnh chụp màn hình đề bài:
        </label>

        {imageBase64 ? (
          <div className="relative rounded-xl border border-sakura-500/40 bg-midnight-950 p-2 flex flex-col items-center group">
            <img
              src={imageBase64}
              alt="Đề bài đã dán"
              className="max-h-64 object-contain rounded-lg shadow-md"
            />
            <button
              onClick={() => setImageBase64(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-500 transition-all shadow-lg"
              title="Xóa ảnh"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-emerald-400 font-mono mt-2">
              ✓ Đã nhận ảnh đề bài (Nhấn Ctrl+V để thay thế ảnh khác)
            </span>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-midnight-700 hover:border-sakura-500/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-midnight-950/40 cursor-pointer transition-all hover:bg-midnight-900/50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-midnight-800 border border-sakura-500/30 flex items-center justify-center text-sakura-400">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-300 text-center font-bold">
              Bấm để tải ảnh lên hoặc nhấn <span className="text-sakura-400 underline">Ctrl + V</span> để dán ảnh chụp màn hình
            </p>
            <p className="text-[11px] text-slate-500">
              (Chụp đề LeetCode, Codeforces hoặc tài liệu rồi dán thẳng vào đây)
            </p>
          </div>
        )}
      </div>

      {/* Vùng gõ chữ bổ sung (nếu muốn) */}
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          2. Hoặc gõ nội dung đề bài / ghi chú (không bắt buộc nếu đã có ảnh):
        </label>
        <textarea
          rows={3}
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          placeholder="Ví dụ: Cho mảng số nguyên nums và target, tìm cặp số..."
          className="w-full sakura-input text-xs resize-y"
        />
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-end pt-1">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="sakura-btn-primary py-3 px-6 text-xs sm:text-sm font-bold w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-midnight-950" />
              <span>Gemini đang đọc đề & trực quan hóa...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-midnight-950 fill-current" />
              <span>Trực quan hóa test ví dụ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
