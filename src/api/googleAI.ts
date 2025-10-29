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

    // Detect language based on input
    const isVietnamese = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(input);
    const isEnglish = /^[a-zA-Z\s\d\.,!?'-]+$/.test(input.trim());
    
    let detectedLanguage = 'English';
    if (isVietnamese) {
      detectedLanguage = 'Vietnamese';
    } else if (!isEnglish) {
      // Could be another language - let AI detect
      detectedLanguage = 'the same language as the customer';
    }

    const flowersText = (flowers || [])
      .map((f: any) => `- ${f.name} (Category: ${f.category}, Price: ${f.price} VND, Description: ${f.description})`)
      .join('\n');

    const historyText = (chatMessages || [])
      .map((m: any) => `${m.sender === 'user' ? 'Customer' : 'AI'}: ${m.text}`)
      .join('\n');

    // Check if this is the first message (greeting)
    const isFirstMessage = !chatMessages || chatMessages.length === 0;

    let prompt = '';
    
    if (isFirstMessage) {
      // First message: Always greet in English, then respond in detected language
      prompt = `You are a friendly flower shop assistant.

Available flowers:
${flowersText}

IMPORTANT INSTRUCTIONS:
1. Start with a warm English greeting (e.g., "Hello! Welcome to Flowerfly 🌸")
2. Then respond to the customer's question in ${detectedLanguage}
3. Suggest 1-2 suitable flowers with prices
4. Keep responses friendly, concise, and helpful
5. Use emojis appropriately 🌺🌸💐

Customer's first message: "${input}"

Remember: Greet in English first, then continue in ${detectedLanguage}.`;
    } else {
      // Subsequent messages: Respond in the detected language
  prompt = `You are a friendly flower shop assistant.

Available flowers:
${flowersText}

Chat history:
${historyText}

IMPORTANT INSTRUCTIONS:
0. Do NOT start your response with a greeting (e.g., "Hello", "Hi", "Chào bạn"). Greetings should ONLY be used in the assistant's very first message in a conversation.
1. Respond in ${detectedLanguage} (the same language the customer is using)
2. Suggest 1-2 suitable flowers with prices when appropriate
3. Keep responses friendly, concise, and helpful
4. Use emojis appropriately 🌺🌸💐
5. Be consistent with the language throughout the conversation

Customer's question: "${input}"`;
    }

    const result: any = await model.generateContent(prompt);

    // The SDK may return different shapes; attempt to extract text safely.
    const resp = result?.response ?? result;
    if (!resp) return String(result ?? '');

    // If SDK exposes a text() method (as in your working snippet), call it.
    if (typeof resp.text === 'function') return String(resp.text());
    if (typeof resp === 'string') return resp;
    if (typeof resp?.text === 'string') return resp.text;
    if (Array.isArray(resp?.candidates) && resp.candidates[0]) {
      return String(
        resp.candidates[0].text || 
        resp.candidates[0].content || 
        JSON.stringify(resp.candidates[0])
      );
    }

    return String(JSON.stringify(resp));
  },
};

export default aiService;