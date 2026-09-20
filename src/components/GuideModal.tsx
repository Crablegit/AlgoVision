import React from 'react';
import { X, Key, ExternalLink, ShieldCheck, CheckCircle2, HelpCircle, FileText } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto sakura-card p-6 sm:p-8 relative border border-sakura-500/40 shadow-sakura-glow">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-midnight-800 border border-sakura-500/40 flex items-center justify-center text-sakura-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Hướng dẫn sử dụng AlgoVision</h2>
            <p className="text-xs text-sakura-300">Trực quan hóa đề bài & test case</p>
          </div>
        </div>

        {/* Tính năng Trực quan hóa Test đề bài */}
        <div className="p-4 rounded-xl bg-midnight-950/90 border border-sakura-500/30 mb-5 text-xs text-slate-300 space-y-2">
          <p className="font-bold text-sakura-400 flex items-center gap-1.5 text-sm">
            <FileText className="w-4 h-4" />
            Cách trực quan hóa Test đề bài:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 leading-relaxed">
            <li>
              <b>Dán ảnh đề bài:</b> Chụp màn hình đề bài rồi nhấn <span className="text-white font-bold">Ctrl + V</span> trên trang web (hoặc kéo thả file ảnh vào khung).
            </li>
            <li>
              <b>Ô Input & Output mẫu (Tùy chọn):</b>
              <br />
              - <span className="text-emerald-400">Nếu bạn tự nhập:</span> AI sẽ ưu tiên <b>100%</b> mô phỏng chính xác theo đúng dữ liệu Input và Output bạn nhập.
              <br />
              - <span className="text-slate-300">Nếu để trống:</span> AI sẽ tự động đọc ảnh đề bài để tìm và trích xuất Test ví dụ 1 (Input 1 / Output 1) có trong đề.
            </li>
            <li>
              <b>Thử nghiệm Custom Test:</b> Sau khi xem xong test mẫu, bạn có thể nhập test case riêng của mình ở khung bên dưới để chạy mô phỏng lại!
            </li>
          </ul>
        </div>

        {/* Hướng dẫn lấy API Key */}
        <div className="space-y-3.5 text-xs">
          <p className="font-bold text-white flex items-center gap-1.5">
            <Key className="w-4 h-4 text-sakura-400" />
            Cách lấy API Key miễn phí (Google AI Studio):
          </p>

          <div className="p-3 rounded-xl bg-midnight-950/80 border border-midnight-800">
            <p className="text-slate-400 mb-1.5">
              1. Truy cập vào trang lấy key của Google:
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

          <div className="p-3 rounded-xl bg-midnight-950/80 border border-midnight-800 text-slate-400">
            2. Đăng nhập Google $\rightarrow$ Bấm <b>"Create API key"</b> $\rightarrow$ Sao chép mã <code>AIzaSy...</code>.
          </div>

          <div className="p-3 rounded-xl bg-midnight-950/80 border border-midnight-800 text-slate-400">
            3. Bấm <b>"Nhập API Key"</b> ở góc trên bên phải AlgoVision $\rightarrow$ Dán vào $\rightarrow$ Bấm <b>"Kiểm tra & Lưu"</b>.
          </div>
        </div>

        <div className="mt-5 p-3 rounded-xl bg-midnight-950/60 border border-midnight-800 flex items-start gap-2.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>API Key lưu an toàn trong trình duyệt của bạn (localStorage), không gửi về bất kỳ máy chủ nào.</span>
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
