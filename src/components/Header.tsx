import React from 'react';
import { Key, HelpCircle, Terminal, Settings } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface HeaderProps {
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  onOpenGuideModal: () => void;
  onOpenSettings: () => void;
  currentLanguage: Language;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  onOpenApiKeyModal,
  onOpenGuideModal,
  onOpenSettings,
  currentLanguage
}) => {
  const t = translations[currentLanguage];

  return (
    <header className="w-[94%] max-w-[1650px] mx-auto py-4 px-4 sm:px-8 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 relative">
      {/* Brand Logo & Info */}
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-lg transition-all"
          style={{
            backgroundColor: 'rgba(var(--theme-card-rgb, 9, 14, 29), 0.75)',
            borderColor: 'var(--glass-border, rgba(255, 255, 255, 0.12))',
            color: 'var(--theme-accent, #ff7597)',
            boxShadow: '0 0 20px var(--theme-accent-glow, rgba(255, 117, 151, 0.3))'
          }}
        >
          <Terminal className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Algo<span style={{ color: 'var(--theme-accent, #ff7597)' }}>Vision</span>
            </h1>
            <span
              className="text-[11px] font-mono px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'rgba(var(--theme-card-rgb, 9, 14, 29), 0.8)',
                borderColor: 'var(--glass-border, rgba(255, 255, 255, 0.12))',
                color: 'var(--theme-accent, #ff7597)'
              }}
            >
              {t.headerCreatedBy}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {t.headerSubtitle}
          </p>
        </div>
      </div>

      {/* Actions: 3 Icon-Only Buttons */}
      <div className="flex items-center justify-center gap-2.5">
        {/* 1. Nút Hướng dẫn: Chỉ để lại logo, không cho chữ */}
        <button
          onClick={onOpenGuideModal}
          className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md group"
          style={{
            backgroundColor: 'rgba(var(--theme-card-rgb, 9, 14, 29), calc(var(--glass-opacity, 0.7) + 0.1))',
            backdropFilter: 'blur(12px)',
            borderColor: 'var(--glass-border, rgba(255, 255, 255, 0.15))',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
          }}
          title={t.guideBtn ? `${t.guideBtn} (Hướng dẫn sử dụng & Lựa chọn Model)` : 'Hướng dẫn sử dụng & Lựa chọn Model'}
        >
          <HelpCircle className="w-5 h-5 text-slate-200 group-hover:text-white transition-colors" />
        </button>

        {/* 2. Nút API Key: Chỉ để lại logo, nếu CÓ thì ĐỎ, KHÔNG CÓ thì XANH */}
        <button
          onClick={onOpenApiKeyModal}
          className={`w-10 h-10 rounded-xl relative flex items-center justify-center border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
            hasApiKey
              ? 'bg-rose-950/60 text-rose-400 border-rose-500/50 shadow-[0_0_16px_rgba(244,63,94,0.35)]'
              : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50 shadow-[0_0_16px_rgba(16,185,129,0.35)]'
          }`}
          style={{
            backdropFilter: 'blur(12px)'
          }}
          title={
            hasApiKey
              ? 'Gemini API Key: Đã có (Đỏ) • Bấm để quản lý hoặc đổi Key'
              : 'Gemini API Key: Chưa có (Xanh) • Bấm để lấy Key miễn phí'
          }
        >
          <Key className="w-4 h-4" />
          <span
            className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
              hasApiKey
                ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                : 'bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]'
            }`}
          />
        </button>

        {/* 3. Nút Cài đặt: Chỉ để lại logo bánh răng */}
        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md select-none group"
          style={{
            backgroundColor: 'rgba(var(--theme-card-rgb, 9, 14, 29), calc(var(--glass-opacity, 0.7) + 0.1))',
            backdropFilter: 'blur(12px)',
            borderColor: 'var(--glass-border, rgba(255, 255, 255, 0.15))',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
          }}
          title={t.settingsBtn ? `${t.settingsBtn} (Theme, Độ trong suốt, Ngôn ngữ, API Key)` : 'Cài đặt hệ thống'}
        >
          <Settings
            className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90"
            style={{ color: 'var(--theme-accent, #ff7597)' }}
          />
        </button>
      </div>
    </header>
  );
};
