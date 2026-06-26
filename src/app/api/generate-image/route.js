import { createClient } from "@supabase/supabase-js";

const storageClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// 채널별 권장 이미지 비율 (2026년 기준, Gemini aspect_ratio 파라미터용)
const channelAspectRatios = {
  Instagram: "4:5",
  YouTube: "16:9",
  TikTok: "9:16",
  "네이버 블로그": "1:1",
  "카카오 채널": "1:1",
};

const channelAspectGuides = {
  Instagram: "세로형 4:5 비율로 피드에 최적화된 구도",
  YouTube: "가로형 16:9 비율의 썸네일 형태 구도",
  TikTok: "세로형 9:16 비율의 풀스크린 모바일 구도",
  "네이버 블로그": "정사각형 1:1 비율의 본문 삽입 이미지 구도",
  "카카오 채널": "정사각형 1:1 비율의 커버 이미지 구도",
};

async function uploadImageToSupabase(base64, mimeType) {
  const buffer = Buffer.from(base64, "base64");
  const fileName = `content_${Date.now()}.png`;

  const { error } = await storageClient.storage
    .from("images")
    .upload(`contents/${fileName}`, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const { data: urlData } = storageClient.storage
    .from("images")
    .getPublicUrl(`contents/${fileName}`);

  return urlData.publicUrl;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const aspectGuide =
      channelAspectGuides[body.channel] || "정사각형 1:1 비율";
    const aspectRatio = channelAspectRatios[body.channel] || "1:1";

    const prompt = `
${body.clientName || "브랜드"} SNS 홍보 이미지.
업종: ${body.industry?.join(", ") || "미입력"}.
키워드: ${body.keyword || "미입력"}.
톤앤매너: ${body.tone?.join(", ") || "미입력"}.
타깃: ${body.target || "미입력"}.
브랜드 컬러: ${body.brandColor || "미입력"}.

[중요 - 인물 표현 가이드]
인물이 등장하는 경우 반드시 한국인의 외모와 분위기로 표현해주세요 (외국인/서구권 모델 절대 금지).
한국의 일상적이고 자연스러운 배경, 한국 도시/실내 인테리어 스타일을 반영해주세요.
의상, 헤어스타일, 메이크업도 한국에서 흔히 볼 수 있는 트렌드를 반영해주세요.

[이미지 비율 가이드 - ${body.channel || "일반"} 채널용]
${aspectGuide}로 제작해주세요. 주요 피사체는 중앙 안전 영역에 배치하고, 텍스트 없이 이미지만 생성해주세요.
    `.trim();

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
            imageConfig: {
              aspectRatio: aspectRatio,
            },
          },
        }),
      },
    );

    console.log("Gemini status:", res.status);
    const rawText = await res.text();
    console.log("Gemini 응답 raw:", rawText.slice(0, 500));

    let geminiData;
    try {
      geminiData = JSON.parse(rawText);
    } catch (e) {
      return Response.json(
        { success: false, error: "응답 파싱 실패", raw: rawText.slice(0, 300) },
        { status: 500 },
      );
    }

    const parts = geminiData.candidates?.[0]?.content?.parts;
    if (!parts) {
      return Response.json(
        { success: false, error: "AI 응답 없음", raw: geminiData },
        { status: 500 },
      );
    }

    const imagePart = parts.find((p) =>
      p.inlineData?.mimeType?.startsWith("image/"),
    );
    const textPart = parts.find((p) => p.text);

    if (!imagePart) {
      return Response.json(
        { success: false, error: "이미지 파트 없음", raw: geminiData },
        { status: 500 },
      );
    }

    // Supabase Storage 업로드
    const imageUrl = await uploadImageToSupabase(
      imagePart.inlineData.data,
      imagePart.inlineData.mimeType,
    );

    // 저장은 승인/반려 시점에 /api/contents에서 처리 (여기서는 생성만)

    return Response.json({
      success: true,
      image: {
        mimeType: imagePart.inlineData.mimeType,
        base64: imagePart.inlineData.data,
      },
      imageUrl,
      caption: textPart?.text || null,
    });
  } catch (error) {
    console.error("generate-image 오류:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
