import React from 'react';
import { X, Globe, GitBranch, Key, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neu-bg rounded-3xl shadow-neu-flat-lg p-6 sm:p-8 relative border border-white/40">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-neu-bg shadow-neu-flat active:shadow-neu-pressed flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-neu-bg shadow-neu-flat flex items-center justify-center text-blue-500">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Hướng dẫn Deploy lên Vercel & GitHub</h2>
            <p className="text-xs text-gray-500">Miễn phí 100%, không cần cấu hình server</p>
          </div>
        </div>

        {/* Security Note */}
        <div className="p-4 rounded-2xl bg-neu-bg shadow-neu-pressed flex items-start gap-3 mb-6 text-xs text-gray-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-gray-700 mb-0.5">Bảo mật & Tự chủ tuyệt đối</p>
            <p>
              Ứng dụng này chạy hoàn toàn trên trình duyệt (Client-side SPA). Khi bạn đưa lên GitHub hay Vercel, mã nguồn <b>hoàn toàn không chứa bất kỳ API Key nào</b>. Người dùng truy cập trang web của bạn sẽ tự nhập API Key của riêng họ (được lưu an toàn trong <code>localStorage</code> của máy họ).
            </p>
          </div>
        </div>

        {/* Step-by-step Guide */}
        <div className="space-y-5">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-neu-bg shadow-neu-flat">
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-gray-800">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>Đẩy mã nguồn lên GitHub</span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Mở terminal tại thư mục dự án và chạy các lệnh sau để tải mã nguồn lên tài khoản GitHub của bạn:
            </p>
            <pre className="p-3 rounded-xl bg-neu-bg shadow-neu-pressed font-mono text-[11px] text-gray-800 overflow-x-auto">
{`git init
git add .
git commit -m "Initial commit - AlgoVision AI"
git branch -M main
git remote add origin https://github.com/USERNAME/algo-visualizer.git
git push -u origin main`}
            </pre>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-neu-bg shadow-neu-flat">
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-gray-800">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>Deploy lên Vercel trong 1 phút</span>
            </div>
            <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1.5 leading-relaxed">
              <li>
                Truy cập <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">vercel.com</a> và đăng nhập bằng tài khoản GitHub.
              </li>
              <li>Bấm nút <b>"Add New..."</b> $\rightarrow$ Chọn <b>"Project"</b>.</li>
              <li>Chọn repository <code>algo-visualizer</code> mà bạn vừa tạo ở Bước 1.</li>
              <li>
                Vercel sẽ tự động phát hiện dự án là <b>Vite + React</b>. Bạn chỉ cần giữ nguyên thiết lập mặc định và bấm <b>"Deploy"</b>.
              </li>
              <li>Sau khoảng 30 giây, bạn sẽ nhận được đường link website (ví dụ: <code>algo-visualizer.vercel.app</code>) để sử dụng và chia sẻ!</li>
            </ol>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-neu-bg shadow-neu-flat">
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-gray-800">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>Sử dụng và chia sẻ</span>
            </div>
            <p className="text-xs text-gray-600">
              Mỗi khi bạn hoặc bạn bè vào trang web, chỉ cần bấm vào nút <b>"Cài đặt API Key"</b> ở góc phải trên, dán API Key lấy miễn phí từ <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">Google AI Studio</a> là có thể bắt đầu sử dụng ngay lập tức!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="neu-btn text-xs py-2.5 px-6 font-bold">
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
