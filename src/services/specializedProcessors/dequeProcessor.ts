import { SimulationResult, Frame } from '../../types';

function normalizeOutput(str: string): string {
  return str.trim().replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ');
}

/**
 * Xử lý bài toán CPBDEQUEGAME (Trò chơi xóa số hai đầu của deque)
 * Chỉ kích hoạt khi simulationKind === 'deque-game'
 */
export function processDequeGame(sim: SimulationResult, expectedOutput?: string): SimulationResult {
  if (!sim) return sim;

  const rawInput = (sim.sampleInput || '').trim();
  const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return sim;

  // Đọc số lượng test case T
  let lineIdx = 0;
  let numTests = 1;
  const firstNum = parseInt(lines[0], 10);
  if (!isNaN(firstNum) && lines.length > 2 && lines[0].split(/\s+/).length === 1) {
    numTests = firstNum;
    lineIdx = 1;
  }

  const testCases: { n: number; s: number; a: number[] }[] = [];
  while (lineIdx < lines.length && testCases.length < numTests) {
    const headerParts = lines[lineIdx].split(/\s+/).map(Number).filter(v => !isNaN(v));
    if (headerParts.length >= 2) {
      const n = headerParts[0];
      const s = headerParts[1];
      lineIdx++;
      if (lineIdx < lines.length) {
        const arr = lines[lineIdx].split(/\s+/).map(Number).filter(v => !isNaN(v));
        testCases.push({ n, s, a: arr });
        lineIdx++;
      }
    } else {
      lineIdx++;
    }
  }

  if (testCases.length === 0) return sim;

  const newFrames: Frame[] = [];
  let curStep = 0;
  const tcResults: number[] = [];

  testCases.forEach((tc, tcIdx) => {
    const { n, s, a: arr } = tc;
    const tcNum = tcIdx + 1;
    const totalSum = arr.reduce((acc, v) => acc + v, 0);

    // Frame bắt đầu test case
    newFrames.push({
      step: curStep++,
      description: `Bắt đầu Test Case ${tcNum}/${testCases.length}: Dãy ban đầu gồm ${n} phần tử. Mục tiêu: xóa ít phần tử nhất ở hai đầu sao cho các phần tử còn lại có tổng đúng bằng S = ${s}. Tổng hiện tại của cả dãy = ${totalSum}.`,
      elements: [...arr],
      highlights: [],
      status: 'normal',
      pointers: {},
      variables: {
        'test_case': `${tcNum}/${testCases.length}`,
        'số_phần_tử_n': n,
        'tổng_mục_tiêu_s': s,
        'tổng_hiện_tại': totalSum
      }
    });

    if (totalSum < s) {
      tcResults.push(-1);
      newFrames.push({
        step: curStep++,
        description: `Tổng của toàn bộ dãy (${totalSum}) nhỏ hơn S (${s}). Không thể đạt được tổng ${s}. Kết quả test ${tcNum}: -1.`,
        elements: [...arr],
        highlights: [],
        status: 'done',
        pointers: {},
        variables: { 'kết_quả_test': -1 }
      });
      return;
    }

    if (totalSum === s) {
      tcResults.push(0);
      newFrames.push({
        step: curStep++,
        description: `Tổng của cả dãy bằng đúng S = ${s}. Không cần xóa phần tử nào! Kết quả test ${tcNum}: 0.`,
        elements: [...arr],
        highlights: Array.from({ length: n }, (_, i) => i),
        status: 'done',
        pointers: {},
        variables: { 'kết_quả_test': 0 }
      });
      return;
    }

    // Tìm đoạn con có tổng = s dài nhất
    let maxLen = -1;
    let bestL = 0;
    let bestR = -1;
    let r = 0;
    let curSum = 0;

    const windowSteps: { l: number; r: number; sum: number; valid: boolean }[] = [];

    for (let l = 0; l < n; l++) {
      while (r < n && curSum + arr[r] <= s) {
        curSum += arr[r];
        r++;
      }
      if (curSum === s) {
        const len = r - l;
        if (len > maxLen) {
          maxLen = len;
          bestL = l;
          bestR = r - 1;
        }
        windowSteps.push({ l, r: r - 1, sum: curSum, valid: true });
      }
      curSum -= arr[l];
    }

    if (maxLen === -1) {
      tcResults.push(-1);
      newFrames.push({
        step: curStep++,
        description: `Không tồn tại bất kỳ đoạn con liên tiếp nào có tổng bằng ${s}. Kết quả: -1.`,
        elements: [...arr],
        highlights: [],
        status: 'done',
        pointers: {},
        variables: { 'kết_quả_test': -1 }
      });
      return;
    }

    // Trình diễn các đoạn thỏa mãn
    windowSteps.slice(0, 6).forEach((st, idx) => {
      const hl: number[] = [];
      const del: number[] = [];
      for (let i = 0; i < n; i++) {
        if (i >= st.l && i <= st.r) hl.push(i);
        else del.push(i);
      }

      newFrames.push({
        step: curStep++,
        description: `Xét đoạn [${st.l}..${st.r}] (độ dài = ${st.r - st.l + 1}): Các phần tử [${arr.slice(st.l, st.r + 1).join(', ')}] có tổng = ${st.sum}. Xóa ${st.l} phần tử ở đầu và ${n - 1 - st.r} phần tử ở cuối (tổng số xóa: ${st.l + n - 1 - st.r} bước).`,
        elements: [...arr],
        highlights: hl,
        deleted: del,
        status: 'normal',
        pointers: { 'L': st.l, 'R': st.r },
        variables: {
          'đoạn_giữ_lại': `[${st.l}..${st.r}]`,
          'tổng_đoạn': st.sum,
          'độ_dài': st.r - st.l + 1,
          'số_bước_xóa': st.l + n - 1 - st.r
        }
      });
    });

    // Frame kết quả tối ưu
    const bestDelLeft = bestL;
    const bestDelRight = n - 1 - bestR;
    const minDel = bestDelLeft + bestDelRight;
    tcResults.push(minDel);
    const bestHl: number[] = [];
    const bestDel: number[] = [];
    for (let i = 0; i < n; i++) {
      if (i >= bestL && i <= bestR) bestHl.push(i);
      else bestDel.push(i);
    }

    newFrames.push({
      step: curStep++,
      description: `✓ TÌM THẤY ĐOẠN CON TỐI ƯU DÀI NHẤT [${bestL}..${bestR}] CÓ TỔNG = ${s} (Độ dài cực đại = ${maxLen}):\n- Xóa ${bestDelLeft} phần tử ở đầu dãy: chỉ số [0..${bestDelLeft - 1}].\n- Xóa ${bestDelRight} phần tử ở cuối dãy: chỉ số [${bestR + 1}..${n - 1}].\n- Dãy con còn lại ở giữa: [${arr.slice(bestL, bestR + 1).join(', ')}] có tổng = ${s}.\n=> SỐ BƯỚC XÓA TỐI THIỂU = ${n} - ${maxLen} = ${minDel} BƯỚC (KẾT QUẢ TEST CASE ${tcNum}: ${minDel}).`,
      elements: [...arr],
      highlights: bestHl,
      deleted: bestDel,
      status: 'done',
      pointers: { 'L': bestL, 'R': bestR },
      variables: {
        'đoạn_tối_ưu': `[${bestL}..${bestR}]`,
        'tổng_còn_lại': s,
        'độ_dài_cực_đại': maxLen,
        'xóa_đầu': bestDelLeft,
        'xóa_cuối': bestDelRight,
        'kết_quả_ít_nhất': minDel
      }
    });
  });

  const computedOutput = tcResults.join('\n');
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
    viewType: 'array',
    frames: newFrames
  };
}
