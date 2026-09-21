import React from 'react';
import { X, Key, ExternalLink, ShieldCheck, CheckCircle2, HelpCircle, FileText, Cpu } from 'lucide-react';

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
              <b>Thử nghiệm Custom Test / Bộ test tự tạo:</b> Nếu bạn muốn thử nghiệm một bộ test khác bất kỳ (hoặc tự tạo test case mới), bạn chỉ cần <b>nhập đè trực tiếp vào 2 ô "Input mẫu" và "Output mẫu"</b> ở khung nạp đề bài phía trên rồi bấm <b>"Trực quan hóa đề bài"</b>. AI sẽ tự động phân tích và trực quan hóa từng bước theo đúng dữ liệu test mới của bạn!
            </li>
          </ul>
        </div>

        {/* Hướng dẫn cài đặt API Key */}
        <div className="space-y-3.5 text-xs">
          <div>
            <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Key className="w-4 h-4 text-sakura-400" />
              Cài đặt Gemini API Key
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Kết nối API để trực quan hóa đề bài và thuật toán
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-midnight-950/80 border border-midnight-800 space-y-1.5">
            <p className="font-bold text-white text-xs">💡 Lấy API Key miễn phí từ Google:</p>
            <p className="text-slate-400 text-[11px]">
              Đăng nhập tài khoản Google để lấy key miễn phí, không cần thẻ ngân hàng:
            </p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-sakura-400 hover:text-sakura-300 underline underline-offset-2 text-xs pt-0.5"
            >
              Lấy API Key tại Google AI Studio <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Lựa chọn Mô hình AI (Gemini 3.8, 3.7, 3.6, 3.5 Flash Lite) */}
        <div className="mt-5 p-4 rounded-xl bg-midnight-950/90 border border-sakura-500/30 text-xs space-y-3">
          <p className="font-bold text-sakura-300 flex items-center gap-1.5 text-sm">
            <Cpu className="w-4 h-4" />
            Lựa chọn Mô hình AI & Quy tắc Ưu tiên
          </p>
          <div className="space-y-2 text-slate-300 font-mono text-[11px]">
            <div className="p-2.5 rounded-lg bg-midnight-900/80 border border-sakura-500/30">
              <span className="text-sakura-300 font-bold">1. Gemini 3.8 Flash (Mạnh nhất & Khuyên dùng):</span>
              <p className="text-slate-400 mt-0.5">Khả năng phân tích tư duy logic và cấu trúc dữ liệu đa tầng tốt nhất. Thích hợp cho hầu hết bài toán thi đấu.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-midnight-900/80 border border-slate-700">
              <span className="text-sky-300 font-bold">2. Gemini 3.7 Flash (Cân bằng):</span>
              <p className="text-slate-400 mt-0.5">Cân bằng tối ưu giữa tốc độ phản hồi và độ chính xác của giải thuật.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-midnight-900/80 border border-slate-700">
              <span className="text-amber-300 font-bold">3. Gemini 3.6 Flash (Ổn định):</span>
              <p className="text-slate-400 mt-0.5">Tốc độ sinh nhanh, thích hợp cho các bài toán kinh điển (mảng, xâu, cây, đồ thị cơ bản).</p>
            </div>
            <div className="p-2.5 rounded-lg bg-midnight-900/80 border border-slate-700">
              <span className="text-emerald-300 font-bold">4. Gemini 3.5 Flash Lite (Tiết kiệm Token):</span>
              <p className="text-slate-400 mt-0.5">Phù hợp cho bài toán cơ bản hoặc khi bạn muốn tiết kiệm hạn mức token tối đa.</p>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-sakura-500/10 border border-sakura-500/40 text-sakura-200 text-[11px] leading-relaxed">
            💡 <b>Khuyến nghị ưu tiên:</b> Nên chọn ưu tiên từ <b>Gemini 3.8 Flash</b> rồi về dần (<b>3.7 → 3.6 → 3.5 Flash Lite</b>) nếu gặp bài toán phức tạp mà 3.5 Flash Lite đang xử lý chưa ổn định.
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-midnight-950/60 border border-midnight-800 flex items-start gap-2.5 text-[11px] text-slate-400">
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
