// We dynamically import the '@google/generative-ai' SDK to avoid compile-time errors when
// the package is not installed in the project. If missing, we throw a clear error telling
// the developer how to install it.

// NOTE: Storing the API key in client code is insecure. You provided the key earlier; keep
// doing this only in local/dev/testing. For production, use a backend proxy.
const GEMINI_API_KEY = "AIzaSyBip7sULJoCXfitgcPyWK20j5RIEYI6LtM";

export const aiService = {
  async askAI(input: string, flowers: any[], chatMessages: any[]) {
    // dynamic import
    let GoogleGenerativeAI: any;
    try {
      // @ts-ignore: optional runtime dependency; instruct developer to install if missing
      const mod: any = await import('@google/generative-ai');
      GoogleGenerativeAI = mod.GoogleGenerativeAI ?? mod.default?.GoogleGenerativeAI ?? mod.default ?? mod;
    } catch (err) {
      throw new Error(
        "Please install '@google/generative-ai' in your project: npm install @google/generative-ai --save"
      );
    }

    if (!GoogleGenerativeAI) {
      throw new Error("@google/generative-ai import failed or has unexpected shape");
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY as any);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const flowersText = (flowers || [])
      .map((f: any) => `- ${f.name} (Loại: ${f.category}, Giá: ${f.price} VND, Mô tả: ${f.description})`)
      .join('\n');

    const historyText = (chatMessages || []).map((m: any) => `${m.sender === 'user' ? 'Người dùng' : 'AI'}: ${m.text}`).join('\n');

    const prompt = `Bạn là trợ lý tư vấn hoa.\nDanh sách hoa hiện có:\n${flowersText}\n\nLịch sử chat:\n${historyText}\n\nCâu hỏi khách hàng: "${input}"\nNhiệm vụ: Đưa ra 1-2 loại hoa phù hợp và gợi ý mức giá. Trả lời thân thiện, ngắn gọn bằng tiếng Việt.`;

    const result: any = await model.generateContent(prompt);

    // The SDK may return different shapes; attempt to extract text safely.
    const resp = result?.response ?? result;
    if (!resp) return String(result ?? '');

    // If SDK exposes a text() method (as in your working snippet), call it.
    if (typeof resp.text === 'function') return String(resp.text());
    if (typeof resp === 'string') return resp;
    if (typeof resp?.text === 'string') return resp.text;
    if (Array.isArray(resp?.candidates) && resp.candidates[0]) return String(resp.candidates[0].text || resp.candidates[0].content || JSON.stringify(resp.candidates[0]));

    return String(JSON.stringify(resp));
  },
};

export default aiService;
