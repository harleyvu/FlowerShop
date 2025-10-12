import { GoogleGenerativeAI } from "@google/generative-ai";
const GEMINI_API_KEY = "AIzaSyBip7sULJoCXfitgcPyWK20j5RIEYI6LtM";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const aiService = {
  async askAI(input: string, flowers: any[], chatMessages: any[]) {
    const flowersText = flowers
      .map(f => `- ${f.name} (Loại: ${f.category}, Giá: ${f.price} VND, Mô tả: ${f.description})`)
      .join("\n");

    const historyText = chatMessages
      .map(m => `${m.sender === "user" ? "Người dùng" : "AI"}: ${m.text}`)
      .join("\n");

    const prompt = `
Bạn là trợ lý tư vấn hoa.
Danh sách hoa hiện có:
${flowersText}

Lịch sử chat:
${historyText}

Câu hỏi khách hàng: "${input}"
Nhiệm vụ: Đưa ra 1-2 loại hoa phù hợp và gợi ý mức giá. Trả lời thân thiện, ngắn gọn bằng tiếng Việt.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  },
};
