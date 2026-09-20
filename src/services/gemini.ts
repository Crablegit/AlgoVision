import { SimulationResult, CustomTestContext, ViewType } from '../types';
import { 
  DEFAULT_GEMINI_MODEL, 
  GENERATOR_PRIMARY_MODEL, 
  GENERATOR_SECONDARY_MODEL, 
  getGeminiApiUrl, 
  testGeminiApiKey, 
  callGemini 
} from './geminiClient';
import { buildProblemAnalysisPrompt, buildCustomTestPrompt } from './promptBuilder';
import { validateAndCleanSimulationResult } from './schemaValidator';
import { applySpecializedProcessor } from './specializedProcessors';
import { normalizeSimulationFrames, normalizeOutput } from './normalizer';
import { verifySimulationDeterministically } from './verifier';

export { DEFAULT_GEMINI_MODEL, GENERATOR_PRIMARY_MODEL, GENERATOR_SECONDARY_MODEL, getGeminiApiUrl, testGeminiApiKey };

/**
 * Phân tích đề bài và trực quan hóa theo Input & Output mẫu
 * Quy trình: Gemini 3.5 Flash Lite sinh mô phỏng -> Bộ kiểm thử Logic Tất định (Deterministic Verifier - 0ms) kiểm tra Output, thực thể và cấu trúc -> Nếu sai thì gửi phản hồi yêu cầu AI tự phản tỉnh và sửa lại.
 */
export async function visualizeProblemExample(
  problemText: string,
  imageBase64: string | null,
  userSampleInput: string,
  userSampleOutput: string,
  apiKey: string,
  model: string = GENERATOR_PRIMARY_MODEL
): Promise<SimulationResult> {
  const prompt = buildProblemAnalysisPrompt(problemText, userSampleInput, userSampleOutput);

  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    parts.push({
      inlineData: {
        mimeType,
        data: cleanBase64
      }
    });
  }
  parts.push({ text: prompt });

  let rawResponse: string;
  try {
    rawResponse = await callGemini(parts, apiKey, model, 0.1);
  } catch (err) {
    // Tự động fallback sang model phụ nếu model chính bận
    rawResponse = await callGemini(parts, apiKey, GENERATOR_SECONDARY_MODEL, 0.1);
  }

  let parsed = validateAndCleanSimulationResult(rawResponse);
  parsed = applySpecializedProcessor(parsed, userSampleOutput);
  parsed = normalizeSimulationFrames(parsed);

  // === BƯỚC KIỂM THỬ BẰNG CODE LOGIC TẤT ĐỊNH (DETERMINISTIC VERIFIER - 0ms) ===
  const verification = verifySimulationDeterministically(
    problemText,
    userSampleInput,
    userSampleOutput,
    parsed
  );

  // Nếu phát hiện sai sót (sai Output, sai thực thể hoặc thiếu cấu trúc), yêu cầu Generator tự phản tỉnh & sửa lại
  if (!verification.isValid) {
    const feedbackPrompt = `
BẢN MÔ PHỎNG TRƯỚC ĐÓ CỦA BẠN ĐÃ BỊ HỆ THỐNG KIỂM THỬ TỪ CHỐI VÌ CÁC LÝ DO SAU:
${verification.reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

HƯỚNG DẪN SỬA ĐỔI TỪ HỆ THỐNG:
${verification.suggestedFixes.map((f, i) => `${i + 1}. ${f}`).join('\n')}

=== ĐỀ BÀI GỐC ===
${problemText}

=== INPUT CỦA TEST CASE ===
${userSampleInput || '(Theo đề bài)'}

=== OUTPUT KỲ VỌNG ===
${userSampleOutput || '(Theo đề bài)'}

YÊU CẦU BẮT BUỘC:
1. Dùng đúng thực thể theo đề bài (ví dụ: nếu đề bài nói về học sinh, máy tính, mạng LAN, game thì mô phỏng các máy tính và học sinh, TUYỆT ĐỐI KHÔNG ĐƯỢC biến thành thùng nước/bình nước hay bài toán khác).
2. Chọn viewType và subType phù hợp nhất.
3. Đảm bảo các bước mô phỏng tính toán chính xác và khớp với Output kỳ vọng: ${userSampleOutput || '(kết quả đúng theo đề)'}.
4. Trả về định dạng JSON SimulationResult hoàn chỉnh (TUYỆT ĐỐI KHÔNG CHÈN COMMENT // HOẶC /* */ VÀO TRONG JSON).
`;

    const retryParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      retryParts.push({
        inlineData: { mimeType, data: cleanBase64 }
      });
    }
    retryParts.push({ text: feedbackPrompt });

    try {
      const retryResponse = await callGemini(retryParts, apiKey, model, 0.1);
      const retryParsed = validateAndCleanSimulationResult(retryResponse);
      parsed = applySpecializedProcessor(retryParsed, userSampleOutput);
      parsed = normalizeSimulationFrames(parsed);
    } catch (retryErr) {
      console.warn("Lỗi khi chạy feedback retry:", retryErr);
    }
  }

  // Đối soát output nếu người dùng nhập sample output
  if (userSampleOutput && userSampleOutput.trim() !== '') {
    const normUser = normalizeOutput(userSampleOutput);
    const normSim = normalizeOutput(parsed.sampleOutput || '');
    if (normUser === normSim) {
      parsed.outputMatches = true;
      parsed.userExpectedOutput = userSampleOutput.trim();
      parsed.outputMismatchWarning = undefined;
    } else {
      parsed.outputMatches = false;
      parsed.userExpectedOutput = userSampleOutput.trim();
      parsed.outputMismatchWarning = `⚠️ Output bạn nhập (${userSampleOutput.trim()}) chưa khớp với kết quả thuật toán theo đề bài (${parsed.sampleOutput}).`;
    }
  }

  return parsed;
}

