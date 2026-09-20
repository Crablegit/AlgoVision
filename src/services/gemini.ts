import { SimulationResult } from '../types';

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Tự động nhận diện loại API Key:
 * - Bắt đầu bằng 'gsk_' -> Groq API (Llama 3.3 70B - 14.400 lượt/ngày)
 * - Ngược lại -> Google Gemini API
 */
export function detectProvider(apiKey: string): 'groq' | 'gemini' {
  return apiKey.trim().startsWith('gsk_') ? 'groq' : 'gemini';
}

export async function testGeminiApiKey(apiKey: string): Promise<{ valid: boolean; error?: string; provider?: string }> {
  const provider = detectProvider(apiKey);

  try {
    if (provider === 'groq') {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 5
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { valid: false, error: errData?.error?.message || `Lỗi Groq API (${res.status})` };
      }
      return { valid: true, provider: 'Groq (Llama 3.3 70B - 14.400 lượt/ngày)' };
    } else {
      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Trả về đúng 1 chữ: OK' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { valid: false, error: errData?.error?.message || `Lỗi Gemini API (${res.status})` };
      }
      return { valid: true, provider: 'Google Gemini' };
    }
  } catch (err: any) {
    return { valid: false, error: err.message || "Không thể kết nối tới máy chủ API." };
  }
}

export async function analyzeAndVisualizeProblem(
  problemText: string,
  customInput: string,
  apiKey: string
): Promise<SimulationResult> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("Vui lòng điền API Key (Groq hoặc Gemini) trước khi thực hiện.");
  }

  const provider = detectProvider(apiKey);

  const systemInstruction = `
Bạn là một chuyên gia thuật toán và trực quan hóa dữ liệu (Algorithm Visualizer Engine).
Nhiệm vụ của bạn:
1. Đọc hiểu đề bài lập trình được cung cấp.
2. Trích xuất test case (dùng custom input nếu có, hoặc dùng test mẫu của đề).
3. Mô phỏng thuật toán từng bước (Step-by-step) để người học hiểu sâu cơ chế hoạt động.
4. Trả về định dạng JSON DUY NHẤT theo schema sau, KHÔNG thêm bất kỳ văn bản markdown nào ngoài JSON:

{
  "problemTitle": "Tên ngắn gọn của bài toán",
  "problemSummary": "Giải thích ngắn gọn (1-2 câu) mục tiêu và ý tưởng chính bằng tiếng Việt",
  "algorithmName": "Tên thuật toán sử dụng (Two Pointers, Binary Search, DP...)",
  "complexity": {
    "time": "O(...)",
    "space": "O(...)"
  },
  "dataStructure": "array" | "two_pointers" | "binary_search" | "matrix" | "custom",
  "frames": [
    {
      "step": 0,
      "description": "Mô tả chi tiết bằng tiếng Việt việc đang diễn ra ở bước này",
      "elements": [mảng các phần tử số hoặc chữ, ví dụ [2, 7, 11, 15]],
      "highlights": [danh sách các index phần tử đang xét hoặc so sánh, ví dụ [0, 3]],
      "pointers": {"tên_con_trỏ": chỉ_số_index, ví dụ {"left": 0, "right": 3}},
      "variables": {"tên_biến": "giá_trị", ví dụ {"target": 9, "currentSum": 17}},
      "status": "normal" | "comparing" | "found" | "swapping" | "done"
    }
  ]
}

Lưu ý:
- "elements" là mảng cụ thể các giá trị.
- "pointers" phải chỉ rõ tên (left, right, i, j, mid, curr...) và index tương ứng.
- "description" viết bằng tiếng Việt dễ hiểu.
`;

  const userPrompt = `
ĐỀ BÀI:
${problemText}

TEST CASE CẦN MÔ PHỎNG:
${customInput ? customInput : "Hãy tự chọn 1 test case tiêu biểu của đề bài"}
`;

  try {
    let rawText = '';

    if (provider === 'groq') {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Lỗi Groq API (${res.status})`);
      }

      const data = await res.json();
      rawText = data?.choices?.[0]?.message?.content || '';
    } else {
      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Lỗi Gemini API (${res.status})`);
      }

      const data = await res.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    const parsed: SimulationResult = JSON.parse(rawText);
    return parsed;
  } catch (error: any) {
    console.error("Lỗi phân tích đề bài:", error);
    throw error;
  }
}
