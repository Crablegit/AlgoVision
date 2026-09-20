import React from 'react';
import { X, Globe, ShieldCheck } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto sakura-card p-6 sm:p-8 relative border border-sakura-500/40 shadow-sakura-glow">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-midnight-800 border border-sakura-500/40 flex items-center justify-center text-sakura-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Hướng dẫn Deploy Vercel & GitHub</h2>
            <p className="text-xs text-sakura-300">Hoàn toàn miễn phí, chạy 100% Client-side</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-midnight-950/80 border border-midnight-700 flex items-start gap-3 mb-6 text-xs text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white mb-0.5">Bảo mật & Tự chủ API Key</p>
            <p className="text-slate-400 leading-relaxed">
              Mã nguồn đưa lên GitHub <b>hoàn toàn không chứa API Key</b>. Người dùng tự nhập API Key của họ, lưu trong <code>localStorage</code> của máy họ.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-midnight-950/90 border border-midnight-800">
            <p className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-sakura-500 text-midnight-950 flex items-center justify-center text-[10px] font-bold">1</span>
              Đẩy thư mục lên GitHub:
            </p>
            <p className="text-slate-400 mb-2">
              Vào repo của bạn trên GitHub $\rightarrow$ Chọn <b>uploading an existing file</b> $\rightarrow$ Kéo thả toàn bộ file trong thư mục này lên $\rightarrow$ Bấm <b>Commit changes</b>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-midnight-950/90 border border-midnight-800">
            <p className="font-bold text-white mb-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-sakura-500 text-midnight-950 flex items-center justify-center text-[10px] font-bold">2</span>
              Deploy Vercel:
            </p>
            <p className="text-slate-400">
              Vào <b>vercel.com</b> $\rightarrow$ Import repo $\rightarrow$ Giữ nguyên mặc định $\rightarrow$ Bấm <b>Deploy</b>. Sau 30s bạn sẽ nhận được link website trực tiếp.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="sakura-btn-primary text-xs py-2 px-6">
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
