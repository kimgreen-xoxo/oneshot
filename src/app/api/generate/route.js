import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const body = await request.json()

    const prompt = `SNS 홍보 텍스트 3가지 버전을 작성해주세요.

고객명: ${body.clientName || '미입력'}
업종: ${body.industry?.join(', ') || '미입력'}
키워드: ${body.keyword || '미입력'}
타깃: ${body.target || '미입력'}
채널: ${Object.keys(body.channelSettings || {}).join(', ') || '미입력'}
톤앤매너: ${body.tone?.join(', ') || '미입력'}
금지표현: ${body.bannedWords || '없음'}

각 버전 200자 이내로 작성해주세요.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    const data = await response.json()
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!result) {
      return Response.json({ success: false, error: 'AI 응답 없음', raw: data }, { status: 500 })
    }

    // Supabase 콘텐츠 저장
    const channels = Object.keys(body.channelSettings || {})
    const { error } = await supabase.from('contents').insert({
      client_name: body.clientName || '',
      channel: channels.join(', '),
      type: '텍스트',
      prompt,
      result,
      status: '검수대기',
      scheduled_date: body.startDate || '',
      image_url: '',
    })

    if (error) console.error('콘텐츠 저장 오류:', error.message)

    return Response.json({ success: true, data: result })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}