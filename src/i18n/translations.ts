export type Language = 'vi' | 'en' | 'zh';

export const getBrowserLanguage = (): Language => {
  const saved = localStorage.getItem('algonav_language');
  if (saved === 'vi' || saved === 'en' || saved === 'zh') {
    return saved;
  }
  const nav = (navigator.language || '').toLowerCase();
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('vi')) return 'vi';
  return 'en';
};

export const translations = {
  vi: {
    // Header
    headerTitle: 'AlgoVision',
    headerCreatedBy: 'created by Crabrian',
    headerSubtitle: 'Trực quan hóa đề bài và custom test cho các bài toán CP',
    guideBtn: 'Hướng dẫn',
    apiKeyBtnActive: 'API Key: Đã có',
    apiKeyBtnNone: 'Nhập API Key',
    settingsBtn: 'Cài đặt',

    // Settings
    settingsTitle: 'Cài đặt hệ thống',
    tabApiKey: 'API Key',
    tabTheme: 'Theme',
    tabLanguage: 'Ngôn ngữ',
    tabTransparency: 'Độ trong suốt',

    // Settings - Transparency
    transparencyTitle: 'Hiệu ứng Apple Liquid Glass',
    transparencyDesc: 'Tăng giảm độ trong suốt của các khung panel để lộ khung cảnh pixel động tuyệt đẹp phía sau.',
    opacityLabel: 'Độ đục bề mặt kính',
    presetUltraGlass: 'Siêu mờ (25%)',
    presetLiquid: 'Mờ dịu (50%)',
    presetBalanced: 'Cân bằng (75%)',
    presetSolid: 'Đậm (95%)',
    previewCardTitle: 'Thử nghiệm hiệu ứng kính',
    previewCardDesc: 'Khung này mô phỏng chuẩn giao diện Liquid Glass với độ mờ thực tế bạn đang chỉnh.',
    previewGlassBadge: 'Liquid Glass Active',

    // Settings - API Key
    apiKeyLabel: 'Google Gemini API Key',
    apiKeyActive: 'Đã lưu khóa API sẵn sàng',
    apiKeyEmpty: 'Chưa có API Key',
    apiKeyPlaceholder: 'Dán mã AIzaSy... của bạn vào đây',
    saveApiKeyBtn: 'Lưu API Key',
    clearApiKeyBtn: 'Xóa khóa',
    apiKeySecurityNote: 'Khóa API chỉ lưu cục bộ trên trình duyệt của bạn (LocalStorage) và không bao giờ gửi đi đâu khác.',
    getFreeKeyLink: 'Nhận API Key miễn phí từ Google AI Studio ↗',

    // Settings - Theme
    themeListTitle: 'Chọn Chủ đề Pixel & Cảnh quan',
    themeSelected: 'Đang áp dụng',
    themeDynamicEffects: 'Hiệu ứng động',
    bgEngineTitle: 'Chế độ hiển thị nền',
    bgEngineCanvas: 'Động cơ Pixel Canvas (60 FPS)',
    bgEngineGif: 'Ảnh động Pixel GIF (Live Wallpaper)',
    gifPresetsTitle: 'Bộ sưu tập Pixel GIF tuyệt đẹp',
    customGifTitle: 'Nhập link hoặc tải ảnh GIF tùy chọn',
    customGifPlaceholder: 'Dán liên kết GIF (https://...gif)...',
    applyGifBtn: 'Áp dụng',
    clearGifBtn: 'Xóa GIF',
    uploadGifBtn: 'Tải GIF từ máy',
    gifActiveBadge: 'GIF Active',

    // Settings - Language
    languageTitle: 'Chọn ngôn ngữ giao diện',
    langAutoDetectNote: 'Mặc định khi mở trang sẽ tự động nhận diện theo ngôn ngữ trình duyệt của bạn.',
    langVi: 'Tiếng Việt',
    langEn: 'English',
    langZh: '简体中文',

    // ProblemInput
    tabImage: 'Ảnh chụp đề (Ctrl + V)',
    tabText: 'Văn bản đề bài',
    dragOrPaste: 'Kéo thả hoặc nhấn tải ảnh lên (Hỗ trợ Ctrl + V dán trực tiếp)',
    textPlaceholder: 'Dán nội dung đề bài, quy cách input/output hoặc testcase vào đây...',
    sampleInputLabel: 'Input mẫu (tùy chọn)',
    sampleInputPlaceholder: 'Ví dụ:\n4 5\n1 2 10\n2 3 5...',
    sampleOutputLabel: 'Output mẫu (tùy chọn)',
    sampleOutputPlaceholder: 'Ví dụ:\nYES\n15',
    runMeBtn: 'Run Me',
    runningBtn: 'Đang xử lý...',
    missingKeyWarn: 'Vui lòng nạp Gemini API Key trong mục Cài đặt trước khi chạy!',

    // StepControls
    stepText: 'Bước',
    speedText: 'Tốc độ',
    resetBtn: 'Về đầu',
    prevBtn: 'Lùi',
    nextBtn: 'Tiến',
    playBtn: 'Phát',
    pauseBtn: 'Dừng',

    // VisualizerCanvas
    emptyCanvasTitle: 'Chưa có đề bài nào được nạp',
    emptyCanvasDesc: 'Hãy dán ảnh chụp đề hoặc nhập văn bản ở trên, sau đó nhấn Run Me để trực quan hóa từng bước thuật toán.',
    interactiveDrag: 'Di chuyển visual',
    resetDrag: 'Đặt lại vị trí',
    graphInfo: 'Đồ thị',
    treeInfo: 'Cây',
    variablesTitle: 'Biến & Trạng thái',

    // Guide Modal
    guideTitle: 'Hướng dẫn sử dụng AlgoVision',
    guideClose: 'Đóng'
  },

  en: {
    // Header
    headerTitle: 'AlgoVision',
    headerCreatedBy: 'created by Crabrian',
    headerSubtitle: 'Visualize problem statements and testcases for Competitive Programming',
    guideBtn: 'Guide',
    apiKeyBtnActive: 'API Key: Active',
    apiKeyBtnNone: 'Enter API Key',
    settingsBtn: 'Settings',

    // Settings
    settingsTitle: 'System Settings',
    tabApiKey: 'API Key',
    tabTheme: 'Theme',
    tabLanguage: 'Language',
    tabTransparency: 'Transparency',

    // Settings - Transparency
    transparencyTitle: 'Apple Liquid Glass Effect',
    transparencyDesc: 'Adjust container transparency to showcase the vivid pixel animated landscape underneath.',
    opacityLabel: 'Surface Opacity Level',
    presetUltraGlass: 'Ultra Glass (25%)',
    presetLiquid: 'Liquid Glass (50%)',
    presetBalanced: 'Balanced (75%)',
    presetSolid: 'Solid (95%)',
    previewCardTitle: 'Live Glass Preview',
    previewCardDesc: 'This card renders Apple Liquid Glass specular frosting with your current opacity level.',
    previewGlassBadge: 'Liquid Glass Active',

    // Settings - API Key
    apiKeyLabel: 'Google Gemini API Key',
    apiKeyActive: 'API Key is active and ready',
    apiKeyEmpty: 'No API Key configured',
    apiKeyPlaceholder: 'Paste your AIzaSy... key here',
    saveApiKeyBtn: 'Save API Key',
    clearApiKeyBtn: 'Remove Key',
    apiKeySecurityNote: 'Your API key is saved solely in your local browser storage (LocalStorage) and never transmitted elsewhere.',
    getFreeKeyLink: 'Get a free API Key from Google AI Studio ↗',

    // Settings - Theme
    themeListTitle: 'Select Pixel Scenery & Theme',
    themeSelected: 'Active',
    themeDynamicEffects: 'Dynamic Effects',
    bgEngineTitle: 'Background Render Mode',
    bgEngineCanvas: 'Pixel Canvas Engine (60 FPS)',
    bgEngineGif: 'Live Pixel GIF Wallpaper',
    gifPresetsTitle: 'Curated Aesthetic Pixel GIFs',
    customGifTitle: 'Custom GIF Link or Upload',
    customGifPlaceholder: 'Paste GIF image link (https://...gif)...',
    applyGifBtn: 'Apply',
    clearGifBtn: 'Clear GIF',
    uploadGifBtn: 'Upload GIF',
    gifActiveBadge: 'GIF Active',

    // Settings - Language
    languageTitle: 'Display Language',
    langAutoDetectNote: 'Defaults automatically to your web browser system language.',
    langVi: 'Tiếng Việt',
    langEn: 'English',
    langZh: '简体中文',

    // ProblemInput
    tabImage: 'Problem Screenshot (Ctrl + V)',
    tabText: 'Problem Text',
    dragOrPaste: 'Drag & drop or click to upload (Supports direct Ctrl + V paste)',
    textPlaceholder: 'Paste problem text, statement, constraints or sample testcases here...',
    sampleInputLabel: 'Sample Input (Optional)',
    sampleInputPlaceholder: 'e.g.:\n4 5\n1 2 10\n2 3 5...',
    sampleOutputLabel: 'Sample Output (Optional)',
    sampleOutputPlaceholder: 'e.g.:\nYES\n15',
    runMeBtn: 'Run Me',
    runningBtn: 'Analyzing...',
    missingKeyWarn: 'Please configure your Gemini API Key in Settings before running!',

    // StepControls
    stepText: 'Step',
    speedText: 'Speed',
    resetBtn: 'Reset',
    prevBtn: 'Prev',
    nextBtn: 'Next',
    playBtn: 'Play',
    pauseBtn: 'Pause',

    // VisualizerCanvas
    emptyCanvasTitle: 'No problem loaded yet',
    emptyCanvasDesc: 'Paste a problem screenshot or description above, then click Run Me to visualize the step-by-step algorithm.',
    interactiveDrag: 'Interactive Drag',
    resetDrag: 'Reset Layout',
    graphInfo: 'Graph',
    treeInfo: 'Tree',
    variablesTitle: 'Variables & State',

    // Guide Modal
    guideTitle: 'AlgoVision User Guide',
    guideClose: 'Close'
  },

  zh: {
    // Header
    headerTitle: 'AlgoVision',
    headerCreatedBy: 'created by Crabrian',
    headerSubtitle: '竞赛算法题目与自定义测试用例动态可视化平台',
    guideBtn: '使用指南',
    apiKeyBtnActive: 'API 密钥: 已就绪',
    apiKeyBtnNone: '输入 API 密钥',
    settingsBtn: '系统偏好设置',

    // Settings
    settingsTitle: '系统偏好设置',
    tabApiKey: 'API 密钥',
    tabTheme: '界面主题',
    tabLanguage: '语言选择',
    tabTransparency: '透明毛玻璃',

    // Settings - Transparency
    transparencyTitle: 'Apple 液态毛玻璃效果 (Liquid Glass)',
    transparencyDesc: '调节各交互面板的透明度，令底层精致的像素动态景致若隐若现。',
    opacityLabel: '面板表面不透明度',
    presetUltraGlass: '超透质感 (25%)',
    presetLiquid: '柔和液态 (50%)',
    presetBalanced: '平衡模式 (75%)',
    presetSolid: '纯净实色 (95%)',
    previewCardTitle: '实时毛玻璃质感预览',
    previewCardDesc: '此卡片展示当前透明度参数下的苹果级磨砂镜面反射与模糊质感。',
    previewGlassBadge: '液态毛玻璃已启用',

    // Settings - API Key
    apiKeyLabel: 'Google Gemini API 密钥',
    apiKeyActive: 'API 密钥已配置并就绪',
    apiKeyEmpty: '尚未配置 API 密钥',
    apiKeyPlaceholder: '在此粘贴您的 AIzaSy... 密钥',
    saveApiKeyBtn: '保存 API 密钥',
    clearApiKeyBtn: '清除密钥',
    apiKeySecurityNote: '密钥仅存储在您的本地浏览器（LocalStorage）中，绝不会外发。',
    getFreeKeyLink: '前往 Google AI Studio 免费获取密钥 ↗',

    // Settings - Theme
    themeListTitle: '选择像素景致与配色主题',
    themeSelected: '已应用',
    themeDynamicEffects: '动态景观效果',
    bgEngineTitle: '背景渲染模式',
    bgEngineCanvas: '原生像素 Canvas 引擎 (60 FPS)',
    bgEngineGif: '精选像素 GIF 动态壁纸',
    gifPresetsTitle: '精选治愈系像素 GIF 图库',
    customGifTitle: '自定义 GIF 链接或本地上传',
    customGifPlaceholder: '粘贴 GIF 动图链接 (https://...gif)...',
    applyGifBtn: '应用',
    clearGifBtn: '清除 GIF',
    uploadGifBtn: '本地上传 GIF',
    gifActiveBadge: 'GIF 生效中',

    // Settings - Language
    languageTitle: '界面显示语言',
    langAutoDetectNote: '初次加载时将自动依据您的浏览器系统语言自动匹配。',
    langVi: 'Tiếng Việt',
    langEn: 'English',
    langZh: '简体中文',

    // ProblemInput
    tabImage: '题目截图 (Ctrl + V)',
    tabText: '题目文本输入',
    dragOrPaste: '拖放或点击上传图片（支持全局 Ctrl + V 直接粘贴）',
    textPlaceholder: '在此粘贴题目描述、输入输出规范或样例数据...',
    sampleInputLabel: '样例输入（可选）',
    sampleInputPlaceholder: '例如：\n4 5\n1 2 10\n2 3 5...',
    sampleOutputLabel: '样例输出（可选）',
    sampleOutputPlaceholder: '例如：\nYES\n15',
    runMeBtn: 'Run Me',
    runningBtn: '正在解析...',
    missingKeyWarn: '请先在系统设置中填入 Gemini API 密钥后再运行！',

    // StepControls
    stepText: '步骤',
    speedText: '播放速度',
    resetBtn: '重置',
    prevBtn: '上一步',
    nextBtn: '下一步',
    playBtn: '播放',
    pauseBtn: '暂停',

    // VisualizerCanvas
    emptyCanvasTitle: '暂未载入任何题目',
    emptyCanvasDesc: '请在上方粘贴题目截图或文本，然后点击 Run Me 即可逐步直观演示算法执行过程。',
    interactiveDrag: '自由拖拽节点',
    resetDrag: '重置布局',
    graphInfo: '图结构',
    treeInfo: '树结构',
    variablesTitle: '监视变量与状态',

    // Guide Modal
    guideTitle: 'AlgoVision 使用指引',
    guideClose: '关闭'
  }
};
