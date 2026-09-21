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

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={onOpenGuideModal}
          className="sakura-btn-secondary text-xs py-2 px-3"
          title="Cách lấy API Key và dán vào web"
        >
          <HelpCircle className="w-4 h-4 text-slate-300" />
          <span>{t.guideBtn}</span>
        </button>

        <button
          onClick={onOpenApiKeyModal}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
            hasApiKey
              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'text-amber-300 border-amber-500/40'
          }`}
          style={{
            backdropFilter: 'blur(10px)',
            backgroundColor: hasApiKey ? undefined : 'rgba(var(--theme-card-rgb), 0.7)'
          }}
        >
          <Key className="w-3.5 h-3.5" />
          <span>{hasApiKey ? t.apiKeyBtnActive : t.apiKeyBtnNone}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              hasApiKey ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
            }`}
          />
        </button>

        {/* Cài đặt (Settings) Gear Button in Top Right Corner */}
        <button
          onClick={onOpenSettings}
          className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer select-none group"
          style={{
            backgroundColor: 'rgba(var(--theme-card-rgb, 9, 14, 29), calc(var(--glass-opacity, 0.7) + 0.1))',
            backdropFilter: 'blur(12px)',
            borderColor: 'var(--glass-border, rgba(255, 255, 255, 0.15))',
            color: '#f8fafc',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
          }}
          title={t.settingsBtn}
        >
          <Settings
            className="w-4 h-4 transition-transform duration-500 group-hover:rotate-90"
            style={{ color: 'var(--theme-accent, #ff7597)' }}
          />
          <span>{t.settingsBtn}</span>
        </button>
      </div>
    </header>
  );
};
