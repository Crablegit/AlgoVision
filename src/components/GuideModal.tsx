import React from 'react';
import { X, Key, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
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
            <h2 className="text-lg font-bold text-white">Cách lấy API Key & Sử dụng</h2>
            <p className="text-xs text-sakura-300">Miễn phí 100% từ Google AI Studio</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-midnight-950/80 border border-midnight-700 flex items-start gap-3 mb-5 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-slate-400 leading-relaxed">
            API Key được lưu trực tiếp trong trình duyệt của bạn (localStorage), không lưu trên máy chủ hay gửi đi đâu khác.
          </p>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="p-3.5 rounded-xl bg-midnight-950/90 border border-midnight-800">
            <p className="font-bold text-white mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-sakura-500 text-midnight-950 flex items-center justify-center text-[10px] font-bold">1</span>
              Truy cập Google AI Studio:
            </p>
            <p className="text-slate-400 mb-2">
              Đăng nhập bằng tài khoản Google (Gmail) tại:
            </p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-sakura-400 hover:text-sakura-300 underline"
            >
              aistudio.google.com/apikey <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-3.5 rounded-xl bg-midnight-950/90 border border-midnight-800">
            <p className="font-bold text-white mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-sakura-500 text-midnight-950 flex items-center justify-center text-[10px] font-bold">2</span>
              Tạo và sao chép API Key:
            </p>
            <p className="text-slate-400">
              Bấm nút <b>"Create API key"</b> $\rightarrow$ Chọn project Google Cloud có sẵn (hoặc tạo mới) $\rightarrow$ Sao chép chuỗi mã bắt đầu bằng <code>AIzaSy...</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-midnight-950/90 border border-midnight-800">
            <p className="font-bold text-white mb-1 flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-sakura-500 text-midnight-950 flex items-center justify-center text-[10px] font-bold">3</span>
              Dán vào AlgoVision:
            </p>
            <p className="text-slate-400">
              Bấm nút <b>"Nhập API Key"</b> ở góc trên bên phải trang web $\rightarrow$ Dán key vào $\rightarrow$ Bấm <b>"Kiểm tra & Lưu"</b> là xong!
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="sakura-btn-primary text-xs py-2 px-6">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã hiểu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
