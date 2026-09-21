export type ThemeId =
  | 'anime-sky'
  | 'summer-hill'
  | 'autumn-hill'
  | 'winter-hill'
  | 'sakura-hill'
  | 'cyberpunk-rain'
  | 'synthwave-sunset'
  | 'enchanted-forest'
  | 'desert-oasis'
  | 'cosmic-nebula'
  | 'cozy-library'
  | 'mystic-swamp'
  | 'rainy-cafe'
  | 'mountain-peak';

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
    cardRgb: string; // e.g. "9, 14, 29"
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
  {
    id: 'anime-sky',
    stt: 1,
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
    stt: 2,
    name: {
      vi: 'Đồi núi trời hè',
      en: 'Summer Hill',
      zh: '夏日山丘'
    },
    desc: {
      vi: 'Đồi cỏ xanh mướt, 2 gốc sồi pixel hai bên. Chu kỳ 20s gió thổi rung cây làm bay lá xanh.',
      en: 'Lush green grassy hills with two pixel oak trees; 20s wind gusts rustle leaves.',
      zh: '翠绿草丘两侧矗立两棵像素橡树，每20秒微风吹落碧绿树叶。'
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
    stt: 3,
    name: {
      vi: 'Đồi núi trời thu',
      en: 'Autumn Hill',
      zh: '秋日枫丘'
    },
    desc: {
      vi: 'Triền đồi cỏ úa, trời hoàng hôn ấm áp, 2 cây phong rụng lá đỏ/cam xoáy tít mỗi 20s.',
      en: 'Golden autumn hills at sunset with two pixel maples; 20s wind swirls red leaves.',
      zh: '落日余晖映照秋丘，两旁像素枫树每20秒卷起枫红落叶回旋飞舞。'
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
    stt: 4,
    name: {
      vi: 'Đồi núi trời đông',
      en: 'Winter Hill',
      zh: '冬日雪丘'
    },
    desc: {
      vi: 'Mặt đất tuyết phủ, cây thông Noel bên phải và người tuyết bên trái cùng bông tuyết rơi nhẹ.',
      en: 'Snowy landscape with a pine tree and cute snowman, gentle pixel snowflakes falling.',
      zh: '银白积雪大地，右侧像素松树与左侧针织帽雪人，多重像素雪花飞舞。'
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
    id: 'sakura-hill',
    stt: 5,
    name: {
      vi: 'Đồi hoa anh đào',
      en: 'Sakura Hill',
      zh: '樱花之丘'
    },
    desc: {
      vi: 'Đồi cỏ non đầu xuân, 2 cây hoa anh đào uốn lượn, cánh hoa đào bay là đà qua khung hình.',
      en: 'Spring grass knoll with blooming cherry trees; delicate pink petals drift on the wind.',
      zh: '初春青青草丘，两侧曲折樱花树，粉嫩花瓣随微风悠然拂过。'
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
  {
    id: 'cyberpunk-rain',
    stt: 6,
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
    stt: 7,
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
    stt: 8,
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
    stt: 9,
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
    stt: 10,
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
    stt: 11,
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
    id: 'mystic-swamp',
    stt: 12,
    name: {
      vi: 'Đầm lầy huyền bí',
      en: 'Mystic Swamp',
      zh: '秘境沼泽'
    },
    desc: {
      vi: 'Mặt nước sẫm màu, thân cây khô khẳng khiu, phiến đá khắc ký tự rune, sương mù và bong bóng.',
      en: 'Eerie still waters, gnarled trees, glowing runes, creeping mist and rising bubbles.',
      zh: '幽静沉寂沼泽水面，盘根错节枯木与发光符文石碑，低回晨雾与水泡悄然升腾。'
    },
    toneDesc: {
      vi: 'Xanh rêu xám (#2E3D30), tím thạch anh (#4A3E4D), lục bảo dạ quang (#00E676)',
      en: 'Mossy Slate (#2E3D30), Amethyst Gray, Luminous Emerald',
      zh: '灰苔绿 (#2E3D30)、紫晶石、荧光翡翠'
    },
    colors: {
      bg: '#111814',
      bgGradient: 'linear-gradient(180deg, #0b120f 0%, #18261e 50%, #201a26 100%)',
      cardRgb: '20, 28, 24',
      accent: '#00e676',
      accentGlow: 'rgba(0, 230, 118, 0.5)',
      accentHover: '#69f0ae',
      accentText: '#022c15',
      secondaryAccent: '#18ffff',
      borderColor: 'rgba(0, 230, 118, 0.4)',
      swatches: ['#2E3D30', '#4A3E4D', '#00E676', '#18FFFF']
    }
  },
  {
    id: 'rainy-cafe',
    stt: 13,
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
    stt: 14,
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
  }
];
