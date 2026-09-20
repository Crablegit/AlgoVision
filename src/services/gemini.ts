import { SimulationResult } from '../types';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Kiểm tra xem API Key có hợp lệ hay không
 */
export async function testGeminiApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Trả về đúng 1 chữ: OK' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { 
        valid: false, 
        error: errData?.error?.message || `Lỗi HTTP ${res.status}: ${res.statusText}` 
      };
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err.message || "Không thể kết nối tới Google Gemini API." };
  }
}

/**
 * Phân tích đề bài và sinh các bước mô phỏng (frames)
 */
export async function analyzeAndVisualizeProblem(
  problemText: string,
  customInput: string,
  apiKey: string
): Promise<SimulationResult> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("Vui lòng điền Gemini API Key của bạn trước khi thực hiện.");
  }

  const systemInstruction = `
Bạn là một chuyên gia thuật toán và trực quan hóa dữ liệu (Algorithm Visualizer Engine).
Nhiệm vụ của bạn:
1. Đọc hiểu đề bài lập trình được cung cấp.
2. Trích xuất test case (sử dụng test case từ custom input nếu có, hoặc dùng test case mẫu của đề).
3. Mô phỏng thuật toán từng bước (Step-by-step) để người học hiểu sâu cơ chế hoạt động.
4. Trả về định dạng JSON DUY NHẤT theo schema sau, KHÔNG thêm bất kỳ văn bản giải thích nào ngoài JSON:

{
  "problemTitle": "Tên ngắn gọn của bài toán",
  "problemSummary": "Giải thích ngắn gọn (1-2 câu) mục tiêu và ý tưởng chính của bài toán bằng tiếng Việt",
  "algorithmName": "Tên thuật toán sử dụng (ví dụ: Two Pointers, Binary Search, Sliding Window, DP...)",
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
      "highlights": [danh sách các index phần tử đang được xét hoặc so sánh, ví dụ [0, 3]],
      "pointers": {"tên_con_trỏ": chỉ_số_index, ví dụ {"left": 0, "right": 3}},
      "variables": {"tên_biến": "giá_trị", ví dụ {"target": 9, "currentSum": 17}},
      "status": "normal" | "comparing" | "found" | "swapping" | "done"
    }
  ]
}

Lưu ý quan trọng:
- Số lượng frames nên từ 5 đến 15 bước để người dùng theo dõi được toàn bộ tiến trình mà không bị quá dài.
- "elements" phải là một mảng cụ thể các giá trị (số hoặc chuỗi ngắn).
- "pointers" phải chỉ rõ tên (left, right, i, j, mid, curr...) và vị trí index tương ứng trong "elements".
- "description" phải viết bằng tiếng Việt dễ hiểu, giải thích rõ logic vì sao biến hoặc con trỏ lại thay đổi.
`;

  const userPrompt = `
ĐỀ BÀI:
${problemText}

TEST CASE / ĐẦU VÀO CẦN MÔ PHỎNG:
${customInput ? customInput : "Hãy tự chọn 1 test case tiêu biểu của đề bài"}
`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
      throw new Error(errData?.error?.message || `Lỗi API (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("Không nhận được dữ liệu phản hồi từ mô hình Gemini.");
    }

    const parsed: SimulationResult = JSON.parse(rawText);
    
    // Kiểm tra cấu trúc dữ liệu cơ bản
    if (!parsed.frames || !Array.isArray(parsed.frames) || parsed.frames.length === 0) {
      throw new Error("Dữ liệu trả về không chứa các bước mô phỏng hợp lệ.");
    }

    return parsed;
  } catch (error: any) {
    console.error("Lỗi phân tích đề bài:", error);
    throw error;
  }
}
