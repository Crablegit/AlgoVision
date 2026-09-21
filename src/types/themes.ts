export type ThemeId =
  | 'sakura-hill'
  | 'yourname-stairs'
  | 'fushimi-torii'
  | 'chureito-fuji'
  | 'miyajima-torii'
  | 'gion-night'
  | 'zen-bamboo'
  | 'tokyo-night'
  | 'hust-parabol'
  | 'anime-sky'
  | 'summer-hill'
  | 'autumn-hill'
  | 'winter-hill'
  | 'cyberpunk-rain'
  | 'synthwave-sunset'
  | 'enchanted-forest'
  | 'desert-oasis'
  | 'cosmic-nebula'
  | 'cozy-library'
  | 'rainy-cafe'
  | 'mountain-peak'
  | 'tropical-ocean'
  | 'sunset-coast'
  | 'shanghai-bund'
  | 'seoul-city'
  | 'atlantis-deep'
  | 'aurora-borealis'
  | 'lofi-bedroom'
  | 'sunset-train'
  | 'midnight-camp'
  | 'pastel-sunset'
  | 'rainy-busstop'
  | 'cyber-ramen'
  | 'floating-islands'
  | 'retro-arcade'
  | 'shrine-waterfall'
  | 'space-station'
  | 'deep-aquarium';

export interface ThemeConfig {
  id: ThemeId;
  stt: number;
  name: {
    vi: string;
    en: string;
    zh: string;
  };
  desc: {
    vi: string;
    en: string;
    zh: string;
  };
  toneDesc: {
    vi: string;
    en: string;
    zh: string;
  };
  colors: {
    bg: string;
    bgGradient: string;
    cardRgb: string;
    accent: string;
    accentGlow: string;
    accentHover: string;
    accentText: string;
    secondaryAccent: string;
    borderColor: string;
    swatches: string[];
  };
}

