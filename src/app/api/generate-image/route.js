import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const storageClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function uploadImageToSupabase(base64, mimeType) {
  const buffer = Buffer.from(base64, 'base64')
  const fileName = `content_${Date.now()}.png`

  const { error } = await storageClient.storage
    .from('images')
    .upload(`contents/${fileName}`, buffer, {
      contentType: mimeType,
      upsert: true,
    })

  if (error) throw new Error(error.message)

  const { data: urlData } = storageClient.storage
    .from('images')
    .getPublicUrl(`contents/${fileName}`)

  return urlData.publicUrl
}

export async function POST(request) {
  try {
    const body = await request.json()

    const prompt = `
${body.clientName || '브랜드'} SNS 홍보 이미지.
업종: ${body.industry?.join(', ') || '미입력'}.
키워드: ${body.keyword || '미입력'}.
톤앤매너: ${body.tone?.join(', ') || '미입력'}.
타깃: ${body.target || '미입력'}.
브랜드 컬러: ${body.brandColor || '미입력'}.
정사각형 SNS 게시물 형식. 텍스트 없이 이미지만.
    `.trim()

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        }),
      }
    )

    console.log('Gemini status:', res.status)
    const rawText = await res.text()
    console.log('Gemini 응답 raw:', rawText.slice(0, 500))

    let geminiData
    try {
      geminiData = JSON.parse(rawText)
    } catch (e) {
      return Response.json(
        { success: false, error: '응답 파싱 실패', raw: rawText.slice(0, 300) },
        { status: 500 }
      )
    }

    const parts = geminiData.candidates?.[0]?.content?.parts
    if (!parts) {
      return Response.json(
        { success: false, error: 'AI 응답 없음', raw: geminiData },
        { status: 500 }
      )
    }

    const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith('image/'))
    const textPart = parts.find((p) => p.text)

    if (!imagePart) {
      return Response.json(
        { success: false, error: '이미지 파트 없음', raw: geminiData },
        { status: 500 }
      )
    }

    // Supabase Storage 업로드
    const imageUrl = await uploadImageToSupabase(
      imagePart.inlineData.data,
      imagePart.inlineData.mimeType
    )

    // Supabase DB 저장
    const { error } = await supabase.from('contents').insert({
      client_name: body.clientName || '',
      channel: body.channel || '',
      type: '이미지',
      prompt,
      result: imageUrl,
      status: '검수대기',
      scheduled_date: body.scheduledDate || '',
      image_url: imageUrl,
    })

    if (error) console.error('콘텐츠 저장 오류:', error.message)

    return Response.json({
      success: true,
      image: {
        mimeType: imagePart.inlineData.mimeType,
        base64: imagePart.inlineData.data,
      },
      imageUrl,
      caption: textPart?.text || null,
    })
  } catch (error) {
    console.error('generate-image 오류:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}