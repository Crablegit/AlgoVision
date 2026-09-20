import { SimulationResult, CustomTestContext, ViewType } from '../types';
import { DEFAULT_GEMINI_MODEL, getGeminiApiUrl, testGeminiApiKey, callGemini } from './geminiClient';
import { buildProblemAnalysisPrompt, buildCustomTestPrompt } from './promptBuilder';
import { validateAndCleanSimulationResult } from './schemaValidator';
import { applySpecializedProcessor } from './specializedProcessors';
import { normalizeSimulationFrames, normalizeOutput } from './normalizer';

export { DEFAULT_GEMINI_MODEL, getGeminiApiUrl, testGeminiApiKey };

/**
 * Phân tích đề bài và trực quan hóa theo Input & Output mẫu
 */
export async function visualizeProblemExample(
  problemText: string,
  imageBase64: string | null,
  userSampleInput: string,
  userSampleOutput: string,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL
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

  const rawResponse = await callGemini(parts, apiKey, model, 0.1);
  let parsed = validateAndCleanSimulationResult(rawResponse);

  // Áp dụng bộ xử lý chuyên biệt nếu simulationKind khớp
  parsed = applySpecializedProcessor(parsed, userSampleOutput);

  // Kế thừa và chuẩn hóa frames
  parsed = normalizeSimulationFrames(parsed);

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
 * Hỗ trợ nhận customTestOutput (tùy chọn) và tự động gọi lại 1 lần nữa để tự kiểm tra bản thân nếu kết quả không khớp.
 */
export async function visualizeCustomTest(
  problemTitle: string,
  problemSummary: string,
  viewType: string,
  customTestInput: string,
  customTestOutput: string = '',
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
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

  const rawResponse = await callGemini([{ text: prompt }], apiKey, model, 0.1);
  let parsed = validateAndCleanSimulationResult(rawResponse);

  // Áp dụng bộ xử lý chuyên biệt nếu simulationKind khớp
  parsed = applySpecializedProcessor(parsed, customTestOutput);

  // Kế thừa và chuẩn hóa frames
  parsed = normalizeSimulationFrames(parsed);

  // Kiểm tra đối soát với output mong muốn của người dùng
  const hasExpectedOutput = !!customTestOutput && customTestOutput.trim() !== '';
  if (hasExpectedOutput) {
    const normExpected = normalizeOutput(customTestOutput);
    const normActual = normalizeOutput(parsed.sampleOutput || '');
    const isMismatch = parsed.outputMatches === false || (normActual && normExpected && normActual !== normExpected);

    if (isMismatch) {
      // Tự động gọi lại 1 lần nữa để kiểm tra lại bản thân (Self-correction retry)
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