export const THEMES_LIST: ThemeConfig[] = [
  // ==================== STT 1: SAKURA (MẶC ĐỊNH ĐẦU TIÊN) ====================
  {
    id: 'sakura-hill',
    stt: 1,
    name: {
      vi: 'Đồi hoa anh đào (Mặc định)',
      en: 'Sakura Grand Bloom (Default)',
      zh: '盛景樱树 (默认)'
    },
    desc: {
      vi: 'Cây hoa anh đào đại thụ pixel tráng lệ chiếm trọn góc trên tỏa cành uốn lượn, phả cơn mưa cánh hoa hồng phấp phới qua màn hình.',
      en: 'A magnificent giant pixel cherry blossom tree framing the corner with branches showering pink petals down.',
      zh: '极具东方雅韵的巨幅像素樱花古树盘踞一角，遒劲枝桠向下洒下无尽飞花雨。'
    },
    toneDesc: {
      vi: 'Hồng phấn (#F8BBD0), magenta (#EC407A), ngọc non (#C8E6C9)',
      en: 'Soft Pink (#F8BBD0), Magenta (#EC407A), Sprout Green',
      zh: '樱粉 (#F8BBD0)、洋红 (#EC407A)、嫩绿'
    },
    colors: {
      bg: '#1a0d18',
      bgGradient: 'linear-gradient(180deg, #1f1224 0%, #3b1433 45%, #831843 85%, #be185d 100%)',
      cardRgb: '25, 12, 23',
      accent: '#ff7597',
      accentGlow: 'rgba(255, 117, 151, 0.45)',
      accentHover: '#ff94b1',
      accentText: '#2e0215',
      secondaryAccent: '#f472b6',
      borderColor: 'rgba(244, 114, 182, 0.4)',
      swatches: ['#F8BBD0', '#EC407A', '#C8E6C9', '#C2185B']
    }
  },
  // ==================== 5 JAPANESE ICONIC PIXEL THEMES ====================
  {
    id: 'yourname-stairs',
    stt: 2,
    name: {
      vi: 'Cầu thang Your Name (Suga Shrine)',
      en: 'Your Name Stairs (Suga Shrine)',
      zh: '君之名阶梯 (须贺神社)'
    },
    desc: {
      vi: 'Bậc thang đá Yotsuya kinh điển với lan can sơn son đỏ rực trong ráng chiều hoàng hôn Tokyo, cột điện anime và tà dương ấm áp.',
      en: 'Iconic Yotsuya staircase with crimson lacquered handrails bathed in Tokyo twilight glow, power lines, and falling sunset dust.',
      zh: '经典四谷须贺神社红扶手石阶，落日余晖映照下的东京街景与动漫电线杆剪影。'
    },
    toneDesc: {
      vi: 'Đỏ son lan can (#E11D48), cam hoàng hôn (#F97316), tím sẫm (#4C0519)',
      en: 'Crimson Red (#E11D48), Twilight Orange (#F97316), Deep Dusk Violet',
      zh: '朱红扶手 (#E11D48)、暮霞橙 (#F97316)、暗夜紫'
    },
    colors: {
      bg: '#1c0914',
      bgGradient: 'linear-gradient(180deg, #2d0a1e 0%, #701a38 40%, #ea580c 80%, #fbbf24 100%)',
      cardRgb: '30, 12, 22',
      accent: '#f97316',
      accentGlow: 'rgba(249, 115, 22, 0.45)',
      accentHover: '#fb923c',
      accentText: '#180208',
      secondaryAccent: '#e11d48',
      borderColor: 'rgba(249, 115, 22, 0.35)',
      swatches: ['#E11D48', '#F97316', '#FBBF24', '#4C0519']
    }
  },
  {
    id: 'fushimi-torii',
    stt: 3,
    name: {
      vi: 'Đền Nghìn Cổng Fushimi Inari',
      en: 'Fushimi Inari Senbon Torii',
      zh: '伏见稻荷千本鸟居'
    },
    desc: {
      vi: 'Đường hầm nghìn cổng Torii đỏ cam son uốn lượn xuyên qua rừng thông và tre xanh Kyoto, tượng cáo Kitsune thiêng liêng và đèn lồng đá phong rêu.',
      en: 'Endless tunnel of vermilion Torii gates winding through sacred Kyoto cedar woods, kitsune guardian fox and mossy stone lanterns.',
      zh: '蜿蜒于京都密林间的朱砂红千本鸟居长廊，静穆石灯笼与守护灵狐神像。'
    },
    toneDesc: {
      vi: 'Đỏ cam son Torii (#EA580C), xanh rừng trúc (#064E3B), vàng đèn lồng (#FBBF24)',
      en: 'Vermilion Torii (#EA580C), Deep Forest Green (#064E3B), Lantern Gold',
      zh: '朱砂红 (#EA580C)、竹林深翠 (#064E3B)、灯笼暖金'
    },
    colors: {
      bg: '#081711',
      bgGradient: 'linear-gradient(180deg, #091c14 0%, #064e3b 45%, #9a3412 85%, #c2410c 100%)',
      cardRgb: '8, 26, 18',
      accent: '#ea580c',
      accentGlow: 'rgba(234, 88, 12, 0.45)',
      accentHover: '#f97316',
      accentText: '#ffffff',
      secondaryAccent: '#10b981',
      borderColor: 'rgba(234, 88, 12, 0.4)',
      swatches: ['#EA580C', '#064E3B', '#FBBF24', '#7C2D12']
    }
  },
  {
    id: 'chureito-fuji',
    stt: 4,
    name: {
      vi: 'Chùa Năm Tầng & Núi Phú Sĩ',
      en: 'Chureito Pagoda & Mt. Fuji',
      zh: '忠灵塔与富士雪山'
    },
    desc: {
      vi: 'Chùa tháp 5 tầng đỏ thắm Chureito uy nghiêm bên cành anh đào cổ thụ ngắm trọn ngọn núi Phú Sĩ tuyết trắng sừng sững giữa ráng chiều huyền ảo.',
      en: 'Majestic 5-story crimson Chureito pagoda with ancient sakura branches framing snow-capped Mt. Fuji against mystical dusk skies.',
      zh: '巍峨五重朱塔与古雅樱树枝桠掩映下，雪顶富士山傲然耸立于暮色霞光中。'
    },
    toneDesc: {
      vi: 'Trắng tuyết Fuji (#FFFFFF), đỏ son chùa tháp (#DC2626), tím ráng chiều (#6366F1)',
      en: 'Snow White (#FFFFFF), Pagoda Vermilion (#DC2626), Twilight Indigo',
      zh: '雪峰白 (#FFFFFF)、朱塔赤 (#DC2626)、霞光靛蓝'
    },
    colors: {
      bg: '#0c0f24',
      bgGradient: 'linear-gradient(180deg, #101633 0%, #312e81 40%, #7c2d12 80%, #f43f5e 100%)',
      cardRgb: '14, 18, 40',
      accent: '#f43f5e',
      accentGlow: 'rgba(244, 63, 94, 0.45)',
      accentHover: '#fb7185',
      accentText: '#ffffff',
      secondaryAccent: '#38bdf8',
      borderColor: 'rgba(244, 63, 94, 0.35)',
      swatches: ['#DC2626', '#F43F5E', '#38BDF8', '#FFFFFF']
    }
  },
  {
    id: 'miyajima-torii',
    stt: 5,
    name: {
      vi: 'Cổng Torii Nổi Biển Miyajima',
      en: 'Miyajima Floating Torii',
      zh: '严岛海上大鸟居'
    },
    desc: {
      vi: 'Đại cổng Torii khổng lồ ngự trên làn nước biển xanh ngọc bích triều dâng, sóng nước lăn tăn phản chiếu cột gỗ đỏ son và dãy núi linh thiêng phía xa.',
      en: 'Colossal vermilion Torii standing proudly in turquoise ocean tidal waters with gentle wave reflections and sacred island mountains.',
      zh: '沧海潮起中的巨幅严岛神社朱红大鸟居，清波浩渺映落霞，远山如黛海鸥鸣。'
    },
    toneDesc: {
      vi: 'Đỏ son đại môn (#E11D48), xanh ngọc biển (#0EA5E9), vàng ráng chiều (#FBBF24)',
      en: 'Ocean Torii Red (#E11D48), Turquoise Tide (#0EA5E9), Sunset Gold',
      zh: '大鸟居朱赤 (#E11D48)、海潮青蓝 (#0EA5E9)、落霞鎏金'
    },
    colors: {
      bg: '#061626',
      bgGradient: 'linear-gradient(180deg, #09203f 0%, #0369a1 45%, #b45309 85%, #f59e0b 100%)',
      cardRgb: '8, 28, 48',
      accent: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.45)',
      accentHover: '#7dd3fc',
      accentText: '#041d33',
      secondaryAccent: '#e11d48',
      borderColor: 'rgba(56, 189, 248, 0.35)',
      swatches: ['#E11D48', '#0EA5E9', '#38BDF8', '#FBBF24']
    }
  },
  {
    id: 'gion-night',
    stt: 6,
    name: {
      vi: 'Phố Cổ Gion Kyoto Về Đêm',
      en: 'Kyoto Gion Lantern Street',
      zh: '京都祇园夜町灯影'
    },
    desc: {
      vi: 'Ngõ phố cổ lát đá phiến bóng loáng ướt mưa phản chiếu ánh đèn lồng lụa đỏ vàng ấm cúng, nhà gỗ Machiya truyền thống và cành liễu rủ đung đưa.',
      en: 'Rain-slicked stone cobblestone alleys reflecting warm glowing paper lanterns, traditional Machiya wooden lattices and swaying willows.',
      zh: '细雨微歇的京都石叠古巷，纸灯笼暖晕倒映在湿润青石板上，町家木格栅风雅静谧。'
    },
    toneDesc: {
      vi: 'Vàng lồng đèn ấm (#F59E0B), đỏ rượu Kyoto (#991B1B), nâu gỗ Machiya (#451A03)',
      en: 'Lantern Amber (#F59E0B), Kyoto Burgundy (#991B1B), Machiya Dark Wood',
      zh: '灯笼暖琥珀 (#F59E0B)、祇园深红 (#991B1B)、町家古木黑'
    },
    colors: {
      bg: '#170c06',
      bgGradient: 'linear-gradient(180deg, #1c0e07 0%, #451a03 45%, #78350f 85%, #d97706 100%)',
      cardRgb: '26, 14, 8',
      accent: '#f59e0b',
      accentGlow: 'rgba(245, 158, 11, 0.45)',
      accentHover: '#fbbf24',
      accentText: '#220d02',
      secondaryAccent: '#ef4444',
      borderColor: 'rgba(245, 158, 11, 0.35)',
      swatches: ['#F59E0B', '#991B1B', '#D97706', '#451A03']
    }
  },
  {
    id: 'anime-sky',
    stt: 7,
    name: {
      vi: 'Bầu trời Anime',
      en: 'Anime Sky',
      zh: '动漫天空'
    },
    desc: {
      vi: 'Chân trời trải rộng, các lớp mây pixel nhiều tầng trôi nhẹ nhàng từ trái qua phải.',
      en: 'Expansive anime horizon with multi-layered pixel clouds drifting from left to right.',
      zh: '辽阔的动漫地平线，多层像素云朵自左向右缓缓飘移。'
    },
    toneDesc: {
      vi: 'Xanh pastel (#64B5F6), trắng mây, vàng nắng nhẹ',
      en: 'Pastel Blue (#64B5F6), Cloud White, Sunny Yellow',
      zh: '粉蓝 (#64B5F6)、白云、微阳浅黄'
    },
    colors: {
      bg: '#1a365d',
      bgGradient: 'linear-gradient(180deg, #1e3a8a 0%, #2563eb 45%, #60a5fa 85%, #93c5fd 100%)',
      cardRgb: '15, 32, 67',
      accent: '#facc15',
      accentGlow: 'rgba(250, 204, 21, 0.4)',
      accentHover: '#fde047',
      accentText: '#0f172a',
      secondaryAccent: '#38bdf8',
      borderColor: 'rgba(96, 165, 250, 0.4)',
      swatches: ['#64B5F6', '#F5F5F5', '#FFF59D', '#4DD0E1']
    }
  },
  {
    id: 'summer-hill',
    stt: 8,
    name: {
      vi: 'Đồng cỏ mùa hè',
      en: 'Summer Meadow',
      zh: '夏日原野'
    },
    desc: {
      vi: 'Thảm cỏ pixel xanh ngát điểm hoa dại, cây sồi đại thụ tán rộng tỏa bóng. Chu kỳ 20s gió thổi rung cây làm bay lá xanh.',
      en: 'Lush pixel meadow dotted with flowers and a grand oak tree; 20s wind gusts rustle leaves.',
      zh: '翠绿繁花草甸，一株苍翠巨型橡树庇荫原野，每20秒微风拂落碧绿枝叶。'
    },
    toneDesc: {
      vi: 'Xanh lục tươi (#4CAF50), thiên thanh (#81D4FA), vàng chanh (#FFEE58)',
      en: 'Vibrant Green (#4CAF50), Azure Sky (#81D4FA), Lemon Yellow',
      zh: '翠绿 (#4CAF50)、天蓝 (#81D4FA)、柠檬黄'
    },
    colors: {
      bg: '#064e3b',
      bgGradient: 'linear-gradient(180deg, #0284c7 0%, #38bdf8 50%, #4ade80 75%, #15803d 100%)',
      cardRgb: '10, 37, 24',
      accent: '#22c55e',
      accentGlow: 'rgba(34, 197, 94, 0.45)',
      accentHover: '#4ade80',
      accentText: '#052e16',
      secondaryAccent: '#facc15',
      borderColor: 'rgba(74, 222, 128, 0.35)',
      swatches: ['#4CAF50', '#81D4FA', '#FFEE58', '#FFFFFF']
    }
  },
  {
    id: 'autumn-hill',
    stt: 9,
    name: {
      vi: 'Đồng cỏ mùa thu',
      en: 'Autumn Meadow',
      zh: '秋日枫野'
    },
    desc: {
      vi: 'Thảm cỏ ngả sắc vàng rơm chiều tà, cây phong đại thụ uốn lượn rực rỡ. Chu kỳ 20s gió thổi rụng lá phong đỏ/cam xoáy ốc.',
      en: 'Golden autumn grasses beneath twilight, towering red maple tree; 20s wind swirls leaves in spirals.',
      zh: '暮霭金草漫野，赤红巨型枫树挺拔矗立，每20秒秋风卷起落叶回旋飞舞。'
    },
    toneDesc: {
      vi: 'Cam cháy (#E65100), vàng rơm (#FBC02D), đỏ phong (#D32F2F)',
      en: 'Burnt Orange (#E65100), Golden Straw, Maple Red (#D32F2F)',
      zh: '焦橙 (#E65100)、金黄、枫红 (#D32F2F)'
    },
    colors: {
      bg: '#3f1a0b',
      bgGradient: 'linear-gradient(180deg, #4c1d95 0%, #9a3412 40%, #ea580c 70%, #ca8a04 100%)',
      cardRgb: '45, 18, 12',
      accent: '#f97316',
      accentGlow: 'rgba(249, 115, 22, 0.45)',
      accentHover: '#fb923c',
      accentText: '#1c0a00',
      secondaryAccent: '#eab308',
      borderColor: 'rgba(249, 115, 22, 0.4)',
      swatches: ['#E65100', '#FBC02D', '#D32F2F', '#FFD54F']
    }
  },
  {
    id: 'winter-hill',
    stt: 10,
    name: {
      vi: 'Đồng cỏ mùa đông',
      en: 'Winter Snowscape',
      zh: '冬日雪原'
    },
    desc: {
      vi: 'Thảm tuyết phủ trắng xóa, cây thông tuyết đại thụ bên phải và người tuyết pixel mũ len bên trái cùng tuyết rơi.',
      en: 'Pristine snowy ground with a grand snow-laden pine and cute snowman; gentle snowflakes falling.',
      zh: '无垠静谧雪原，挺立积雪巨松与左侧针织帽雪人，漫天多维像素飞雪。'
    },
    toneDesc: {
      vi: 'Xám lam lạnh (#B0BEC5), trắng tuyết (#ECEFF1), xanh ngọc tuyết (#80DEEA)',
      en: 'Cold Slate Blue (#B0BEC5), Snow White, Ice Turquoise',
      zh: '冷雾蓝 (#B0BEC5)、冰雪白、冰晶翠'
    },
    colors: {
      bg: '#0f172a',
      bgGradient: 'linear-gradient(180deg, #1e293b 0%, #334155 45%, #64748b 80%, #94a3b8 100%)',
      cardRgb: '18, 28, 48',
      accent: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.45)',
      accentHover: '#7dd3fc',
      accentText: '#082f49',
      secondaryAccent: '#ef4444',
      borderColor: 'rgba(148, 163, 184, 0.4)',
      swatches: ['#B0BEC5', '#ECEFF1', '#80DEEA', '#EF5350']
    }
  },
  {
    id: 'cyberpunk-rain',
    stt: 11,
    name: {
      vi: 'Mưa ngõ hẻm Cyberpunk',
      en: 'Cyberpunk Rain',
      zh: '赛博雨巷'
    },
    desc: {
      vi: 'Hẻm phố tương lai neon tím xanh, dây điện chằng chịt, mưa rơi xiên tốc độ cao và chớp sáng.',
      en: 'Neon future alley with tangled cables, high-speed slanted rain and electric flashes.',
      zh: '霓虹闪烁的未来雨巷，电缆交错，高速斜雨划破夜空伴随电光轻闪。'
    },
    toneDesc: {
      vi: 'Tím than đậm (#1A0B2E), xanh cyan (#00F0FF), hồng neon (#FF007F)',
      en: 'Dark Violet (#1A0B2E), Electric Cyan (#00F0FF), Neon Pink',
      zh: '深紫夜 (#1A0B2E)、赛博青 (#00F0FF)、霓虹粉'
    },
    colors: {
      bg: '#0b0416',
      bgGradient: 'linear-gradient(180deg, #090214 0%, #17072e 50%, #260c49 100%)',
      cardRgb: '18, 7, 36',
      accent: '#00f0ff',
      accentGlow: 'rgba(0, 240, 255, 0.55)',
      accentHover: '#67e8f9',
      accentText: '#041d24',
      secondaryAccent: '#ff007f',
      borderColor: 'rgba(0, 240, 255, 0.45)',
      swatches: ['#1A0B2E', '#00F0FF', '#FF007F', '#FFEA00']
    }
  },
  {
    id: 'synthwave-sunset',
    stt: 12,
    name: {
      vi: 'Hoàng hôn Synthwave',
      en: 'Retro Coast',
      zh: '复古海岸'
    },
    desc: {
      vi: 'Biển phẳng, mặt trời sọc ngang khổng lồ lặn dần, cây dừa pixel và sóng dạt nhịp nhàng.',
      en: 'Retro synthwave coast with striped sun, silhouetted palms, and pulsating grid waves.',
      zh: '合成波夕阳海岸，巨型条纹落日沉入水平面，椰树剪影与脉冲海浪轻拍。'
    },
    toneDesc: {
      vi: 'Tím hoàng hôn (#311B92), cam san hô (#FF7043), vàng neon (#FFD600)',
      en: 'Twilight Violet (#311B92), Coral Orange (#FF7043), Neon Gold',
      zh: '暮紫 (#311B92)、珊瑚橙 (#FF7043)、荧光金'
    },
    colors: {
      bg: '#190a3a',
      bgGradient: 'linear-gradient(180deg, #18053a 0%, #3b0764 45%, #831843 75%, #ea580c 100%)',
      cardRgb: '30, 10, 52',
      accent: '#ffd600',
      accentGlow: 'rgba(255, 214, 0, 0.5)',
      accentHover: '#fde047',
      accentText: '#261400',
      secondaryAccent: '#f43f5e',
      borderColor: 'rgba(244, 63, 94, 0.45)',
      swatches: ['#311B92', '#FF7043', '#FFD600', '#E91E63']
    }
  },
  {
    id: 'enchanted-forest',
    stt: 13,
    name: {
      vi: 'Rừng sâu đom đóm',
      en: 'Enchanted Forest',
      zh: '萤火密林'
    },
    desc: {
      vi: 'Cổ thụ rêu phong, nấm phát quang trên mặt đất, bầy đom đóm 2x2 & 3x3 lơ lửng chớp tắt.',
      en: 'Ancient mossy trees, bioluminescent mushrooms, and gently pulsing pixel fireflies.',
      zh: '苔藓覆青石古树，林地发光蘑菇，点点像素萤火虫在幽暗森林中漫舞。'
    },
    toneDesc: {
      vi: 'Xanh rêu tối (#1B5E20), đen chàm (#0A192F), vàng xanh dạ quang (#CCFF00)',
      en: 'Dark Moss (#1B5E20), Midnight Teal (#0A192F), Chartreuse Glow',
      zh: '苔绿 (#1B5E20)、靛青 (#0A192F)、夜光黄绿'
    },
    colors: {
      bg: '#051b11',
      bgGradient: 'linear-gradient(180deg, #022c22 0%, #064e3b 50%, #022c22 100%)',
      cardRgb: '8, 30, 20',
      accent: '#ccff00',
      accentGlow: 'rgba(204, 255, 0, 0.5)',
      accentHover: '#d9f99d',
      accentText: '#142900',
      secondaryAccent: '#10b981',
      borderColor: 'rgba(52, 211, 153, 0.4)',
      swatches: ['#1B5E20', '#0A192F', '#CCFF00', '#00E676']
    }
  },
  {
    id: 'desert-oasis',
    stt: 14,
    name: {
      vi: 'Sa mạc ốc đảo',
      en: 'Desert Oasis & Stars',
      zh: '沙漠绿洲与星空'
    },
    desc: {
      vi: 'Cồn cát nhấp nhô dưới bầu trời đêm sao, lùm cọ và hồ nước phản chiếu, sao băng mỗi 25s.',
      en: 'Rolling sand dunes under starry skies with an oasis pool; shooting stars every 25s.',
      zh: '星空下起伏的沙漠沙丘，绿洲碧波倒映棕榈，每25秒划过一道流星。'
    },
    toneDesc: {
      vi: 'Xanh coban đêm (#0D1B2A), cát mịn (#E0A96D), ngọc ốc đảo (#2EC4B6)',
      en: 'Night Cobalt (#0D1B2A), Sand Dune (#E0A96D), Oasis Teal',
      zh: '深空钴蓝 (#0D1B2A)、细沙金 (#E0A96D)、绿洲碧'
    },
    colors: {
      bg: '#08111e',
      bgGradient: 'linear-gradient(180deg, #030712 0%, #0c1c38 55%, #1e3a5f 80%, #78350f 100%)',
      cardRgb: '12, 25, 45',
      accent: '#2ec4b6',
      accentGlow: 'rgba(46, 196, 182, 0.45)',
      accentHover: '#5eead4',
      accentText: '#042f2e',
      secondaryAccent: '#fbbf24',
      borderColor: 'rgba(46, 196, 182, 0.4)',
      swatches: ['#0D1B2A', '#E0A96D', '#2EC4B6', '#FFF176']
    }
  },
  {
    id: 'cosmic-nebula',
    stt: 15,
    name: {
      vi: 'Trạm vũ trụ',
      en: 'Cosmic Nebula',
      zh: '星云空间站'
    },
    desc: {
      vi: 'Cửa sổ vòm trạm vũ trụ nhìn ra dải tinh vân tím huyền ảo, bụi không gian và đèn điều khiển.',
      en: 'Space station dome viewport looking onto a vibrant spiral nebula with blinking console LEDs.',
      zh: '空间站穹顶舷窗眺望壮阔旋转星云，舱外星尘微粒漂浮，操作面板指示灯规律闪烁。'
    },
    toneDesc: {
      vi: 'Đen vũ trụ (#0B0C10), tím tinh vân (#7B2CBF), xanh neon (#66FCF1)',
      en: 'Cosmic Black (#0B0C10), Nebula Purple (#7B2CBF), Neon Cyan',
      zh: '宇宙黑 (#0B0C10)、星云紫 (#7B2CBF)、控制台青'
    },
    colors: {
      bg: '#05070e',
      bgGradient: 'linear-gradient(180deg, #020307 0%, #1e0b38 45%, #3c096c 80%, #100624 100%)',
      cardRgb: '12, 10, 26',
      accent: '#66fcf1',
      accentGlow: 'rgba(102, 252, 241, 0.5)',
      accentHover: '#a5f3fc',
      accentText: '#082f49',
      secondaryAccent: '#c084fc',
      borderColor: 'rgba(102, 252, 241, 0.4)',
      swatches: ['#0B0C10', '#7B2CBF', '#66FCF1', '#FF6D00']
    }
  },
  {
    id: 'cozy-library',
    stt: 16,
    name: {
      vi: 'Thư viện cổ bên lò sưởi',
      en: 'Cozy Library',
      zh: '壁炉古书馆'
    },
    desc: {
      vi: 'Kệ sách cao kịch trần, lò sưởi đá bập bùng ánh lửa ấm cúng và làn khói mảnh lượn lên ống khói.',
      en: 'Floor-to-ceiling bookshelves framing a warm stone fireplace with dancing flames & embers.',
      zh: '通顶古旧书架掩映着石砌壁炉，温暖像素火苗跳动投下柔光，细烟升入烟囱。'
    },
    toneDesc: {
      vi: 'Nâu gỗ trầm (#3E2723), vàng hổ phách (#FFA000), đỏ cam lửa (#FF5722)',
      en: 'Deep Timber (#3E2723), Amber Gold, Flame Orange (#FF5722)',
      zh: '沉稳木棕 (#3E2723)、琥珀金、火红暖橙'
    },
    colors: {
      bg: '#20110c',
      bgGradient: 'linear-gradient(180deg, #180905 0%, #2e1309 50%, #451a03 100%)',
      cardRgb: '38, 20, 14',
      accent: '#ff5722',
      accentGlow: 'rgba(255, 87, 34, 0.5)',
      accentHover: '#ff7a50',
      accentText: '#2b0900',
      secondaryAccent: '#f59e0b',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      swatches: ['#3E2723', '#FFA000', '#FF5722', '#FFE082']
    }
  },
  {
    id: 'rainy-cafe',
    stt: 17,
    name: {
      vi: 'Quán cà phê chiều mưa',
      en: 'Rainy Cafe',
      zh: '雨日咖啡馆'
    },
    desc: {
      vi: 'Khung cửa kính nhìn ra phố ướt mưa, ly cà phê bốc hơi nghi ngút và giọt nước trượt dài trên kính.',
      en: 'Cozy glass cafe window overlooking rainy streets; hot steaming coffee and water droplets.',
      zh: '临街大玻璃窗外细雨蒙蒙，桌上热咖啡升起袅袅白汽，雨滴在玻璃表面缓缓滑落。'
    },
    toneDesc: {
      vi: 'Nâu cà phê (#4E342E), xám khói mưa (#78909C), vàng đèn ấm (#FFB300)',
      en: 'Coffee Roast (#4E342E), Rain Slate (#78909C), Warm Tungsten',
      zh: '醇香咖啡棕 (#4E342E)、烟雨灰、暖灯黄'
    },
    colors: {
      bg: '#1c1514',
      bgGradient: 'linear-gradient(180deg, #151110 0%, #261d1c 45%, #334155 85%, #1e293b 100%)',
      cardRgb: '32, 24, 23',
      accent: '#ffb300',
      accentGlow: 'rgba(255, 179, 0, 0.45)',
      accentHover: '#fcd34d',
      accentText: '#261700',
      secondaryAccent: '#ff8a65',
      borderColor: 'rgba(255, 179, 0, 0.35)',
      swatches: ['#4E342E', '#78909C', '#FFB300', '#FF8A65']
    }
  },
  {
    id: 'mountain-peak',
    stt: 18,
    name: {
      vi: 'Đỉnh núi mây ngàn',
      en: 'Mountain Peak',
      zh: '云海绝巅'
    },
    desc: {
      vi: 'Mỏm đá phủ băng tuyết nhìn xuống biển mây cuồn cuộn bình minh, đại bàng sải cánh bay lượn.',
      en: 'Snowy alpine cliffs looking over sea of clouds at dawn with a soaring mountain eagle.',
      zh: '巍峨覆雪绝壁俯瞰破晓云海，苍鹰舒展双翼在辽阔苍穹与群峰间翱翔。'
    },
    toneDesc: {
      vi: 'Xanh navy (#1A237E), trắng tuyết chói (#FFFFFF), vàng rạng đông (#FFB300)',
      en: 'Mountain Navy (#1A237E), Snow Glare, Dawn Gold',
      zh: '极巅深蓝 (#1A237E)、耀雪白、初阳金'
    },
    colors: {
      bg: '#0c102b',
      bgGradient: 'linear-gradient(180deg, #090c24 0%, #1e1b4b 40%, #312e81 70%, #f59e0b 100%)',
      cardRgb: '18, 22, 55',
      accent: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.5)',
      accentHover: '#7dd3fc',
      accentText: '#082f49',
      secondaryAccent: '#fbbf24',
      borderColor: 'rgba(56, 189, 248, 0.4)',
      swatches: ['#1A237E', '#FFFFFF', '#FFB300', '#FF8A80']
    }
  },
  {
    id: 'tropical-ocean',
    stt: 19,
    name: {
      vi: 'Biển nhiệt đới',
      en: 'Tropical Ocean',
      zh: '热带碧海'
    },
    desc: {
      vi: 'Bờ biển cát trắng mịn, nước biển ngọc bích trong vắt, sóng vỗ bờ nhịp nhàng cùng rùa biển bơi lội.',
      en: 'Crystal clear turquoise ocean with gentle rhythmic waves washing over fine white sand.',
      zh: '晶莹清透的青绿色热带海洋，柔波轻拍细白沙滩，海龟游弋于珊瑚礁旁。'
    },
    toneDesc: {
      vi: 'Xanh ngọc bích (#00B4D8), cát trắng (#FFF8E7), xanh lơ (#90E0EF)',
      en: 'Turquoise Teal (#00B4D8), White Sand (#FFF8E7), Aqua Foam',
      zh: '绿松青 (#00B4D8)、白沙细浪、清透水蓝'
    },
    colors: {
      bg: '#032541',
      bgGradient: 'linear-gradient(180deg, #0077b6 0%, #00b4d8 45%, #90e0ef 80%, #fff8e7 100%)',
      cardRgb: '3, 45, 75',
      accent: '#00b4d8',
      accentGlow: 'rgba(0, 180, 216, 0.5)',
      accentHover: '#48cae4',
      accentText: '#02182b',
      secondaryAccent: '#ffb703',
      borderColor: 'rgba(0, 180, 216, 0.45)',
      swatches: ['#0077B6', '#00B4D8', '#90E0EF', '#FFF8E7']
    }
  },
  {
    id: 'sunset-coast',
    stt: 20,
    name: {
      vi: 'Bờ biển hải đăng',
      en: 'Lighthouse Coast',
      zh: '灯塔海岸'
    },
    desc: {
      vi: 'Vách đá sừng sững bên bờ biển chiều tà, ngọn hải đăng quét chùm sáng 360 độ rọi sóng đêm.',
      en: 'Dramatic coastal cliffs with a working pixel lighthouse sweeping its golden beam over rolling waves.',
      zh: '暮色崖岸巍峨高耸，像素古老灯塔在澎湃浪花之上旋转扫射金黄导引光束。'
    },
    toneDesc: {
      vi: 'Cam hoàng hôn (#FF6F00), tím sẫm (#3E2723), vàng đèn biển (#FFD54F)',
      en: 'Sunset Amber (#FF6F00), Deep Umber, Beacon Gold (#FFD54F)',
      zh: '暮霭赤橙 (#FF6F00)、玄岩赭、灯塔金黄'
    },
    colors: {
      bg: '#250e04',
      bgGradient: 'linear-gradient(180deg, #370617 0%, #6a040f 40%, #d00000 70%, #ffba08 100%)',
      cardRgb: '42, 16, 8',
      accent: '#ffba08',
      accentGlow: 'rgba(255, 186, 8, 0.5)',
      accentHover: '#ffdd00',
      accentText: '#260a00',
      secondaryAccent: '#e85d04',
      borderColor: 'rgba(255, 186, 8, 0.4)',
      swatches: ['#370617', '#9D0208', '#FFBA08', '#03071E']
    }
  },
  {
    id: 'tokyo-night',
    stt: 21,
    name: {
      vi: 'Tokyo Neon Night',
      en: 'Tokyo Neon Night',
      zh: '东京霓虹夜'
    },
    desc: {
      vi: 'Tháp Tokyo đỏ cam rực rỡ nổi bật giữa bầu trời đêm, đoàn tàu điện pixel lướt qua đường ray trên cao.',
      en: 'Glowing crimson Tokyo Tower silhouette against midnight skies with elevated trains speeding by.',
      zh: '绯红醒目的东京铁塔屹立夜幕，高架轨道上发光像素电车呼啸而过。'
    },
    toneDesc: {
      vi: 'Đỏ cam Tokyo (#FF3366), đen chàm (#0B0C10), xanh neon (#00F5D4)',
      en: 'Tokyo Crimson (#FF3366), Midnight Navy, Mint Neon (#00F5D4)',
      zh: '东京绯红 (#FF3366)、极夜蓝、薄荷霓虹'
    },
    colors: {
      bg: '#070913',
      bgGradient: 'linear-gradient(180deg, #05060f 0%, #0f1224 50%, #20132b 100%)',
      cardRgb: '14, 16, 35',
      accent: '#ff3366',
      accentGlow: 'rgba(255, 51, 102, 0.5)',
      accentHover: '#ff668f',
      accentText: '#21000a',
      secondaryAccent: '#00f5d4',
      borderColor: 'rgba(255, 51, 102, 0.45)',
      swatches: ['#0B0C10', '#FF3366', '#7928CA', '#00F5D4']
    }
  },
  {
    id: 'shanghai-bund',
    stt: 22,
    name: {
      vi: 'Bến Thượng Hải',
      en: 'Shanghai Bund & Pearl',
      zh: '上海滩外滩'
    },
    desc: {
      vi: 'Tháp Minh Châu Phương Đông lộng lẫy với các khối cầu ngọc đổi màu phản chiếu trên dòng sông Hoàng Phố.',
      en: 'Oriental Pearl Tower with radiant spheres and Bund architecture reflecting on the Huangpu River.',
      zh: '东方明珠广播电视塔璀璨球体流光溢彩，倒映在波光粼粼的黄浦江水面之上。'
    },
    toneDesc: {
      vi: 'Tím than đêm (#1A052E), hồng tháp (#FF007F), vàng ánh kim (#FFD700)',
      en: 'Shanghai Violet (#1A052E), Pearl Magenta (#FF007F), Golden Glare',
      zh: '沪上紫夜 (#1A052E)、明珠粉红 (#FF007F)、外滩流金'
    },
    colors: {
      bg: '#120421',
      bgGradient: 'linear-gradient(180deg, #0a0214 0%, #1f0538 45%, #3d0859 85%, #6b114d 100%)',
      cardRgb: '26, 8, 45',
      accent: '#ff007f',
      accentGlow: 'rgba(255, 0, 127, 0.55)',
      accentHover: '#ff409f',
      accentText: '#260013',
      secondaryAccent: '#ffd700',
      borderColor: 'rgba(255, 0, 127, 0.45)',
      swatches: ['#1A052E', '#FF007F', '#FFD700', '#00D2FF']
    }
  },
  {
    id: 'seoul-city',
    stt: 23,
    name: {
      vi: 'Seoul Namsan Night',
      en: 'Seoul Namsan Night',
      zh: '首尔南山夜'
    },
    desc: {
      vi: 'Tháp Namsan Seoul Tower rực rỡ trên đỉnh núi, mái ngói truyền thống Hanok và những vệt đèn xe lấp lánh.',
      en: 'N Seoul Tower beacon glowing above Namsan mountain with Hanok roofs and pulsing city traffic lights.',
      zh: '首尔南山塔在苍茫山峦顶端绽放光芒，前景韩屋飞檐与现代流光车灯相映成趣。'
    },
    toneDesc: {
      vi: 'Xanh tím đậm (#150E28), đỏ gạch ngói (#8D2121), vàng ấm (#FFC107)',
      en: 'Deep Indigo (#150E28), Hanok Tile Red (#8D2121), Warm Amber',
      zh: '苍穹深靛 (#150E28)、传统砖瓦赤、暖金灯火'
    },
    colors: {
      bg: '#0c0818',
      bgGradient: 'linear-gradient(180deg, #070410 0%, #150e28 50%, #28143a 100%)',
      cardRgb: '18, 12, 34',
      accent: '#ffb703',
      accentGlow: 'rgba(255, 183, 3, 0.5)',
      accentHover: '#ffc83b',
      accentText: '#2b1700',
      secondaryAccent: '#06d6a0',
      borderColor: 'rgba(255, 183, 3, 0.4)',
      swatches: ['#150E28', '#8D2121', '#FFB703', '#06D6A0']
    }
  },
  {
    id: 'hust-parabol',
    stt: 24,
    name: {
      vi: 'Cổng Parabol Bách Khoa Hà Nội (Kỳ Vĩ)',
      en: 'HUST Monumental Parabol Gate',
      zh: '河内科技大学大抛物线校门'
    },
    desc: {
      vi: 'Cổng Parabol Đại học Bách Khoa Hà Nội sừng sững uy nghi với vòm cong bê tông cốt thép khổng lồ, tòa nhà C1 trang nghiêm phía sau và rặng xà cừ đại thụ trút mưa lá vàng.',
      en: 'Monumental parabolic arch of Hanoi University of Science & Technology, C1 university hall, grand base pedestals and swirling golden mahogany leaves.',
      zh: '河内理工大学气势磅礴的巨幅白色抛物线校门，映衬庄重C1主楼与参天百年古树漫天金黄落叶。'
    },
    toneDesc: {
      vi: 'Trắng vòm (#FFFFFF), đỏ Bách Khoa (#C62828), xanh xà cừ (#2E7D32), vàng lá (#FBC02D)',
      en: 'Arch White, HUST Crimson (#C62828), Canopy Green, Leaf Gold',
      zh: '拱门纯白、百科赤红 (#C62828)、古树深绿、金黄落叶'
    },
    colors: {
      bg: '#140306',
      bgGradient: 'linear-gradient(180deg, #1c060b 0%, #3e0c15 45%, #681523 80%, #9e1d30 100%)',
      cardRgb: '30, 8, 14',
      accent: '#ef4444',
      accentGlow: 'rgba(239, 68, 68, 0.55)',
      accentHover: '#f87171',
      accentText: '#ffffff',
      secondaryAccent: '#fbbf24',
      borderColor: 'rgba(239, 68, 68, 0.45)',
      swatches: ['#FFFFFF', '#C62828', '#2E7D32', '#FBC02D']
    }
  },
  {
    id: 'atlantis-deep',
    stt: 25,
    name: {
      vi: 'Thành phố Atlantis',
      en: 'Atlantis Deep Sea',
      zh: '亚特兰蒂斯深海'
    },
    desc: {
      vi: 'Thành phố cổ chìm sâu dưới lòng biển thẳm, cung điện và cột đá chạm trổ, tia nắng khúc xạ và đàn cá bơi lội.',
      en: 'Submerged ancient city with marble pillars, glowing coral reefs, and schools of pixel fish.',
      zh: '沉入幽蓝深海的宏伟古代神庙与大理石列柱，光柱折射穿透水流，鱼群盘旋游戈。'
    },
    toneDesc: {
      vi: 'Xanh thẳm đại dương (#001E3D), ngọc bích dạ quang (#00E5FF), vàng cổ (#FFB300)',
      en: 'Abyssal Blue (#001E3D), Luminous Cyan (#00E5FF), Ancient Gold',
      zh: '幽邃深渊蓝 (#001E3D)、荧光水青 (#00E5FF)、古迹暗金'
    },
    colors: {
      bg: '#010d1a',
      bgGradient: 'linear-gradient(180deg, #000913 0%, #001e3d 45%, #003566 85%, #001220 100%)',
      cardRgb: '4, 25, 48',
      accent: '#00e5ff',
      accentGlow: 'rgba(0, 229, 255, 0.55)',
      accentHover: '#6effff',
      accentText: '#00252b',
      secondaryAccent: '#ffd166',
      borderColor: 'rgba(0, 229, 255, 0.45)',
      swatches: ['#001E3D', '#00E5FF', '#FFB300', '#06D6A0']
    }
  },
  {
    id: 'aurora-borealis',
    stt: 26,
    name: {
      vi: 'Bắc Cực quang',
      en: 'Aurora Borealis',
      zh: '北极光之夜'
    },
    desc: {
      vi: 'Dải cực quang xanh ngọc uốn lượn huyền ảo trên bầu trời đêm sao, rừng thông kim tuyết trắng và mặt hồ băng soi bóng.',
      en: 'Ethereal emerald and violet aurora curtains waving across a starry night above snowy pine forests.',
      zh: '瑰丽翠绿与幽紫极光帘幕在浩瀚繁星夜空中流转舒展，倒映于冰原针叶林与冰湖镜面。'
    },
    toneDesc: {
      vi: 'Đen Bắc Cực (#050914), lục bảo cực quang (#00FF87), tím huyền diệu (#60EFFF)',
      en: 'Arctic Void (#050914), Aurora Green (#00FF87), Mystic Violet',
      zh: '极地深黑 (#050914)、极光翡绿 (#00FF87)、空灵蓝紫'
    },
    colors: {
      bg: '#03060f',
      bgGradient: 'linear-gradient(180deg, #02040a 0%, #05131f 45%, #0a252f 85%, #03080e 100%)',
      cardRgb: '8, 20, 32',
      accent: '#00ff87',
      accentGlow: 'rgba(0, 255, 135, 0.55)',
      accentHover: '#5affad',
      accentText: '#012914',
      secondaryAccent: '#60efff',
      borderColor: 'rgba(0, 255, 135, 0.45)',
      swatches: ['#050914', '#00FF87', '#60EFFF', '#B5179E']
    }
  },
  // ==================== CÁC THEME PIXEL NHẸ NHÀNG MỚI (STT 27 - 32) ====================
  {
    id: 'lofi-bedroom',
    stt: 27,
    name: {
      vi: 'Phòng Lofi đêm ấm cúng',
      en: 'Cozy Lofi Bedroom',
      zh: '温暖Lofi卧室'
    },
    desc: {
      vi: 'Bàn học bên khung cửa sổ ngắm trăng, chú mèo pixel cuộn tròn thở nhẹ trên bệ cửa sổ, ánh đèn bàn vàng dịu êm.',
      en: 'Cozy bedroom desk beside moonlit window; a sleeping pixel cat breathing rhythmically on the sill.',
      zh: '月夜窗畔温馨书桌，像素小猫在窗台上安然蜷睡均匀呼吸，柔和暖黄台灯相伴。'
    },
    toneDesc: {
      vi: 'Tím oải hương dịu (#6D597A), vàng đèn ngủ (#E56B6F), cam hồng (#EAAC8B)',
      en: 'Lavender Mute (#6D597A), Warm Rose (#E56B6F), Peach Amber',
      zh: '静谧薰衣草紫 (#6D597A)、暖光柔粉、蜜桃暖橙'
    },
    colors: {
      bg: '#1b1322',
      bgGradient: 'linear-gradient(180deg, #140d1c 0%, #281934 45%, #3d234a 80%, #542b47 100%)',
      cardRgb: '30, 20, 42',
      accent: '#eaac8b',
      accentGlow: 'rgba(234, 172, 139, 0.5)',
      accentHover: '#f3c6af',
      accentText: '#261205',
      secondaryAccent: '#e56b6f',
      borderColor: 'rgba(234, 172, 139, 0.4)',
      swatches: ['#6D597A', '#B56576', '#E56B6F', '#EAAC8B']
    }
  },
  {
    id: 'sunset-train',
    stt: 28,
    name: {
      vi: 'Chuyến tàu hoàng hôn',
      en: 'Sunset Train Journey',
      zh: '落日列车漫旅'
    },
    desc: {
      vi: 'Khung cửa sổ toa tàu nhìn ra đồng quê ráng chiều vàng cam, rèm cửa khẽ bay, cột điện lùi dần êm ả về sau.',
      en: 'Looking out a peaceful train carriage window onto glowing sunset fields; curtains gently swaying.',
      zh: '安详列车车窗眺望夕阳晚霞铺满麦野，暖色窗帘轻拂，电线杆与远树徐徐后移。'
    },
    toneDesc: {
      vi: 'Cam đào pastel (#F4A261), vàng mơ (#E9C46A), xanh ráng chiều (#264653)',
      en: 'Pastel Peach (#F4A261), Apricot Gold (#E9C46A), Dusk Teal',
      zh: '柔桃暮橙 (#F4A261)、杏黄晚霞 (#E9C46A)、暗影青'
    },
    colors: {
      bg: '#1d171e',
      bgGradient: 'linear-gradient(180deg, #1e1322 0%, #44222f 40%, #873e3a 70%, #d47a4c 100%)',
      cardRgb: '36, 22, 34',
      accent: '#f4a261',
      accentGlow: 'rgba(244, 162, 97, 0.5)',
      accentHover: '#f6b885',
      accentText: '#2e1200',
      secondaryAccent: '#e9c46a',
      borderColor: 'rgba(244, 162, 97, 0.4)',
      swatches: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261']
    }
  },
  {
    id: 'zen-bamboo',
    stt: 29,
    name: {
      vi: 'Vườn thiền trúc Nhật Bản',
      en: 'Zen Bamboo Garden',
      zh: '静心竹林禅苑'
    },
    desc: {
      vi: 'Rừng trúc xanh mát rợp bóng, vòi nước tre Shishi-odoshi gõ nhịp "cốc" êm ả bên hồ hoa sen tĩnh lặng.',
      en: 'Serene green bamboo grove with a wooden water fountain tipping into a tranquil lotus pond.',
      zh: '清幽葱郁竹林深处，添水竹笕（鹿威）徐徐注水敲击石苔，荡开圈圈澄澈涟漪。'
    },
    toneDesc: {
      vi: 'Xanh trúc thanh tịnh (#52B788), xanh rêu (#2D6A4F), ngọc bích êm (#74C69D)',
      en: 'Bamboo Green (#52B788), Forest Moss (#2D6A4F), Pale Mint',
      zh: '禅竹苍翠 (#52B788)、幽苔深青 (#2D6A4F)、淡玉碧'
    },
    colors: {
      bg: '#061711',
      bgGradient: 'linear-gradient(180deg, #04140f 0%, #0d281e 45%, #1b4332 80%, #2d6a4f 100%)',
      cardRgb: '10, 32, 24',
      accent: '#52b788',
      accentGlow: 'rgba(82, 183, 136, 0.5)',
      accentHover: '#74c69d',
      accentText: '#041f14',
      secondaryAccent: '#95d5b2',
      borderColor: 'rgba(82, 183, 136, 0.4)',
      swatches: ['#1B4332', '#2D6A4F', '#52B788', '#95D5B2']
    }
  },
  {
    id: 'midnight-camp',
    stt: 30,
    name: {
      vi: 'Lửa trại đêm dưới ngàn sao',
      en: 'Midnight Campfire',
      zh: '星空营火之夜'
    },
    desc: {
      vi: 'Rừng thông tĩnh mịch, lều vải nhỏ bên đống lửa trại bập bùng ấm áp, dải Ngân Hà lấp lánh êm đềm.',
      en: 'Tranquil pine campsite with a glowing tent, crackling warm campfire, and a starry Milky Way.',
      zh: '静谧松林露营地，暖橙帐篷伴着噼啪作响的篝火微光，浩渺银河静静流淌。'
    },
    toneDesc: {
      vi: 'Xanh chàm đêm (#0F172A), vàng ấm lửa (#F59E0B), cam hồng (#EF4444)',
      en: 'Indigo Void (#0F172A), Campfire Amber (#F59E0B), Ember Red',
      zh: '极夜幽靛 (#0F172A)、营火暖金 (#F59E0B)、余烬橙红'
    },
    colors: {
      bg: '#080d19',
      bgGradient: 'linear-gradient(180deg, #030712 0%, #0c1527 50%, #172554 100%)',
      cardRgb: '12, 20, 38',
      accent: '#f59e0b',
      accentGlow: 'rgba(245, 158, 11, 0.5)',
      accentHover: '#fbbf24',
      accentText: '#261400',
      secondaryAccent: '#f97316',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      swatches: ['#0F172A', '#1E293B', '#F59E0B', '#EF4444']
    }
  },
  {
    id: 'pastel-sunset',
    stt: 31,
    name: {
      vi: 'Hoàng hôn pastel mây hồng',
      en: 'Pastel Twilight',
      zh: '粉彩暮霭霞光'
    },
    desc: {
      vi: 'Bầu trời kẹo ngọt tím hồng siêu êm dịu, mây pixel bồng bềnh trôi nhẹ, mặt nước phản chiếu gam màu chữa lành.',
      en: 'Dreamy cotton candy pastel sunset sky with fluffy drifting clouds and calming pastel water reflections.',
      zh: '治愈系粉紫棉花糖晚霞，蓬松像素云朵静谧飘荡，水波荡漾着温柔梦幻倒影。'
    },
    toneDesc: {
      vi: 'Hồng pastel (#F7CAD0), tím nhạt (#C8B6FF), vàng kem (#FFD6A5)',
      en: 'Pastel Blush (#F7CAD0), Dream Violet (#C8B6FF), Cream Gold',
      zh: '蜜粉霞光 (#F7CAD0)、梦幻幽紫 (#C8B6FF)、奶油暖金'
    },
    colors: {
      bg: '#1c1527',
      bgGradient: 'linear-gradient(180deg, #180f24 0%, #3a224c 45%, #69386d 75%, #a25c7e 100%)',
      cardRgb: '34, 24, 46',
      accent: '#f7cad0',
      accentGlow: 'rgba(247, 202, 208, 0.5)',
      accentHover: '#ffdde2',
      accentText: '#2b0914',
      secondaryAccent: '#c8b6ff',
      borderColor: 'rgba(247, 202, 208, 0.4)',
      swatches: ['#FFC6FF', '#BDB2FF', '#F7CAD0', '#FFD6A5']
    }
  },
  {
    id: 'rainy-busstop',
    stt: 32,
    name: {
      vi: 'Trạm xe buýt chiều mưa',
      en: 'Rainy Bus Stop',
      zh: '雨中小站亭'
    },
    desc: {
      vi: 'Trạm chờ xe buýt ven đường quê vắng, ánh đèn đường vàng ấm rọi qua làn mưa bụi nhẹ nhàng rơi.',
      en: 'Quiet countryside bus shelter with a glowing warm streetlamp in gentle falling drizzle.',
      zh: '乡间路旁清冷雨中巴士站，暖黄街灯在淅淅沥沥细雨蒙蒙中透出宁静微光。'
    },
    toneDesc: {
      vi: 'Xám lam khói (#64748B), vàng đèn đường (#FBBF24), chàm sẫm (#1E293B)',
      en: 'Slate Drizzle (#64748B), Streetlamp Gold (#FBBF24), Dark Indigo',
      zh: '烟雨雾灰 (#64748B)、路灯暖黄 (#FBBF24)、幽蓝墨色'
    },
    colors: {
      bg: '#0e1422',
      bgGradient: 'linear-gradient(180deg, #090e18 0%, #151e30 50%, #202b40 100%)',
      cardRgb: '18, 25, 42',
      accent: '#fbbf24',
      accentGlow: 'rgba(251, 191, 36, 0.5)',
      accentHover: '#fde047',
      accentText: '#261400',
      secondaryAccent: '#38bdf8',
      borderColor: 'rgba(251, 191, 36, 0.4)',
      swatches: ['#1E293B', '#334155', '#64748B', '#FBBF24']
    }
  },
  // ==================== 6 CREATIVE PIXEL THEMES (STT 33-38) ====================
  {
    id: 'cyber-ramen',
    stt: 33,
    name: {
      vi: 'Quán mì Ramen Cyberpunk',
      en: 'Cyberpunk Ramen Bar',
      zh: '赛博全息拉面馆'
    },
    desc: {
      vi: 'Quán mì đêm hẻm phố tương lai, bảng hiệu holographic bát mì tỏa khói nghi ngút, đèn lồng đỏ chao liệng và xe bay lướt qua.',
      en: 'Futuristic night alley ramen bar with steaming holographic noodle signs, swaying red lanterns and passing hovercars.',
      zh: '未来霓虹雨巷拉面摊，全息热气拉面招牌烁动，红灯笼摇曳，飞车穿梭夜空。'
    },
    toneDesc: {
      vi: 'Đỏ đèn lồng (#F43F5E), vàng mì (#FBBF24), xanh cyan (#00F0FF)',
      en: 'Lantern Crimson (#F43F5E), Noodle Gold (#FBBF24), Cyber Cyan',
      zh: '朱红灯影 (#F43F5E)、暖面浅金 (#FBBF24)、赛博青'
    },
    colors: {
      bg: '#0c0414',
      bgGradient: 'linear-gradient(180deg, #090112 0%, #1a0628 45%, #2e0842 80%, #450a36 100%)',
      cardRgb: '22, 8, 30',
      accent: '#f43f5e',
      accentGlow: 'rgba(244, 63, 94, 0.55)',
      accentHover: '#fb7185',
      accentText: '#2e020d',
      secondaryAccent: '#fbbf24',
      borderColor: 'rgba(244, 63, 94, 0.4)',
      swatches: ['#F43F5E', '#FBBF24', '#00F0FF', '#7928CA']
    }
  },
  {
    id: 'floating-islands',
    stt: 34,
    name: {
      vi: 'Lâu đài bay Laputa trên mây',
      en: 'Sky Castle Laputa Ruins',
      zh: '天空之城漂浮遗迹'
    },
    desc: {
      vi: 'Quần đảo bay phủ rêu phong lơ lửng giữa tầng mây Ghibli, thác nước đổ thẳng xuống hư không, phi thuyền khổng lồ rẽ mây lướt qua.',
      en: 'Mossy floating sky islands amidst grand Ghibli clouds; waterfalls cascading into the abyss as a giant airship cruises by.',
      zh: '云海之巅的漂浮绿洲遗迹，古岩飞瀑注入苍穹无垠深渊，巨型飞艇穿梭云隙。'
    },
    toneDesc: {
      vi: 'Lam ngọc mây (#38BDF8), xanh ngọc non (#34D399), vàng đá cổ (#FDE047)',
      en: 'Cloud Azure (#38BDF8), Emerald Moss (#34D399), Sun Stone',
      zh: '天穹碧蓝 (#38BDF8)、灵石苍翠 (#34D399)、古岩晨曦'
    },
    colors: {
      bg: '#081e36',
      bgGradient: 'linear-gradient(180deg, #0369a1 0%, #0284c7 40%, #38bdf8 70%, #bae6fd 100%)',
      cardRgb: '12, 38, 68',
      accent: '#38bdf8',
      accentGlow: 'rgba(56, 189, 248, 0.55)',
      accentHover: '#7dd3fc',
      accentText: '#082f49',
      secondaryAccent: '#34d399',
      borderColor: 'rgba(56, 189, 248, 0.4)',
      swatches: ['#0284C7', '#38BDF8', '#34D399', '#FDE047']
    }
  },
  {
    id: 'retro-arcade',
    stt: 35,
    name: {
      vi: 'Phòng máy Arcade thập niên 80',
      en: 'Retro 80s Arcade Room',
      zh: '复古80年代街机厅'
    },
    desc: {
      vi: 'Dãy máy thùng arcade phát sáng CRT, sàn lưới 3D neon tím hồng chuyển động, cần gạt pixel và khe cắm xu nhấp nháy INSERT COIN.',
      en: 'Glowing CRT arcade cabinets with moving 3D neon grid floor, pixel joysticks and blinking INSERT COIN coin doors.',
      zh: '绚丽街机机台CRT屏幕闪烁，透视霓虹网格地面徐徐延展，投币口红光跳动。'
    },
    toneDesc: {
      vi: 'Hồng neon CRT (#EC4899), tím Synth (#8B5CF6), vàng chanh (#FACC15)',
      en: 'CRT Neon Pink (#EC4899), Synth Violet (#8B5CF6), Cyber Lemon',
      zh: '霓虹洋红 (#EC4899)、电波幻紫 (#8B5CF6)、荧光黄'
    },
    colors: {
      bg: '#0d0418',
      bgGradient: 'linear-gradient(180deg, #090112 0%, #1e0735 50%, #380a59 100%)',
      cardRgb: '24, 10, 38',
      accent: '#ec4899',
      accentGlow: 'rgba(236, 72, 153, 0.55)',
      accentHover: '#f472b6',
      accentText: '#2e021a',
      secondaryAccent: '#8b5cf6',
      borderColor: 'rgba(236, 72, 153, 0.4)',
      swatches: ['#EC4899', '#8B5CF6', '#06B6D4', '#FACC15']
    }
  },
  {
    id: 'shrine-waterfall',
    stt: 36,
    name: {
      vi: 'Thác nước & Cổng Torii thần thoại',
      en: 'Sacred Torii Waterfall',
      zh: '神社鸟居清潭飞瀑'
    },
    desc: {
      vi: 'Dòng đại thác đổ ầm ào sau cổng Torii đỏ son linh thiêng, hoa anh đào hồng rụng xoáy trên làn nước trong vắt và đèn đá lung linh.',
      en: 'Majestic roaring waterfall tumbling behind a sacred vermilion Torii gate; cherry petals swirling in turquoise pool.',
      zh: '巍峨朱红大鸟居背倚磅礴清泉瀑布，樱落清潭回旋，石灯笼晕染幽幽暖芒。'
    },
    toneDesc: {
      vi: 'Đỏ son Torii (#EF4444), ngọc bích nước (#06B6D4), hồng phấn (#F472B6)',
      en: 'Torii Vermilion (#EF4444), Turquoise Spring (#06B6D4), Sakura Pink',
      zh: '朱砂绯红 (#EF4444)、澄潭碧色 (#06B6D4)、落樱粉'
    },
    colors: {
      bg: '#041620',
      bgGradient: 'linear-gradient(180deg, #021a24 0%, #063945 45%, #08616d 80%, #0e7490 100%)',
      cardRgb: '10, 34, 44',
      accent: '#ef4444',
      accentGlow: 'rgba(239, 68, 68, 0.55)',
      accentHover: '#f87171',
      accentText: '#260404',
      secondaryAccent: '#22d3ee',
      borderColor: 'rgba(239, 68, 68, 0.4)',
      swatches: ['#EF4444', '#06B6D4', '#22D3EE', '#F472B6']
    }
  },
  {
    id: 'space-station',
    stt: 37,
    name: {
      vi: 'Trạm không gian ngắm tinh vân',
      en: 'Orbital Spaceport Overlook',
      zh: '轨道星港全景视界'
    },
    desc: {
      vi: 'Khoang quan sát kính cong ngắm nhìn tinh vân tím khổng lồ xoáy tròn, hành tinh có vành đai sao lấp lánh và bảng điều khiển phi thuyền.',
      en: 'Panoramic orbital observation deck overlooking a swirling cosmic purple nebula, ringed planet, and glowing sci-fi HUD consoles.',
      zh: '空间站全景穹顶舷窗眺望浩瀚紫金星云与环带行星，控制台流光闪烁。'
    },
    toneDesc: {
      vi: 'Tím tinh vân (#8B5CF6), xanh thiên hà (#3B82F6), cam plasma (#F97316)',
      en: 'Nebula Violet (#8B5CF6), Stellar Blue (#3B82F6), Plasma Flare',
      zh: '星云魅紫 (#8B5CF6)、星系深蓝 (#3B82F6)、等离子橙'
    },
    colors: {
      bg: '#040614',
      bgGradient: 'linear-gradient(180deg, #02040d 0%, #090e24 40%, #1b1640 75%, #31144f 100%)',
      cardRgb: '12, 16, 38',
      accent: '#8b5cf6',
      accentGlow: 'rgba(139, 92, 246, 0.55)',
      accentHover: '#a78bfa',
      accentText: '#180738',
      secondaryAccent: '#60a5fa',
      borderColor: 'rgba(139, 92, 246, 0.4)',
      swatches: ['#8B5CF6', '#3B82F6', '#F97316', '#06B6D4']
    }
  },
  {
    id: 'deep-aquarium',
    stt: 38,
    name: {
      vi: 'Thủy cung & Cá voi phát sáng',
      en: 'Bioluminescent Whale Deep',
      zh: '深海发光巨鲸水族馆'
    },
    desc: {
      vi: 'Mái vòm thủy cung thăm thẳm, chú cá voi khổng lồ phát hoa văn ánh sáng xanh lam bơi lượn giữa đàn sứa dạ quang bồng bềnh.',
      en: 'Deep oceanic viewing dome with a colossal bioluminescent blue whale gliding past glowing jellyfish drifting up.',
      zh: '深邃水下巨型观景巨幕，发光巨鲸舒展巨鳍自幽蓝深渊掠过，水母群晶莹浮动。'
    },
    toneDesc: {
      vi: 'Lam đáy biển (#0284C7), lục dạ quang sứa (#2DD4BF), vàng ngọc (#FEF08A)',
      en: 'Abyss Marine (#0284C7), Biolum Aqua (#2DD4BF), Pearl Gold',
      zh: '深渊海蓝 (#0284C7)、荧光水碧 (#2DD4BF)、明珠金'
    },
    colors: {
      bg: '#021024',
      bgGradient: 'linear-gradient(180deg, #010b1a 0%, #03203c 45%, #053b66 80%, #0c568f 100%)',
      cardRgb: '6, 26, 52',
      accent: '#06b6d4',
      accentGlow: 'rgba(6, 182, 212, 0.55)',
      accentHover: '#22d3ee',
      accentText: '#042730',
      secondaryAccent: '#38bdf8',
      borderColor: 'rgba(6, 182, 212, 0.4)',
      swatches: ['#0284C7', '#06B6D4', '#2DD4BF', '#FEF08A']
    }
  }
];
