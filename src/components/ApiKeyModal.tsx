import React, { useState } from 'react';
import { X, Key, ExternalLink, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, Zap } from 'lucide-react';
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
        message: `Hợp lệ! Đã kết nối với ${result.provider || 'AI'}. Đã lưu an toàn vào trình duyệt.` 
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
    setStatus({ type: 'success', message: 'Đã xóa API Key khỏi bộ nhớ trình duyệt.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neu-bg rounded-3xl shadow-neu-flat-lg p-6 sm:p-8 relative border border-white/40">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-neu-bg shadow-neu-flat active:shadow-neu-pressed flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-neu-bg shadow-neu-flat flex items-center justify-center text-blue-500">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Cài đặt AI API Key</h2>
            <p className="text-xs text-gray-500">Hỗ trợ Groq (14.400 lượt/ngày) & Google Gemini</p>
          </div>
        </div>

        {/* Info Guide */}
        <div className="mb-6 p-4 rounded-2xl bg-neu-bg shadow-neu-pressed text-xs text-gray-600 leading-relaxed space-y-3">
          <div className="border-b border-gray-300/60 pb-2">
            <p className="font-bold text-emerald-700 flex items-center gap-1 mb-0.5">
              <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              ⭐ Khuyên dùng: Groq (Llama 3.3 70B) — 14.400 lượt/ngày MIỄN PHÍ
            </p>
            <p className="mb-1 text-[11px]">
              Tốc độ siêu nhanh, không lo hết lượt. Đăng ký tài khoản Google/GitHub là có key ngay.
            </p>
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
            >
              Lấy Groq Key (bắt đầu bằng gsk_...) <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div>
            <p className="font-bold text-blue-700 mb-0.5">Hoặc dùng Google Gemini API:</p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2"
            >
              Lấy Gemini API Key <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Key Input */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Dán API Key (Groq gsk_... hoặc Google AIzaSy...)
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Dán key Groq (gsk_...) hoặc Gemini vào đây"
              className="w-full neu-input pr-12 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Status Notification */}
        {status.type && (
          <div
            className={`mb-5 p-3.5 rounded-xl flex items-start gap-2 text-xs font-medium ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {inputKey && (
            <button
              type="button"
              onClick={handleClearKey}
              className="neu-btn text-xs text-rose-600 py-2.5 px-4"
            >
              Xóa Key
            </button>
          )}

          <button
            type="button"
            onClick={handleTestAndSave}
            disabled={isTesting || !inputKey.trim()}
            className="neu-btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
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