/**
 * Trực quan hóa Custom Test Case do người dùng tự nhập
 * Tích hợp kiểm thử tất định và vòng lặp tự phản tỉnh nếu sai lệch.
 */
export async function visualizeCustomTest(
  problemTitle: string,
  problemSummary: string,
  viewType: string,
  customTestInput: string,
  customTestOutput: string = '',
  apiKey: string,
  model: string = GENERATOR_PRIMARY_MODEL,
  context?: Partial<CustomTestContext>
): Promise<SimulationResult> {
  const vType = viewType as ViewType;
  const prompt = buildCustomTestPrompt(
    problemTitle,
    problemSummary,
    vType,
    customTestInput,
    customTestOutput,
    context
  );

  let rawResponse: string;
  try {
    rawResponse = await callGemini([{ text: prompt }], apiKey, model, 0.1);
  } catch (err) {
    rawResponse = await callGemini([{ text: prompt }], apiKey, GENERATOR_SECONDARY_MODEL, 0.1);
  }

  let parsed = validateAndCleanSimulationResult(rawResponse);
  parsed = applySpecializedProcessor(parsed, customTestOutput);
  parsed = normalizeSimulationFrames(parsed);

  // Kiểm tra đối soát với output mong muốn của người dùng
  const hasExpectedOutput = !!customTestOutput && customTestOutput.trim() !== '';
  if (hasExpectedOutput) {
    const normExpected = normalizeOutput(customTestOutput);
    const normActual = normalizeOutput(parsed.sampleOutput || '');
    const isMismatch = parsed.outputMatches === false || (normActual && normExpected && normActual !== normExpected);

    if (isMismatch) {
      // Tự động gọi lại với Verifier feedback
      try {
        const retryPrompt = `
BẠN ĐANG TRONG BƯỚC TỰ KIỂM TRA LẠI (SELF-CORRECTION RETRY):
Bài toán: "${problemTitle}"
Mô tả: "${problemSummary}"
Dạng trực quan hóa: "${viewType}"
Bối cảnh: ${context?.problemStatement || problemSummary}

Custom Input:
${customTestInput}

Output mong muốn của người dùng:
${customTestOutput.trim()}

Kết quả lần tính trước của bạn:
${parsed.sampleOutput}

Nhiệm vụ:
1. Đọc lại thật kỹ quy tắc bài toán.
2. Kiểm tra lại xem Output mong đợi của người dùng có thực sự SAI hay ĐÚNG.
3. Nếu người dùng ĐÚNG và bạn tính nhầm: Hãy sửa lại kết quả, đặt "outputMatches": true, "sampleOutput": "${customTestOutput.trim()}", "outputMismatchWarning": null.
4. Nếu bạn chắc chắn 100% người dùng SAI: Giữ "outputMatches": false, giải thích rõ lý do tại sao sai trong "outputMismatchWarning".

Trả về JSON SimulationResult đầy đủ.
`;
        const retryResponse = await callGemini([{ text: retryPrompt }], apiKey, model, 0.1);
        const retryParsed = validateAndCleanSimulationResult(retryResponse);
        parsed = applySpecializedProcessor(retryParsed, customTestOutput);
        parsed = normalizeSimulationFrames(parsed);
      } catch (retryErr) {
        // Nếu retry gặp lỗi thì vẫn giữ kết quả trước
      }
    }
  }

  return parsed;
}
