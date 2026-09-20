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
 * Phân tích đề bài và sinh mô phỏng test ví dụ với viewType trực quan tối ưu nhất
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
Bạn là công cụ trực quan hóa đề bài thi lập trình thi đấu (CP Problem Visualizer).
Nhiệm vụ của bạn:
1. Đọc hiểu đề bài (từ văn bản hoặc ảnh chụp đề bài đính kèm).
2. Trích xuất:
   - "problemTitle": Tên bài toán
   - "problemSummary": Tóm tắt 1 câu ngắn gọn đề bài yêu cầu làm gì
   - "tags": Mảng 2-4 tags phân loại dạng bài (ví dụ: ["2D-Grid", "Subrectangle"], ["Intervals", "Greedy"], ["Graph", "DSU"], ["Shortest-Path", "Dijkstra"], ["Tree", "DFS"], ["Circular", "Ring"], ["Array", "Two-Pointers"])
   - "sampleInput": Chuỗi dữ liệu input mẫu của đề
   - "sampleOutput": Chuỗi kết quả output mẫu của đề
   - "viewType": TỰ ĐỘNG CHỌN 1 TRONG CÁC DẠNG SAU ĐỂ TRỰC QUAN HÓA DỄ HIỂU NHẤT:
     * "grid": Nếu đề bài là bảng 2D, ma trận, bản đồ chữ cái, hình chữ nhật con (như bài tìm hình chữ nhật nhỏ nhất).
     * "intervals": Nếu đề bài là các đoạn thẳng trên trục số, bài toán phủ đoạn, khoảng thời gian [start, end].
     * "graph": Nếu đề bài là đồ thị, cây, DSU nối đỉnh, tìm đường đi ngắn nhất.
     * "circular": Nếu đề bài là vòng tròn, mảng xoay vòng, bài toán Josephus.
     * "array": Nếu là mảng 1D thông thường, 2 con trỏ, binary search.
3. Mô phỏng từng bước (Step-by-step) diễn biến của test ví dụ đó để người dùng nhìn vào là hiểu ngay đề bài đang yêu cầu gì và dữ liệu biến đổi ra sao.
4. TUYỆT ĐỐI KHÔNG phân tích thuật toán, KHÔNG giảng giải độ phức tạp O(n).

Trả về định dạng JSON DUY NHẤT theo schema sau:
{
  "problemTitle": "Tên bài toán",
  "problemSummary": "Tóm tắt ngắn gọn yêu cầu",
  "tags": ["Tag1", "Tag2"],
  "sampleInput": "...",
  "sampleOutput": "...",
  "viewType": "grid" | "intervals" | "graph" | "circular" | "array",
  "frames": [
    {
      "step": 0,
      "description": "Mô tả bước này bằng tiếng Việt",
      
      // Nếu viewType là "grid":
      "grid": [["A", "B"], ["C", "D"]],
      "selectedBox": {"r1": 0, "c1": 0, "r2": 1, "c2": 1},
      "cellHighlights": [{"r": 0, "c": 0, "status": "found"}],

      // Nếu viewType là "intervals":
      "intervals": [{"id": "1", "label": "Đoạn 1", "start": 1, "end": 5, "highlight": true}],
      "axisRange": {"min": 0, "max": 10},

      // Nếu viewType là "graph" hoặc "circular":
      "nodes": [{"id": "1", "label": "A", "highlight": true, "group": 0}],
      "edges": [{"from": "1", "to": "2", "highlight": true, "weight": 5}],

      // Nếu viewType là "array":
      "elements": [1, 2, 3],
      "highlights": [0, 1],
      "pointers": {"left": 0, "right": 2},

      "variables": {"biến": "giá_trị"}
    }
  ]
}
`;

  const parts: any[] = [{ text: systemInstruction }];

  if (imageBase64) {
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
      text: `NỘI DUNG ĐỀ BÀI HOẶC GHI CHÚ BỔ SUNG:\n${problemText.trim()}`
    });
  } else {
    parts.push({
      text: "Hãy đọc đề bài từ hình ảnh đính kèm, xác định viewType trực quan tối ưu nhất và mô phỏng test ví dụ."
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
      throw new Error(errData?.error?.message || `Lỗi Gemini API (${res.status})`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!rawText) throw new Error("Không nhận được phản hồi từ Gemini.");

    const parsed: SimulationResult = JSON.parse(rawText);
    return parsed;
  } catch (error: any) {
    console.error("Lỗi trực quan hóa:", error);
    throw error;
  }
}

/**
 * Trực quan hóa Custom Test Case do người dùng tự nhập
 */
export async function visualizeCustomTest(
  problemTitle: string,
  problemSummary: string,
  viewType: string,
  customTestInput: string,
  apiKey: string
): Promise<SimulationResult> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("Vui lòng nhập Gemini API Key.");
  }

  const prompt = `
Bài toán: "${problemTitle}"
Mô tả: "${problemSummary}"
Dạng trực quan hóa (viewType): "${viewType}"

Người dùng muốn mô phỏng với CUSTOM TEST CASE sau:
${customTestInput}

Hãy mô phỏng từng bước test này theo đúng định dạng "${viewType}" và trả về JSON:
{
  "problemTitle": "${problemTitle}",
  "problemSummary": "${problemSummary}",
  "tags": ["Custom-Test"],
  "sampleInput": "${customTestInput}",
  "sampleOutput": "Kết quả tương ứng",
  "viewType": "${viewType}",
  "frames": [
    {
      "step": 0,
      "description": "Mô tả bước này bằng tiếng Việt",
      "grid": ...,
      "selectedBox": ...,
      "cellHighlights": ...,
      "intervals": ...,
      "nodes": ...,
      "edges": ...,
      "elements": ...,
      "highlights": ...,
      "pointers": ...,
      "variables": ...
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
