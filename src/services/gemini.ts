import { SimulationResult } from '../types';

const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Kiểm tra xem Gemini API Key có hợp lệ hay không
 */
export async function testGeminiApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'OK' }] }],
        generationConfig: { maxOutputTokens: 5 }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { 
        valid: false, 
        error: errData?.error?.message || `Lỗi Gemini API (${res.status})` 
      };
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err.message || "Không thể kết nối tới Google Gemini API." };
  }
}

/**
 * Phân tích đề bài (ảnh hoặc chữ) và sinh trực quan hóa cho TEST VÍ DỤ CỦA ĐỀ BÀI
 * (KHÔNG phân tích thuật toán hay độ phức tạp)
 */
export async function visualizeProblemExample(
  problemText: string,
  imageBase64: string | null,
  apiKey: string
): Promise<SimulationResult> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("Vui lòng nhập Gemini API Key của bạn trước khi tiếp tục.");
  }

  const systemInstruction = `
Bạn là công cụ trực quan hóa đề bài (Problem Test Visualizer).
Nhiệm vụ của bạn DUY NHẤT là:
1. Đọc hiểu đề bài (từ văn bản hoặc hình ảnh chụp đề bài được cung cấp).
2. Tìm 1 test case ví dụ (Example Test) tiêu biểu nhất có trong đề bài.
3. Mô phỏng từng bước (Step-by-step) diễn biến của test ví dụ đó để người dùng nhìn vào là hiểu ngay đề bài đang yêu cầu gì và dữ liệu biến đổi ra sao.
4. TUYỆT ĐỐI KHÔNG giải thích thuật toán, KHÔNG phân tích độ phức tạp thời gian/không gian O(n).
5. Trả về định dạng JSON DUY NHẤT theo schema sau, KHÔNG thêm bất kỳ văn bản nào ngoài JSON:

{
  "problemTitle": "Tên ngắn gọn của bài toán",
  "problemSummary": "Tóm tắt ngắn gọn trong 1 câu đề bài yêu cầu làm gì",
  "exampleInput": "Nội dung input của test ví dụ (ví dụ: nums = [2, 7, 11, 15], target = 9)",
  "frames": [
    {
      "step": 0,
      "description": "Mô tả ngắn gọn việc đang diễn ra ở bước này bằng tiếng Việt",
      "elements": [mảng các phần tử số hoặc chữ, ví dụ [2, 7, 11, 15]],
      "highlights": [danh sách các index phần tử đang được xét ở bước này, ví dụ [0, 1]],
      "pointers": {"tên_con_trỏ": chỉ_số_index, ví dụ {"i": 0, "j": 1}},
      "variables": {"tên_biến": "giá_trị", ví dụ {"target": 9, "currentSum": 9}},
      "status": "normal" | "comparing" | "found" | "swapping" | "done"
    }
  ]
}

Lưu ý:
- "elements" là mảng các giá trị cụ thể.
- "pointers" chỉ rõ tên con trỏ và index tương ứng.
- Tạo khoảng 5-10 bước để người dùng thấy rõ tiến trình của test ví dụ.
`;

  // Xây dựng parts cho nội dung gửi lên Gemini
  const parts: any[] = [{ text: systemInstruction }];

  if (imageBase64) {
    // Tách mimeType và base64 data
    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      });
    }
  }

  if (problemText && problemText.trim()) {
    parts.push({
      text: `ĐỀ BÀI HOẶC GHI CHÚ BỔ SUNG:\n${problemText.trim()}`
    });
  } else {
    parts.push({
      text: "Hãy đọc đề bài từ hình ảnh đính kèm và trực quan hóa test case ví dụ của đề."
    });
  }

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Lỗi Gemini API (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!rawText) throw new Error("Không nhận được phản hồi từ Gemini.");

    const parsed: SimulationResult = JSON.parse(rawText);
    if (!parsed.frames || !Array.isArray(parsed.frames) || parsed.frames.length === 0) {
      throw new Error("Không tạo được các bước mô phỏng cho test ví dụ.");
    }

    return parsed;
  } catch (error: any) {
    console.error("Lỗi trực quan hóa:", error);
    throw error;
  }
}

/**
 * Trực quan hóa một CUSTOM TEST do người dùng nhập sau khi đã hiểu đề
 */
export async function visualizeCustomTest(
  problemTitle: string,
  problemSummary: string,
  customTestInput: string,
  apiKey: string
): Promise<SimulationResult> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("Vui lòng nhập Gemini API Key.");
  }

  const prompt = `
Bạn là công cụ trực quan hóa dữ liệu thuật toán.
Bài toán đang xét: "${problemTitle}"
Mô tả bài toán: "${problemSummary}"

Người dùng muốn xem trực quan hóa với TEST CASE TỰ NHẬP SAU ĐÂY:
${customTestInput}

Hãy mô phỏng từng bước chạy của bài toán với test case này và trả về định dạng JSON DUY NHẤT:
{
  "problemTitle": "${problemTitle}",
  "problemSummary": "${problemSummary}",
  "exampleInput": "${customTestInput}",
  "frames": [
    {
      "step": 0,
      "description": "Mô tả ngắn gọn bước này bằng tiếng Việt",
      "elements": [mảng các phần tử],
      "highlights": [chỉ số index đang xét],
      "pointers": {"tên_con_trỏ": chỉ_số_index},
      "variables": {"tên_biến": "giá_trị"},
      "status": "normal" | "comparing" | "found" | "swapping" | "done"
    }
  ]
}
`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
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
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed: SimulationResult = JSON.parse(rawText);
    return parsed;
  } catch (error: any) {
    console.error("Lỗi custom test:", error);
    throw error;
  }
}
