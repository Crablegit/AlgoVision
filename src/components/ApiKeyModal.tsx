import React, { useState } from 'react';
import { X, Key, ExternalLink, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { testGeminiApiKey } from '../services/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!inputKey.trim()) {
      setStatus({ type: 'error', message: 'Vui lòng nhập API Key.' });
      return;
    }

    setIsTesting(true);
    setStatus({ type: null, message: '' });

    const result = await testGeminiApiKey(inputKey.trim());
    setIsTesting(false);

    if (result.valid) {
      onSaveApiKey(inputKey.trim());
      setStatus({ 
        type: 'success', 
        message: 'API Key hợp lệ! Đã kết nối Google Gemini API thành công.' 
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatus({
        type: 'error',
        message: result.error || 'API Key không hợp lệ. Vui lòng kiểm tra lại.'
      });
    }
  };

  const handleClearKey = () => {
    setInputKey('');
    onSaveApiKey('');
    setStatus({ type: 'success', message: 'Đã xóa API Key.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg sakura-card p-6 sm:p-8 relative border border-sakura-500/40 shadow-sakura-glow">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-midnight-800 border border-sakura-500/40 flex items-center justify-center text-sakura-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Cài đặt Gemini API Key</h2>
            <p className="text-xs text-slate-400">Kết nối API để trực quan hóa đề bài và thuật toán</p>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-midnight-950/80 border border-midnight-700 text-xs text-slate-300 leading-relaxed space-y-3">
          <div>
            <p className="font-semibold text-white mb-1">💡 Lấy API Key miễn phí từ Google:</p>
            <p className="text-slate-400 text-[11px] mb-1.5">
              Đăng nhập tài khoản Google để lấy key miễn phí, không cần thẻ ngân hàng:
            </p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-sakura-400 hover:text-sakura-300 underline underline-offset-2"
            >
              Lấy API Key tại Google AI Studio <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-2 border-t border-midnight-800 space-y-1.5 text-[11px]">
            <p className="font-bold text-slate-200">🎯 Hướng dẫn lựa chọn Model khi sử dụng:</p>
            <div className="space-y-1.5 text-slate-400">
              <div className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold shrink-0">⚡ 3.8 Flash:</span>
                <span>Ưu tiên cho <b className="text-slate-200">bài phức tạp</b> (Cây, Đồ thị, DP khó, hình học). <span className="text-rose-400 font-medium">(1 ngày dùng được 20 lượt / 1 API)</span></span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-sky-400 font-bold shrink-0">⚖️ 3.5 Flash Lite:</span>
                <span>Lựa chọn <b className="text-slate-200">cân bằng</b>, suy luận chuẩn xác và nhanh. <span className="text-emerald-400 font-medium">(1 ngày dùng được 500 lượt)</span></span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold shrink-0">🚀 3.1 Flash Lite:</span>
                <span>Dành cho <b className="text-slate-200">bài dễ</b> hoặc test nhanh tiết kiệm lượt dùng. <span className="text-emerald-400 font-medium">(1 ngày dùng được 500 lượt)</span></span>
              </div>
            </div>
            <p className="text-[10px] text-sakura-300/90 italic pt-0.5">
              * Bạn có thể chuyển đổi linh hoạt giữa 3 model ngay bên cạnh nút "Trực quan hóa đề bài".
            </p>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Google Gemini API Key (bắt đầu bằng AIzaSy...)
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Dán AIzaSy... vào đây"
              className="w-full sakura-input pr-12 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {status.type && (
          <div
            className={`mb-5 p-3 rounded-xl flex items-start gap-2 text-xs font-medium border ${
              status.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          {inputKey && (
            <button
              type="button"
              onClick={handleClearKey}
              className="text-xs text-rose-400 hover:text-rose-300 px-3 py-2"
            >
              Xóa Key
            </button>
          )}

          <button
            type="button"
            onClick={handleTestAndSave}
            disabled={isTesting || !inputKey.trim()}
            className="sakura-btn-primary text-xs py-2.5 px-5"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Kiểm tra & Lưu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
