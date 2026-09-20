import React from 'react';
import { Key, HelpCircle, Terminal, Cpu } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  onOpenGuideModal: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  onOpenApiKeyModal,
  onOpenGuideModal,
  selectedModel,
  onSelectModel
}) => {
  return (
    <header className="w-full py-4 px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 z-10 relative">
      {/* Brand Logo & Info */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-midnight-900 border border-sakura-500/40 shadow-sakura-glow flex items-center justify-center text-sakura-400">
          <Terminal className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Algo<span className="text-sakura-400">Vision</span>
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-midnight-800 border border-sakura-500/30 text-sakura-300">
              created by Crabrian
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Trực quan hóa đề bài và custom test cho các bài toán CP
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {/* Bộ chọn Model trên Header */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-midnight-900/90 border border-midnight-700 text-xs font-mono text-slate-300 shadow-inner">
          <Cpu className="w-3.5 h-3.5 text-sakura-400 shrink-0" />
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer pr-1"
            title="Chọn Gemini Model để trực quan hóa"
          >
            <option value="gemini-3.8-flash" className="bg-midnight-950 text-slate-200">
              ⚡ 3.8 Flash (Bài phức tạp • 20 lượt/ngày)
            </option>
            <option value="gemini-3.5-flash-lite" className="bg-midnight-950 text-slate-200">
              ⚖️ 3.5 Flash Lite (Cân bằng • 500 lượt/ngày)
            </option>
            <option value="gemini-3.1-flash-lite" className="bg-midnight-950 text-slate-200">
              🚀 3.1 Flash Lite (Bài dễ • 500 lượt/ngày)
            </option>
          </select>
        </div>

        <button
          onClick={onOpenGuideModal}
          className="sakura-btn-secondary text-xs py-2 px-3"
          title="Cách lấy API Key và dán vào web"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Hướng dẫn</span>
        </button>

        <button
          onClick={onOpenApiKeyModal}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
            hasApiKey
              ? 'bg-midnight-900/90 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'bg-midnight-900/90 text-sakura-400 border-sakura-500/40 shadow-sakura-glow'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>{hasApiKey ? 'API Key: Đã có' : 'Nhập API Key'}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              hasApiKey ? 'bg-emerald-400' : 'bg-sakura-400 animate-pulse'
            }`}
          />
        </button>
      </div>
    </header>
  );
};
