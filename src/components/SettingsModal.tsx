import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Palette,
  Globe,
  Sliders,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { ThemeId, THEMES_LIST } from '../types/themes';
import { Language, translations } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (newKey: string) => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  currentLanguage: Language;
  onChangeLanguage: (lang: Language) => void;
  glassOpacity: number;
  onChangeGlassOpacity: (val: number) => void;
}

type TabType = 'apiKey' | 'theme' | 'language' | 'transparency';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  currentTheme,
  onSelectTheme,
  currentLanguage,
  onChangeLanguage,
  glassOpacity,
  onChangeGlassOpacity
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('theme');
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showPassword, setShowPassword] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  // Sync tempApiKey when modal opens or apiKey changes
  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const t = translations[currentLanguage];

  const handleSaveKey = () => {
    onSaveApiKey(tempApiKey.trim());
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleClearKey = () => {
    setTempApiKey('');
    onSaveApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      {/* Modal Container with Liquid Glass Effect & Fixed Proportions for all 4 tabs */}
      <div
        className="w-full max-w-4xl h-[680px] max-h-[88vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: `rgba(var(--theme-card-rgb, 9, 14, 29), 0.88)`,
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderColor: 'var(--glass-border, rgba(255, 255, 255, 0.15))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200">
              <Sliders className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {t.settingsTitle}
              </h2>
              <p className="text-xs text-slate-400">
                AlgoVision Configuration & Customization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-white/10 overflow-x-auto bg-black/20">
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'bg-white/15 text-white shadow-sm border border-white/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Palette className="w-4 h-4" style={{ color: activeTab === 'theme' ? 'var(--theme-accent)' : undefined }} />
            <span>{t.tabTheme} ({THEMES_LIST.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transparency')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'transparency'
                ? 'bg-white/15 text-white shadow-sm border border-white/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" style={{ color: activeTab === 'transparency' ? 'var(--theme-accent)' : undefined }} />
            <span>{t.tabTransparency}</span>
          </button>

          <button
            onClick={() => setActiveTab('language')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'language'
                ? 'bg-white/15 text-white shadow-sm border border-white/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Globe className="w-4 h-4" style={{ color: activeTab === 'language' ? 'var(--theme-accent)' : undefined }} />
            <span>{t.tabLanguage}</span>
          </button>

          <button
            onClick={() => setActiveTab('apiKey')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'apiKey'
                ? 'bg-white/15 text-white shadow-sm border border-white/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Key className="w-4 h-4" style={{ color: activeTab === 'apiKey' ? 'var(--theme-accent)' : undefined }} />
            <span>{t.tabApiKey}</span>
            <span
              className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-400' : 'bg-rose-400'}`}
            />
          </button>
        </div>

        {/* Tab Content Body - Fixed flex-1 to keep all 4 tabs at exactly the same window size */}
        <div className="p-6 overflow-y-auto flex-1 bg-black/10">
          {/* ==================== TAB 1: THEMES (60 FPS NATIVE PIXEL CANVAS) ==================== */}
          {activeTab === 'theme' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{t.themeListTitle}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Động cơ Pixel Canvas 60 FPS nguyên bản • Cảnh quan đồ họa chi tiết cao & thời tiết sống động
                    </p>
                  </div>
                </div>
                <span className="text-xs text-emerald-300 font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex-shrink-0">
                  {THEMES_LIST.length} Pixel Themes (60 FPS)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {THEMES_LIST.map((theme) => {
                  const isSelected = currentTheme === theme.id;
                  const themeName = theme.name[currentLanguage] || theme.name.en;
                  const themeDesc = theme.desc[currentLanguage] || theme.desc.en;
                  const toneDesc = theme.toneDesc[currentLanguage] || theme.toneDesc.en;

                  return (
                    <div
                      key={theme.id}
                      onClick={() => onSelectTheme(theme.id)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-white/15 shadow-lg border-white/40 ring-2'
                          : 'bg-black/30 hover:bg-white/5 border-white/10 hover:border-white/25'
                      }`}
                      style={{
                        ringColor: isSelected ? theme.colors.accent : undefined
                      }}
                    >
                      {/* Top Row: STT, Name, Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono font-bold flex items-center justify-center text-slate-300">
                            {theme.stt}
                          </span>
                          <span className="font-bold text-white text-sm">
                            {themeName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isSelected ? (
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shadow-sm"
                              style={{
                                backgroundColor: theme.colors.accent,
                                color: theme.colors.accentText
                              }}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              {t.themeSelected}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono font-medium text-slate-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              60 FPS
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description & Scenery */}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {themeDesc}
                      </p>

                      {/* Palette Swatches & Tone */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                        <span className="text-slate-400 truncate max-w-[200px]" title={toneDesc}>
                          {toneDesc}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {theme.colors.swatches.map((color, cIdx) => (
                            <div
                              key={cIdx}
                              className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== TAB 2: TRANSPARENCY & LIQUID GLASS ==================== */}
          {activeTab === 'transparency' && (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto py-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>{t.transparencyTitle}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {t.transparencyDesc}
                </p>
              </div>

              {/* Slider Control */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    {t.opacityLabel}:
                  </span>
                  <span
                    className="text-sm font-mono font-bold px-2.5 py-0.5 rounded-lg border border-white/10"
                    style={{ color: 'var(--theme-accent)', backgroundColor: 'rgba(0,0,0,0.4)' }}
                  >
                    {glassOpacity}%
                  </span>
                </div>

                <input
                  type="range"
                  min="15"
                  max="95"
                  step="1"
                  value={glassOpacity}
                  onChange={(e) => onChangeGlassOpacity(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                {/* Preset Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => onChangeGlassOpacity(25)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      glassOpacity === 25
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {t.presetUltraGlass}
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeGlassOpacity(50)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      glassOpacity === 50
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {t.presetLiquid}
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeGlassOpacity(75)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      glassOpacity === 75
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {t.presetBalanced}
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeGlassOpacity(95)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      glassOpacity === 95
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {t.presetSolid}
                  </button>
                </div>
              </div>

              {/* Live Preview Card showcasing the Glass Effect */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.previewCardTitle}
                </span>
                <div
                  className="p-6 rounded-2xl border transition-all duration-200"
                  style={{
                    backgroundColor: `rgba(var(--theme-card-rgb), ${glassOpacity / 100})`,
                    backdropFilter: `blur(${Math.round(12 + (1 - glassOpacity / 100) * 16)}px) saturate(170%)`,
                    WebkitBackdropFilter: `blur(${Math.round(12 + (1 - glassOpacity / 100) * 16)}px) saturate(170%)`,
                    borderColor: `rgba(255, 255, 255, ${(0.08 + (1 - glassOpacity / 100) * 0.15).toFixed(3)})`,
                    boxShadow: '0 10px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.18)'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide"
                      style={{
                        backgroundColor: 'var(--theme-accent)',
                        color: 'var(--theme-accent-text)'
                      }}
                    >
                      {t.previewGlassBadge}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      Alpha: {(glassOpacity / 100).toFixed(2)} | Blur: {Math.round(12 + (1 - glassOpacity / 100) * 16)}px
                    </span>
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed font-sans">
                    {t.previewCardDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: LANGUAGE ==================== */}
          {activeTab === 'language' && (
            <div className="flex flex-col gap-5 max-w-xl mx-auto py-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                  <span>{t.languageTitle}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {t.langAutoDetectNote}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Vietnamese */}
                <div
                  onClick={() => onChangeLanguage('vi')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    currentLanguage === 'vi'
                      ? 'bg-white/15 border-white/40 shadow-md ring-2 ring-emerald-400/50'
                      : 'bg-black/30 hover:bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇻🇳</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {t.langVi}
                      </h4>
                      <p className="text-xs text-slate-400 font-sans">
                        Tiếng Việt - Tự động nhận diện cho người dùng Việt Nam
                      </p>
                    </div>
                  </div>
                  {currentLanguage === 'vi' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* English */}
                <div
                  onClick={() => onChangeLanguage('en')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    currentLanguage === 'en'
                      ? 'bg-white/15 border-white/40 shadow-md ring-2 ring-emerald-400/50'
                      : 'bg-black/30 hover:bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇬🇧</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {t.langEn}
                      </h4>
                      <p className="text-xs text-slate-400 font-sans">
                        English - International Competitive Programming format
                      </p>
                    </div>
                  </div>
                  {currentLanguage === 'en' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Chinese */}
                <div
                  onClick={() => onChangeLanguage('zh')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    currentLanguage === 'zh'
                      ? 'bg-white/15 border-white/40 shadow-md ring-2 ring-emerald-400/50'
                      : 'bg-black/30 hover:bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇨🇳</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {t.langZh}
                      </h4>
                      <p className="text-xs text-slate-400 font-sans">
                        简体中文 - 专为算法竞赛与可视化测试设计
                      </p>
                    </div>
                  </div>
                  {currentLanguage === 'zh' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 4: API KEY ==================== */}
          {activeTab === 'apiKey' && (
            <div className="flex flex-col gap-5 max-w-xl mx-auto py-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-400" />
                    <span>{t.apiKeyLabel}</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {apiKey ? t.apiKeyActive : t.apiKeyEmpty}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    apiKey
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-400' : 'bg-rose-400 animate-ping'}`}
                  />
                  {apiKey ? 'Active' : 'Missing'}
                </span>
              </div>

              {/* Input field with show/hide toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={t.apiKeyPlaceholder}
                  className="w-full sakura-input pr-12 text-sm font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveKey}
                  className="sakura-btn-primary flex-grow text-xs py-3"
                >
                  {saveFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{t.saveApiKeyBtn}</span>
                    </>
                  )}
                </button>

                {apiKey && (
                  <button
                    onClick={handleClearKey}
                    className="sakura-btn-secondary text-xs py-3 px-4 text-rose-400 hover:text-rose-300 border-rose-500/30"
                  >
                    {t.clearApiKeyBtn}
                  </button>
                )}
              </div>

              {/* Security Note & Link */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2 text-xs text-slate-400">
                <p className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{t.apiKeySecurityNote}</span>
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold underline mt-1"
                >
                  <span>{t.getFreeKeyLink}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 flex items-center justify-end bg-black/30">
          <button
            onClick={onClose}
            className="sakura-btn-secondary text-xs py-2 px-5"
          >
            {t.guideClose}
          </button>
        </div>
      </div>
    </div>
  );
};
