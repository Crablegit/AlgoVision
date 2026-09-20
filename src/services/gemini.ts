import { SimulationResult, CustomTestContext, ViewType } from '../types';
import { 
  DEFAULT_GEMINI_MODEL, 
  GENERATOR_PRIMARY_MODEL, 
  GENERATOR_SECONDARY_MODEL, 
  VERIFIER_MODEL, 
  getGeminiApiUrl, 
  testGeminiApiKey, 
  callGemini 
} from './geminiClient';
import { buildProblemAnalysisPrompt, buildCustomTestPrompt } from './promptBuilder';
import { validateAndCleanSimulationResult } from './schemaValidator';
import { applySpecializedProcessor } from './specializedProcessors';
import { normalizeSimulationFrames, normalizeOutput } from './normalizer';
import { verifySimulationWithGemini31 } from './verifier';

export { DEFAULT_GEMINI_MODEL, GENERATOR_PRIMARY_MODEL, GENERATOR_SECONDARY_MODEL, VERIFIER_MODEL, getGeminiApiUrl, testGeminiApiKey };

/**
 * Phân tích đề bài và trực quan hóa theo Input & Output mẫu
 * Quy trình: Gemini 3.5 Flash Lite (hoặc 3.8 Flash) sinh mô phỏng -> Gemini 3.1 Flash Lite kiểm thử (Verifier) -> Nếu chưa đạt thì trả feedback cho Generator sửa lại.
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

  // === BƯỚC KIỂM THỬ BẰNG GEMINI 3.1 FLASH LITE (VERIFIER AGENT) ===
  try {
    const verification = await verifySimulationWithGemini31(
      problemText,
      userSampleInput,
      userSampleOutput,
      parsed,
      apiKey
    );

    // Nếu Verifier đánh giá chưa đạt (score < 8 hoặc isValid = false), gửi feedback để Generator sửa lại
    if (!verification.isValid) {
      const feedbackPrompt = `
BẢN MÔ PHỎNG TRƯỚC ĐÓ CỦA BẠN ĐÃ BỊ HỆ THỐNG KIỂM THỬ (GEMINI 3.1) TỪ CHỐI VỚI ĐIỂM SỐ ${verification.score}/10.

LÝ DO TỪ CHỐI & NHẬN XÉT:
${verification.critique}

HƯỚNG DẪN SỬA ĐỔI BẮT BUỘC TỪ KIỂM THỬ VIÊN:
${verification.suggestedFixes || 'Hãy chỉnh sửa lại thực thể đúng với ngữ cảnh đề bài và tính đúng kết quả output.'}

=== ĐỀ BÀI GỐC ===
${problemText}

=== INPUT CỦA TEST CASE ===
${userSampleInput}

=== OUTPUT KỲ VỌNG ===
${userSampleOutput}

YÊU CẦU BẮT BUỘC:
1. Dùng đúng thực thể theo đề bài (ví dụ: đề nói về học sinh, máy tính, mạng LAN thì mô phỏng các máy tính và học sinh, TUYỆT ĐỐI KHÔNG ĐƯỢC biến thành thùng nước hay dạng khác).
2. Chọn viewType và subType phù hợp nhất.
3. Đảm bảo các bước mô phỏng tính toán chính xác và khớp với Output kỳ vọng: ${userSampleOutput}.
4. Trả về định dạng JSON SimulationResult hoàn chỉnh.
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
  } catch (verifyErr) {
    console.warn("Bỏ qua bước verify do lỗi:", verifyErr);
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
 * Tích hợp kiểm thử Gemini 3.1 Flash Lite và vòng lặp phản hồi feedback.
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
