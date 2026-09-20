import { SimulationResult, Frame, NodeItem, EdgeItem } from '../../types';

function normalizeOutput(str: string): string {
  return str.trim().replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ');
}

/**
 * Xử lý bài toán Nhà máy điện (Power Plant Lighting Network)
 * Chỉ kích hoạt khi simulationKind === 'power-plant'
 */
export function processPowerPlant(sim: SimulationResult, expectedOutput?: string): SimulationResult {
  if (!sim) return sim;

  const rawInput = (sim.sampleInput || '').trim();
  const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return sim;

  const firstParts = lines[0].split(/\s+/).map(Number).filter(v => !isNaN(v));
  if (firstParts.length < 3) return sim;

  const [n, m, k] = firstParts;
  if (n <= 0 || m < 0 || k < 0) return sim;

  const edgesList: { from: string; to: string }[] = [];
  const adj = new Map<number, number[]>();
  for (let i = 1; i <= n; i++) adj.set(i, []);

  let lineIdx = 1;
  for (let i = 0; i < m && lineIdx < lines.length; i++, lineIdx++) {
    const parts = lines[lineIdx].split(/\s+/).map(Number).filter(v => !isNaN(v));
    if (parts.length >= 2) {
      const u = parts[0];
      const v = parts[1];
      edgesList.push({ from: String(u), to: String(v) });
      adj.get(u)?.push(v);
      adj.get(v)?.push(u);
    }
  }

  const plants: { p: number; r: number }[] = [];
  for (let j = 0; j < k && lineIdx < lines.length; j++, lineIdx++) {
    const parts = lines[lineIdx].split(/\s+/).map(Number).filter(v => !isNaN(v));
    if (parts.length >= 2) {
      plants.push({ p: parts[0], r: parts[1] });
    }
  }

  if (plants.length === 0) return sim;

  const poweredCities = new Set<number>();
  const plantCities = new Set<number>(plants.map(pl => pl.p));
  const powerEdges = new Set<string>();

  const plantSteps: {
    plantIndex: number;
    p: number;
    r: number;
    newlyPowered: number[];
    usedEdges: { from: string; to: string }[];
  }[] = [];

  plants.forEach((pl, idx) => {
    const { p, r } = pl;
    const distMap = new Map<number, number>();
    const queue: number[] = [p];
    distMap.set(p, 0);

    const newlyPoweredThisPlant: number[] = [];
    const usedEdgesThisPlant: { from: string; to: string }[] = [];

    if (!poweredCities.has(p)) {
      newlyPoweredThisPlant.push(p);
      poweredCities.add(p);
    }

    while (queue.length > 0) {
      const u = queue.shift()!;
      const d = distMap.get(u)!;
      if (d < r) {
        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
          if (!distMap.has(v)) {
            distMap.set(v, d + 1);
            queue.push(v);
            usedEdgesThisPlant.push({ from: String(u), to: String(v) });
            powerEdges.add(`${Math.min(u, v)}-${Math.max(u, v)}`);
            if (!poweredCities.has(v)) {
              newlyPoweredThisPlant.push(v);
              poweredCities.add(v);
            }
          }
        }
      }
    }

    plantSteps.push({
      plantIndex: idx + 1,
      p,
      r,
      newlyPowered: newlyPoweredThisPlant,
      usedEdges: usedEdgesThisPlant
    });
  });

  let computedOutput = '';
  for (let i = 1; i <= n; i++) {
    computedOutput += poweredCities.has(i) ? '1' : '0';
  }

  const baseNodes: NodeItem[] = Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    label: String(i + 1),
    color: 'dark',
    status: 'off',
    highlight: false
  }));

  const baseEdges: EdgeItem[] = edgesList.map(e => ({
    ...e,
    highlight: false
  }));

  const newFrames: Frame[] = [];
  let curStep = 0;

  // Frame 0
  newFrames.push({
    step: curStep++,
    description: `Khởi tạo mạng lưới ${n} thành phố và ${m} con đường (mỗi đường dài 1 km). Toàn bộ ${n} thành phố hiện chưa có điện (tắt đèn ✕ - màu tối). Có ${k} dự án xây dựng nhà máy điện sẽ được triển khai.`,
    nodes: [...baseNodes],
    edges: [...baseEdges],
    status: 'normal',
    variables: {
      'tổng_thành_phố_n': n,
      'tổng_con_đường_m': m,
      'số_nhà_máy_k': k,
      'trạng_thái_ban_đầu': 'Chưa có điện'
    }
  });

  const cumulativePowered = new Set<number>();
  const activePowerEdges = new Set<string>();

  plantSteps.forEach((ps) => {
    // Bước đặt nhà máy
    cumulativePowered.add(ps.p);
    const plantNodes: NodeItem[] = baseNodes.map(node => {
      const idNum = Number(node.id);
      const isThisPlant = idNum === ps.p;
      const isPriorPlant = plantCities.has(idNum) && cumulativePowered.has(idNum);
      const isLit = cumulativePowered.has(idNum);

      if (isThisPlant || isPriorPlant) {
        return { ...node, color: 'plant', status: 'plant', highlight: true };
      } else if (isLit) {
        return { ...node, color: 'yellow', status: 'lit', highlight: true };
      } else {
        return { ...node, color: 'dark', status: 'off', highlight: false };
      }
    });

    newFrames.push({
      step: curStep++,
      description: `Dự án nhà máy điện ${ps.plantIndex}/${plants.length}: XÂY DỰNG NHÀ MÁY ĐIỆN TẠI THÀNH PHỐ ${ps.p} (⚡). Bán kính cấp điện hiệu dụng: R = ${ps.r} km. Thành phố ${ps.p} ngay lập tức sáng đèn (💡).`,
      nodes: plantNodes,
      edges: baseEdges.map(e => {
        const key = `${Math.min(Number(e.from), Number(e.to))}-${Math.max(Number(e.from), Number(e.to))}`;
        const isPwr = activePowerEdges.has(key);
        return { ...e, highlight: isPwr, color: isPwr ? 'yellow' : undefined };
      }),
      status: 'normal',
      variables: {
        'nhà_máy_đang_xét': `Dự án ${ps.plantIndex}/${plants.length}`,
        'vị_trí_nhà_máy': `Thành phố ${ps.p}`,
        'bán_kính_cấp_điện_r': `${ps.r} km`
      }
    });

    // Bước lan truyền điện
    ps.newlyPowered.forEach(city => cumulativePowered.add(city));
    ps.usedEdges.forEach(e => {
      activePowerEdges.add(`${Math.min(Number(e.from), Number(e.to))}-${Math.max(Number(e.from), Number(e.to))}`);
    });

    const spreadNodes: NodeItem[] = baseNodes.map(node => {
      const idNum = Number(node.id);
      const isThisPlant = plantCities.has(idNum) && cumulativePowered.has(idNum);
      const isLit = cumulativePowered.has(idNum);

      if (isThisPlant) {
        return { ...node, color: 'plant', status: 'plant', highlight: true };
      } else if (isLit) {
        return { ...node, color: 'yellow', status: 'lit', highlight: true };
      } else {
        return { ...node, color: 'dark', status: 'off', highlight: false };
      }
    });

    const newlyLitList = ps.newlyPowered.filter(c => c !== ps.p);
    newFrames.push({
      step: curStep++,
      description: `Nhà máy điện tại TP ${ps.p} (bán kính R=${ps.r} km) truyền điện dọc theo các con đường:\n- ${newlyLitList.length > 0 ? `Các thành phố mới được cấp điện (sáng đèn 💡): [${newlyLitList.join(', ')}].` : `Không có thêm thành phố mới nào trong bán kính ${ps.r} km.`}\n- Hiện tại đã có ${cumulativePowered.size}/${n} thành phố có điện sáng rực rỡ.`,
      nodes: spreadNodes,
      edges: baseEdges.map(e => {
        const key = `${Math.min(Number(e.from), Number(e.to))}-${Math.max(Number(e.from), Number(e.to))}`;
        const isPwr = activePowerEdges.has(key);
        return { ...e, highlight: isPwr, color: isPwr ? 'yellow' : undefined };
      }),
      status: 'normal',
      variables: {
        'thành_phố_mới_sáng_đèn': newlyLitList.length > 0 ? newlyLitList.join(', ') : 'Không có',
        'tổng_thành_phố_có_điện': `${cumulativePowered.size}/${n}`,
        'tỉ_lệ_phủ_điện': `${Math.round((cumulativePowered.size / n) * 100)}%`
      }
    });
  });

  // Frame kết thúc
  const finalNodes: NodeItem[] = baseNodes.map(node => {
    const idNum = Number(node.id);
    const isThisPlant = plantCities.has(idNum);
    const isLit = poweredCities.has(idNum);

    if (isThisPlant) {
      return { ...node, color: 'plant', status: 'plant', highlight: true };
    } else if (isLit) {
      return { ...node, color: 'yellow', status: 'lit', highlight: true };
    } else {
      return { ...node, color: 'dark', status: 'off', highlight: false };
    }
  });

  const unpoweredList: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (!poweredCities.has(i)) unpoweredList.push(i);
  }

  newFrames.push({
    step: curStep++,
    description: `✓ HOÀN THÀNH MẠNG LƯỚI CẤP ĐIỆN TOÀN QUỐC:\n- Các thành phố sáng đèn (💡 / ⚡): [${Array.from(poweredCities).sort((a,b)=>a-b).join(', ')}] -> ký tự '1'.\n- Các thành phố chưa có điện (tắt đèn ✕): [${unpoweredList.length > 0 ? unpoweredList.join(', ') : 'Không có'}] -> ký tự '0'.\n=> XÂU NHỊ PHÂN KẾT QUẢ: ${computedOutput}.`,
    nodes: finalNodes,
    edges: baseEdges.map(e => {
      const key = `${Math.min(Number(e.from), Number(e.to))}-${Math.max(Number(e.from), Number(e.to))}`;
      const isPwr = activePowerEdges.has(key);
      return { ...e, highlight: isPwr, color: isPwr ? 'yellow' : undefined };
    }),
    status: 'done',
    variables: {
      'xâu_nhị_phân_kết_quả': computedOutput,
      'tổng_thành_phố_có_điện': `${poweredCities.size}/${n}`,
      'tỉ_lệ_phủ_điện': `${Math.round((poweredCities.size / n) * 100)}%`
    }
  });

  let outputMismatchWarning: string | undefined = undefined;
  let outputMatches = true;

  if (expectedOutput && expectedOutput.trim()) {
    const normExp = normalizeOutput(expectedOutput);
    const normComp = normalizeOutput(computedOutput);
    if (normExp === normComp) {
      outputMatches = true;
      outputMismatchWarning = undefined;
    } else {
      outputMatches = false;
      outputMismatchWarning = `⚠️ Output bạn nhập (${expectedOutput.trim()}) chưa chính xác theo đề bài! Kết quả chính xác của thuật toán phải là:\n${computedOutput}`;
    }
  }

  return {
    ...sim,
    sampleOutput: computedOutput,
    userExpectedOutput: expectedOutput ? expectedOutput.trim() : sim.userExpectedOutput,
    outputMatches,
    outputMismatchWarning: outputMismatchWarning || sim.outputMismatchWarning,
    viewType: 'graph',
    frames: newFrames
  };
}
