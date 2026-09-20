export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";
export const GENERATOR_PRIMARY_MODEL = "gemini-3.5-flash-lite";
export const GENERATOR_SECONDARY_MODEL = "gemini-3.8-flash";

export function getGeminiApiUrl(model: string = DEFAULT_GEMINI_MODEL): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model.trim()}:generateContent`;
}

/**
 * Kiểm tra xem Gemini API Key có hợp lệ hay không
 */
export async function testGeminiApiKey(
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL
): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch(`${getGeminiApiUrl(model)}?key=${apiKey.trim()}`, {
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
 * Gọi Gemini API với text hoặc image và nhận response JSON
 */
export async function callGemini(
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>,
  apiKey: string,
  model: string = DEFAULT_GEMINI_MODEL,
  temperature: number = 0.1
): Promise<string> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("Vui lòng nhập Gemini API Key của bạn.");
  }

  let res = await fetch(`${getGeminiApiUrl(model)}?key=${apiKey.trim()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature,
        maxOutputTokens: 8192
      }
    })
  });

  // Nếu model trả về 404 (chưa có model này trên API Google), tự động thử fallback sang DEFAULT_GEMINI_MODEL
  if (!res.ok && res.status === 404 && model !== DEFAULT_GEMINI_MODEL) {
    res = await fetch(`${getGeminiApiUrl(DEFAULT_GEMINI_MODEL)}?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature,
          maxOutputTokens: 8192
        }
      })
    });
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Lỗi Gemini API (${res.status})`);
  }

  const data = await res.json();
  const partsList = data?.candidates?.[0]?.content?.parts || [];
  const rawText = partsList.map((p: any) => p.text || '').join('');

  if (!rawText.trim()) {
    const finishReason = data?.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
      throw new Error(`Mô hình dừng lại với lý do: ${finishReason}`);
    }
    const blockReason = data?.promptFeedback?.blockReason;
    if (blockReason) {
      throw new Error(`Yêu cầu bị chặn: ${blockReason}`);
    }
    throw new Error("Mô hình AI không trả về dữ liệu.");
  }

  return rawText;
}
