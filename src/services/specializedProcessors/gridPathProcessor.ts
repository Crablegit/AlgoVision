import { SimulationResult, Frame } from '../../types';

function findGridPaths(
  m: number,
  n: number,
  obstacles: Set<string>,
  maxPaths: number = 15
): { r: number; c: number }[][] {
  const result: { r: number; c: number }[][] = [];
  const currentPath: { r: number; c: number }[] = [];

  function dfs(r: number, c: number) {
    if (result.length >= maxPaths) return;
    if (r > m || c > n) return;
    if (obstacles.has(`${r},${c}`)) return;

    currentPath.push({ r, c });

    if (r === m && c === n) {
      result.push([...currentPath]);
    } else {
      dfs(r, c + 1); // sang phải
      dfs(r + 1, c); // xuống dưới
    }

    currentPath.pop();
  }

  dfs(1, 1);
  return result;
}

/**
 * Xử lý bài toán đường đi trên lưới (Grid Pathfinding)
 * Chỉ kích hoạt khi simulationKind === 'grid-path'
 */
export function processGridPath(sim: SimulationResult): SimulationResult {
  if (!sim) return sim;

  const rawInput = (sim.sampleInput || '').trim();
  const inLines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
  let m = 0, n = 0;
  const obstacles = new Set<string>();

  if (inLines.length > 0) {
    const firstParts = inLines[0].split(/\s+/).map(Number).filter(v => !isNaN(v));
    if (firstParts.length >= 2) {
      m = firstParts[0];
      n = firstParts[1];
    }
    for (let i = 1; i < inLines.length; i++) {
      const parts = inLines[i].split(/\s+/).map(Number).filter(v => !isNaN(v));
      if (parts.length >= 2) {
        obstacles.add(`${parts[0]},${parts[1]}`);
      }
    }
  }

  if (m === 0 || n === 0) {
    for (const f of sim.frames || []) {
      if (f.grid && f.grid.length > 0) {
        m = f.grid.length;
        n = f.grid[0]?.length || 0;
        for (let r = 0; r < m; r++) {
          for (let c = 0; c < n; c++) {
            const val = String(f.grid[r][c]);
            if (val === 'X' || val === 'x' || val === '#' || val === 'B') {
              obstacles.add(`${r + 1},${c + 1}`);
            }
          }
        }
        break;
      }
    }
  }

  if (m === 0 || n === 0 || m > 25 || n > 25) return sim;

  const paths = findGridPaths(m, n, obstacles, 15);
  if (paths.length === 0) return sim;

  const PATH_PALETTES = ['emerald', 'sky', 'purple', 'amber'];
  const expandedFrames: Frame[] = [];
  let currentStep = 0;

  // Frame 0: Khởi tạo lưới ban đầu
  const initialGrid: string[][] = [];
  const initialHighlights: any[] = [];
  for (let r = 1; r <= m; r++) {
    const row: string[] = [];
    for (let c = 1; c <= n; c++) {
      if (obstacles.has(`${r},${c}`)) {
        row.push('X');
        initialHighlights.push({ r: r - 1, c: c - 1, status: 'blocked' });
      } else if (r === 1 && c === 1) {
        row.push('🤖');
        initialHighlights.push({ r: 0, c: 0, status: 'robot' });
      } else {
        row.push('·');
      }
    }
    initialGrid.push(row);
  }

  expandedFrames.push({
    step: currentStep++,
    description: `Khởi tạo lưới ${m} x ${n} với ${obstacles.size} ô cấm (màu đỏ). Robot bắt đầu tại ô xuất phát (1, 1). Có tất cả ${paths.length} cách đi thỏa mãn.`,
    grid: initialGrid,
    cellHighlights: initialHighlights,
    status: 'normal',
    variables: {
      'kích_thước': `${m}x${n}`,
      'số_ô_cấm': obstacles.size,
      'tổng_số_cách_đi': paths.length
    }
  });

  paths.forEach((coords, pIdx) => {
    const pathNum = pIdx + 1;
    const pathColor = PATH_PALETTES[pIdx % PATH_PALETTES.length];

    for (let s = 0; s < coords.length; s++) {
      const curPt = coords[s];
      const prevPt = s > 0 ? coords[s - 1] : null;
      const stepGrid: string[][] = [];
      const cellHighlights: any[] = [];

      for (let r = 1; r <= m; r++) {
        const row: string[] = [];
        for (let c = 1; c <= n; c++) {
          const key = `${r},${c}`;
          if (obstacles.has(key)) {
            row.push('X');
            cellHighlights.push({ r: r - 1, c: c - 1, status: 'blocked' });
          } else if (r === curPt.r && c === curPt.c) {
            row.push('🤖');
            cellHighlights.push({ r: r - 1, c: c - 1, status: 'robot' });
          } else {
            let visitedInCurrentPath = false;
            for (let prev = 0; prev < s; prev++) {
              if (coords[prev].r === r && coords[prev].c === c) {
                visitedInCurrentPath = true;
                break;
              }
            }

            if (visitedInCurrentPath) {
              row.push('✓');
              cellHighlights.push({ r: r - 1, c: c - 1, status: 'path', color: pathColor });
            } else {
              row.push('·');
            }
          }
        }
        stepGrid.push(row);
      }

      let desc = '';
      if (s === 0) {
        desc = `Cách đi ${pathNum}/${paths.length}: Xóa đường đi cũ, robot bắt đầu lại từ ô xuất phát (${curPt.r}, ${curPt.c}).`;
      } else if (s === coords.length - 1) {
        desc = `Cách đi ${pathNum}/${paths.length}: Robot đã tới đích (${curPt.r}, ${curPt.c}) thành công! Tìm thấy cách đi thứ ${pathNum}.`;
      } else {
        let dir = 'tiếp tục';
        if (prevPt) {
          if (curPt.r === prevPt.r + 1) dir = 'xuống dưới';
          else if (curPt.c === prevPt.c + 1) dir = 'sang phải';
        }
        desc = `Cách đi ${pathNum}/${paths.length} (bước ${s + 1}/${coords.length}): Robot đi ${dir} đến (${curPt.r}, ${curPt.c}).`;
      }

      expandedFrames.push({
        step: currentStep++,
        description: desc,
        grid: stepGrid,
        cellHighlights,
        status: s === coords.length - 1 ? 'found' : 'normal',
        variables: {
          'đang_duyệt': `Cách đi ${pathNum}/${paths.length}`,
          'vị_trí_robot': `(${curPt.r}, ${curPt.c})`,
          'bước_hiện_tại': `${s + 1}/${coords.length}`,
          'màu_đường_đi': pathColor
        }
      });
    }
  });

  return {
    ...sim,
    viewType: 'grid',
    frames: expandedFrames
  };
}
