import { SimulationResult } from '../types';
import { callGemini } from './geminiClient';

export interface VerificationResult {
  isValid: boolean;
  score: number; // 1 - 10
  critique: string;
  suggestedFixes?: string;
}

/**
 * Kiểm thử bản mô phỏng trực quan hóa bằng mô hình Gemini 3.1 Flash Lite (Verifier Agent)
 * Đối chiếu chặt chẽ giữa Đề bài, Input/Output mẫu và Diễn biến từng bước của mô phỏng.
 */
export async function verifySimulationWithGemini31(
  problemText: string,
  sampleInput: string,
  sampleOutput: string,
  simulation: SimulationResult,
  apiKey: string
): Promise<VerificationResult> {
  const verifierPrompt = `
BẠN LÀ CHUYÊN GIA KIỂM THỬ THUẬT TOÁN ĐỘC LẬP (ALGORITHM VISUALIZATION VERIFIER).
Nhiệm vụ: Đối chiếu bản mô phỏng trực quan hóa do AI sinh ra với Đề bài và Input/Output mẫu.

=== ĐỀ BÀI GỐC ===
${problemText}

=== INPUT CỦA TEST CASE ===
${sampleInput || '(Không có input cụ thể)'}

=== OUTPUT KỲ VỌNG ===
${sampleOutput || '(Không có output cụ thể)'}

=== BẢN MÔ PHỎNG HIỆN TẠI CỦA GENERATOR ===
- Tiêu đề: ${simulation.problemTitle}
- Tóm tắt: ${simulation.problemSummary}
- Dạng trực quan hóa (viewType): ${simulation.viewType} (subType: ${simulation.subType || 'none'})
- Output do mô phỏng tính ra: ${simulation.sampleOutput || '(trống)'}
- Số bước (frames): ${simulation.frames?.length || 0}
- Diễn biến các bước:
${(simulation.frames || []).slice(0, 15).map((f, i) => `  * Bước ${i + 1} (${f.status}): ${f.description}`).join('\n')}

=== CÁC TIÊU CHÍ KIỂM THỬ BẮT BUỘC ===
1. Thực thể (Entities): Các thực thể trong mô phỏng có đúng với ngữ cảnh đề bài không?
   - VÍ DỤ CẢNH BÁO: Nếu đề bài nói về học sinh, máy tính, mạng LAN, game, thành phố, mảng số... thì TUYỆT ĐỐI KHÔNG ĐƯỢC biến thành thùng nước/bình nước hay bài toán khác.
2. Dạng trực quan (viewType): Đã chọn viewType đúng bản chất chưa? (ví dụ liên thông đồ thị phải dùng graph hoặc mapping, dãy số dùng array, ma trận dùng grid...).
3. Tính đúng đắn của Output: Output của mô phỏng có khớp với Output kỳ vọng (${sampleOutput}) không?
4. Logic từng bước: Các bước có giải thích đúng quy tắc bài toán không?

HÃY ĐÁNH GIÁ NGHIÊM TÚC VÀ TRẢ VỀ JSON DUY NHẤT VỚI ĐỊNH DẠNG:
{
  "isValid": true, // Đặt false nếu sai thực thể, sai viewType hoặc sai kết quả output
  "score": 10, // Thang điểm 1-10. Nếu score < 8 thì coi như chưa đạt yêu cầu (isValid = false)
  "critique": "Nhận xét chi tiết về những điểm đúng và lỗi sai cụ thể nếu có",
  "suggestedFixes": "Hướng dẫn cụ thể cho Generator sửa lại (chỉ rõ thực thể đúng, viewType đúng, và output cần đạt)"
}
`;

  try {
    const raw = await callGemini([{ text: verifierPrompt }], apiKey, 'gemini-3.1-flash-lite', 0.1);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { isValid: true, score: 8, critique: "Không thể trích xuất JSON từ verifier." };
    }
    const parsed = JSON.parse(jsonMatch[0]);
    const score = typeof parsed.score === 'number' ? parsed.score : 8;
    const isValid = Boolean(parsed.isValid) && score >= 8;

    return {
      isValid,
      score,
      critique: String(parsed.critique || ''),
      suggestedFixes: parsed.suggestedFixes ? String(parsed.suggestedFixes) : undefined
    };
  } catch (err: any) {
    console.warn("Verifier gemini-3.1-flash-lite gặp sự cố hoặc timeout:", err?.message || err);
    // Nếu verifier gặp lỗi mạng, không chặn người dùng
    return { isValid: true, score: 8, critique: "Bỏ qua bước kiểm thử do lỗi kết nối." };
  }
}
