import { SimulationResult } from '../types';
import { normalizeOutput } from './normalizer';

export interface DeterministicVerificationResult {
  isValid: boolean;
  issues: string[];
  reasons: string[];
  suggestedFixes: string[];
}

/**
 * Bộ kiểm thử logic tất định (Deterministic Verifier)
 * Chạy tức thì (0ms), không tốn token, không ảo giác.
 * Kiểm tra 3 tiêu chuẩn cốt lõi:
 * 1. So khớp Output tính được với Output kỳ vọng của người dùng.
 * 2. Quét từ khóa thực thể để chặn đứng ảo giác (ví dụ nhầm mạng LAN/game sang thùng nước).
 * 3. Kiểm tra tính toàn vẹn của cấu trúc dữ liệu theo viewType và số bước.
 */
export function verifySimulationDeterministically(
  problemText: string,
  userSampleInput: string,
  userSampleOutput: string,
  simulation: SimulationResult
): DeterministicVerificationResult {
  const issues: string[] = [];
  const reasons: string[] = [];
  const suggestedFixes: string[] = [];

  const normProblem = (problemText || '').toLowerCase();
  const allFrameDesc = (simulation.frames || []).map(f => f.description || '').join(' ').toLowerCase();
  const allVariables = JSON.stringify((simulation.frames || []).map(f => f.variables || {})).toLowerCase();

  // 1. KIỂM TRA OUTPUT SO VỚI ĐỀ BÀI
  if (userSampleOutput && userSampleOutput.trim() !== '') {
    const expected = normalizeOutput(userSampleOutput);
    const actual = normalizeOutput(simulation.sampleOutput || '');

    if (actual && expected && actual !== expected) {
      issues.push("Output không khớp");
      reasons.push(
        `Output do mô phỏng tính ra (${simulation.sampleOutput}) chưa khớp với Output kỳ vọng của đề bài (${userSampleOutput.trim()}).`
      );
      suggestedFixes.push(
        `Hãy tính toán lại từng bước theo quy tắc của đề bài để cho ra kết quả chính xác cuối cùng là: "${userSampleOutput.trim()}".`
      );
    }
  }

  // 2. QUÉT TỪ KHÓA THỰC THỂ (CHỐNG ẢO GIÁC NHẦM DẠNG BÀI TOÁN)
  // Ngăn chặn nhầm lẫn sang "thùng nước / bình thông nhau" khi đề bài nói về mạng LAN, máy tính, học sinh, đồ thị, thành phố...
  const isActuallyWaterTankProblem = 
    normProblem.includes('thùng nước') || 
    normProblem.includes('bình nước') || 
    normProblem.includes('bình thông nhau') || 
    normProblem.includes('dung tích') || 
    normProblem.includes('water tank') || 
    normProblem.includes('water jug');

  const simulationMentionsWaterTanks = 
    allFrameDesc.includes('thùng nước') || 
    allFrameDesc.includes('bình nước') || 
    allFrameDesc.includes('van nối') || 
    allVariables.includes('thùng') || 
    allVariables.includes('van');

  if (!isActuallyWaterTankProblem && simulationMentionsWaterTanks) {
    issues.push("Sai lệch thực thể (Ảo giác thùng nước)");
    reasons.push(
      "Mô phỏng sử dụng các thực thể 'thùng nước / van nối' trong khi đề bài không hề liên quan đến thùng nước."
    );
    suggestedFixes.push(
      "Hãy sử dụng đúng các thực thể được mô tả trong đề bài (ví dụ: máy tính, học sinh, dây mạng LAN, đỉnh đồ thị, mảng số...) và chọn viewType phù hợp (như 'graph' hoặc 'mapping')."
    );
  }

  // Ngăn chặn nhầm lẫn sang bàn cờ / quân cờ khi đề bài không phải cờ
  const isActuallyBoardProblem = 
    normProblem.includes('bàn cờ') || 
    normProblem.includes('quân cờ') || 
    normProblem.includes('chess') || 
    normProblem.includes('quân hậu') || 
    normProblem.includes('quân mã');

  if (!isActuallyBoardProblem && simulation.viewType === 'board') {
    issues.push("Sai lệch dạng trực quan (Bàn cờ)");
    reasons.push("Mô phỏng chọn dạng bàn cờ (board) trong khi đề bài không phải trò chơi bàn cờ.");
    suggestedFixes.push("Hãy chọn viewType phù hợp hơn như 'grid', 'graph', hoặc 'array'.");
  }

  // 3. KIỂM TRA CẤU TRÚC DỮ LIỆU & SỐ BƯỚC (STRUCTURE & STEPS)
  const frames = simulation.frames || [];
  if (frames.length === 0) {
    issues.push("Mô phỏng không có bước nào");
    reasons.push("Mảng frames trả về bị rỗng.");
    suggestedFixes.push("Hãy sinh ít nhất từ 2 đến 10 frames mô phỏng từng bước thuật toán.");
  } else {
    // Kiểm tra xem dữ liệu tương ứng với viewType có tồn tại không
    const vType = simulation.viewType;
    if (vType === 'array') {
      const hasElements = frames.some(f => f.elements && f.elements.length > 0);
      if (!hasElements) {
        issues.push("Thiếu mảng elements cho dạng array");
        reasons.push("viewType là 'array' nhưng không có frame nào chứa mảng 'elements'.");
        suggestedFixes.push("Hãy cung cấp mảng 'elements' cho các frames.");
      }
    } else if (vType === 'graph' || vType === 'tree') {
      const hasNodes = frames.some(f => (f.nodes && f.nodes.length > 0) || (f.edges && f.edges.length > 0));
      if (!hasNodes) {
        issues.push(`Thiếu dữ liệu nodes/edges cho dạng ${vType}`);
        reasons.push(`viewType là '${vType}' nhưng không có frame nào chứa 'nodes' hoặc 'edges'.`);
        suggestedFixes.push("Hãy cung cấp mảng 'nodes' và 'edges' cho đồ thị/cây.");
      }
    } else if (vType === 'grid') {
      const hasGrid = frames.some(f => (f.grid && f.grid.length > 0) || f.gridData?.cells);
      if (!hasGrid) {
        issues.push("Thiếu dữ liệu bảng cho dạng grid");
        reasons.push("viewType là 'grid' nhưng không có frame nào chứa 'grid' hoặc 'gridData'.");
        suggestedFixes.push("Hãy cung cấp mảng 2 chiều 'grid' cho các ô trong bảng.");
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    reasons,
    suggestedFixes
  };
}
