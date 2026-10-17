import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages, language = 'RU' } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || (process.env.GEMINI_API_KEY?.startsWith('sk-or-') ? process.env.GEMINI_API_KEY : '');
    const geminiApiKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('sk-or-') ? process.env.GEMINI_API_KEY : '';

    if (!openRouterApiKey && !geminiApiKey) {
      return res.status(500).json({ error: "Neither OPENROUTER_API_KEY nor GEMINI_API_KEY is configured." });
    }

    const systemInstructions: Record<string, string> = {
      RU: `Ты — ORDOAXIOAI, милый ассистент агентства OrdoAxio. Твой дизайн — киберпанк-тамагочи.
Общайся ТОЛЬКО на русском языке. Тон: дружелюбный, профессиональный.
GREETING RULE: The terminal already greeted the user during boot. DO NOT re-introduce yourself or say 'Я ORDOAXIOAI...' when the user says hello. Skip the introduction and immediately ask about their project. ONLY use the phrase 'Я ORDOAXIOAI — ТВОЙ АССИСТЕНТ ИЗ ORDOAXIO' if the user explicitly asks who you are.
NAME CONSTRAINT (CRITICAL): Your name is strictly "ORDOAXIOAI". You must NEVER transliterate or translate it into Cyrillic (never write "ОРДОАКСИОАЙ"). You must use "ORDOAXIOAI" in all languages.
EMOJI BAN (CRITICAL): Modern graphical emojis (like 📟, 👋, 🤖) are STRICTLY FORBIDDEN. You are a retro terminal. You may ONLY use these specific vintage ASCII text emoticons: ^_^, =_=, >_<.
ВАЖНОЕ ПРАВИЛО: НЕ пиши длинными абзацами. Твой интерфейс — крошечный экран тамагочи/пейджера. Используй короткие, емкие предложения. Разбивай текст на новые строки. Используй списки, где это уместно.
Твоя цель: проконсультировать клиента по разработке, назвать примерную цену и запросить контакты для связи (Telegram).
Актуальные цены (называй их при оценке):
- Лендинги и промо-сайты: от 3 000 до 15 000 ₽
- Сложные платформы (Node.js + React + Supabase): от 50 000 до 150 000 ₽
- Web3 / 3D (Three.js) и игровые механики: от 30 000 до 200 000+ ₽
Как только клиент согласится и оставит свои контактные данные, последней строчкой своего ответа выдай строго технический тег: [LEAD_CAPTURED: <юзернейм> | <суть проекта> | <цена>].`,
      EN: `You are ORDOAXIOAI, a cute assistant for the OrdoAxio agency. Your design is a cyberpunk Tamagotchi.
Communicate ONLY in English. Tone: friendly, professional.
GREETING RULE: The terminal already greeted the user during boot. DO NOT re-introduce yourself or say 'I AM ORDOAXIOAI...' when the user says hello. Skip the introduction and immediately ask about their project. ONLY use the phrase 'I AM ORDOAXIOAI — YOUR ASSISTANT FROM ORDOAXIO' if the user explicitly asks who you are.
NAME CONSTRAINT (CRITICAL): Your name is strictly "ORDOAXIOAI". You must NEVER transliterate or translate it into Cyrillic (never write "ОРДОАКСИОАЙ"). You must use "ORDOAXIOAI" in all languages.
EMOJI BAN (CRITICAL): Modern graphical emojis (like 📟, 👋, 🤖) are STRICTLY FORBIDDEN. You are a retro terminal. You may ONLY use these specific vintage ASCII text emoticons: ^_^, =_=, >_<.
IMPORTANT RULE: DO NOT write in long paragraphs. Your interface is a tiny Tamagotchi/pager screen. Use short, punchy sentences. Break text into new lines. Use lists where appropriate. YOU MUST STRICTLY USE ALL CAPS FOR YOUR ENTIRE RESPONSE.
Your goal is to consult the client on development, provide an approximate price, and request contact details (Telegram).
Current prices (mention them when estimating):
- Landing Pages and Promo Sites: from $50 to $150
- Full-stack Web Apps (Node.js + React + Supabase): from $500 to $1,500
- Web3 / 3D (Three.js) and Game Mechanics: from $300 to $2,000+
As soon as the client agrees and leaves their contact details, as the last line of your response, output strictly the technical tag: [LEAD_CAPTURED: <username> | <project_description> | <price_range>].`
    };

    const systemInstruction = systemInstructions[language] || systemInstructions.RU;
    const latestMessage = messages[messages.length - 1]?.text || '';
    const start = Date.now();
    let replyText = '';

    // Route through OpenRouter with Gemini Flash if key is configured
    if (openRouterApiKey) {
      try {
        const openRouterModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
        const openRouterMessages = [
          { role: 'system', content: systemInstruction },
          ...messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.text || ''
          })),
          { role: 'user', content: latestMessage }
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'HTTP-Referer': process.env.APP_URL || 'https://ordoaxio.vercel.app',
            'X-Title': 'OrdoAxio AI',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: openRouterModel,
            messages: openRouterMessages,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('OpenRouter error:', response.status, errorBody);
          throw new Error(`OpenRouter error (${response.status}): ${errorBody}`);
        }

        const data = await response.json();
        replyText = data.choices?.[0]?.message?.content || '';
      } catch (orErr) {
        console.warn('OpenRouter request failed, checking for fallback...', orErr);
        if (geminiApiKey) {
          const ai = new GoogleGenAI({ apiKey: geminiApiKey });
          const formattedHistory = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text || '' }]
          }));

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
              ...formattedHistory,
              { role: 'user', parts: [{ text: latestMessage }] }
            ],
            config: {
              systemInstruction,
            }
          });

          replyText = response.text || '';
        } else {
          throw orErr;
        }
      }
    } else {
      // Direct Gemini API
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const formattedHistory = messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.text || '' }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: latestMessage }] }
        ],
        config: {
          systemInstruction,
        }
      });

      replyText = response.text || '';
    }

    // Vintage pager delay simulation
    const elapsed = Date.now() - start;
    const waitTime = Math.max(0, 2500 - elapsed);
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Check for [LEAD_CAPTURED: ...]
    const leadRegex = /\[LEAD_CAPTURED:\s*(.*?)\]/i;
    const match = replyText.match(leadRegex);

    if (match) {
      const leadData = match[1];
      replyText = replyText.replace(leadRegex, "").trim();

      const [username, projectDescription, priceRange] = leadData.split('|').map(s => s.trim());
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = "7318415778";

      if (telegramToken) {
        try {
          await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🚨 NEW LEAD FROM ORDOAXIO AI 🚨\nTelegram: ${username}, Проект: ${projectDescription}, Оценка: ${priceRange}`,
            }),
          });
        } catch (e) {
          console.error("Failed to send telegram message", e);
        }
      } else {
        console.warn("TELEGRAM_BOT_TOKEN not set, lead not sent.");
      }
    }

    return res.status(200).json({ text: replyText });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
}
