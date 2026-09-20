import React from 'react';
import { Key, Sparkles, HelpCircle, Code2 } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  onOpenGuideModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  onOpenApiKeyModal,
  onOpenGuideModal
}) => {
  return (
    <header className="w-full py-5 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-neu-bg shadow-neu-flat flex items-center justify-center text-blue-500">
          <Code2 className="w-7 h-7 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-gray-800">
              Algo<span className="text-blue-500">Vision</span>
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neu-bg shadow-neu-pressed text-blue-500">
              AI v2.0
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Trực quan hóa đề bài & thuật toán với Gemini 2.0 Flash
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Guide Button */}
        <button
          onClick={onOpenGuideModal}
          className="neu-btn text-xs py-2 px-3.5"
          title="Xem hướng dẫn triển khai GitHub / Vercel"
        >
          <HelpCircle className="w-4 h-4 text-gray-600" />
          <span className="hidden md:inline">Hướng dẫn Deploy</span>
        </button>

        {/* API Key Status & Button */}
        <button
          onClick={onOpenApiKeyModal}
          className={`neu-btn text-xs py-2 px-3.5 flex items-center gap-2 ${
            hasApiKey ? 'text-emerald-600' : 'text-amber-600'
          }`}
        >
          <Key className="w-4 h-4" />
          <span className="font-semibold">
            {hasApiKey ? 'Đã có API Key' : 'Chưa có API Key'}
          </span>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              hasApiKey
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                : 'bg-amber-500 animate-pulse'
            }`}
          />
        </button>

        {/* Powered by Gemini Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neu-bg shadow-neu-pressed text-xs font-semibold text-gray-600">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Gemini 2.0 Flash</span>
        </div>
      </div>
    </header>
  );
};
