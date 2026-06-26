import { supabase } from '@/lib/supabase'

// 채널별 글쓰기 특성 가이드 (프롬프트 품질의 핵심)
const channelGuides = {
  Instagram: '짧고 임팩트 있는 후킹 문장으로 시작. 이모지 적절히 활용. 본문은 3~5문장 이내로 간결하게. 마지막에 관련 해시태그 5~8개 추천. 친근하고 캐주얼한 어조.',
  YouTube: '영상 설명란용 텍스트. 첫 2줄에 핵심 가치 제안을 담아 더보기 클릭을 유도. 영상 내용 요약, 타임스탬프 형태 고려, 구독/좋아요 유도 문구 포함.',
  TikTok: '매우 짧고 트렌디한 카피. Z세대가 쓰는 표현과 밈 감성 활용. 첫 문장에서 스크롤을 멈추게 할 강한 후킹. 해시태그는 3~5개로 트렌드 위주.',
  '네이버 블로그': 'SEO를 고려한 제목과 본문. 키워드를 자연스럽게 2~3회 반복 노출. 정보성 콘텐츠로 신뢰감을 주는 어조. 소제목으로 단락 구분, 최소 500자 이상의 상세한 본문.',
  '카카오 채널': '친근하고 직접적인 어조. 알림 메시지처럼 핵심 정보를 먼저 전달. 짧은 문단, 이벤트/혜택 강조.',
  Facebook: '스토리텔링 형식. 공감을 이끄는 도입부, 중간에 구체적 사례나 경험 포함. 댓글 유도 질문으로 마무리.',
  Threads: '대화체로 가볍게. 트렌드에 맞는 짧은 문장들의 연속. 논쟁적이거나 흥미를 유발하는 도입부.',
}

export async function POST(request) {
  try {
    const body = await request.json()

    const channels = Object.keys(body.channelSettings || {})
    const channelGuideText = channels
      .map((ch) => `- ${ch}: ${channelGuides[ch] || '일반적인 SNS 톤으로 작성'}`)
      .join('\n')

    const timeLabels = {
      morning: '오전 (7~9시)',
      lunch: '점심 (12~13시)',
      evening: '퇴근 (18~20시)',
      night: '심야 (22~24시)',
    }

    // 같은 고객의 최근 반려 사례 조회 (최대 3건) → 같은 실수를 반복하지 않도록 프롬프트에 반영
    let rejectionContext = ''
    if (body.clientName) {
      const { data: rejectedRows } = await supabase
        .from('contents')
        .select('result, rejection_reason')
        .eq('client_name', body.clientName)
        .eq('status', '반려')
        .not('rejection_reason', 'is', null)
        .order('created_at', { ascending: false })
        .limit(3)

      if (rejectedRows && rejectedRows.length > 0) {
        rejectionContext = `\n[과거 반려 사례 — 아래와 같은 문제를 반복하지 마세요]\n${rejectedRows
          .map((r, i) => `${i + 1}) 반려 이유: ${r.rejection_reason}`)
          .join('\n')}\n`
      }
    }

    const prompt = `당신은 마케팅 콘텐츠 전문 카피라이터입니다. 아래 정보를 바탕으로 SNS 홍보 텍스트 3가지 버전을 작성해주세요.

[고객 정보]
고객명: ${body.clientName || '미입력'}
업종: ${body.industry?.join(', ') || '미입력'}
지역: ${body.region || '전국'}

[전략]
목표: ${body.goal?.join(', ') || '미입력'}
타깃: ${body.target || '미입력'}
핵심 키워드: ${body.keyword || '미입력'}

[발행 정보]
발행 채널: ${channels.join(', ') || '미입력'}
발행 주기: ${body.schedule || '미입력'}
발행 시간대: ${timeLabels[body.publishTime] || '미입력'}

[KPI 목표]
${body.kpi || '미입력'}
※ 이 목표를 달성하기 위한 행동 유도(CTA)를 명확히 포함해주세요.

[톤앤매너]
${body.tone?.join(', ') || '미입력'}

[금지 표현]
${body.bannedWords || '없음'}

[채널별 작성 가이드]
${channelGuideText || '- 일반적인 SNS 톤으로 작성'}
${rejectionContext}
[작성 지침]
1. 위 채널별 작성 가이드의 스타일과 길이 규칙을 엄격히 따라주세요.
2. 각 버전은 서로 다른 후킹 전략(질문형, 통계/숫자 강조형, 공감/스토리형 등)을 사용해 차별화해주세요.
3. 타깃(${body.target || '일반 고객'})이 공감할 수 있는 구체적인 표현을 사용하세요.
4. 핵심 키워드를 자연스럽게 포함하되 키워드 나열처럼 보이지 않게 해주세요.
5. 반드시 명확한 행동 유도 문구(CTA)로 마무리해주세요.
6. 금지 표현은 절대 사용하지 마세요.
7. 절대 "네, ~작성해 드립니다" 같은 인사말이나 설명을 쓰지 말고, 곧바로 콘텐츠 본문만 작성해주세요.

각 버전 앞에 정확히 "버전 1", "버전 2", "버전 3"이라는 제목만 쓰고, 그 외 서두 설명 없이 바로 본문을 시작해주세요.`

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

    // 저장은 승인/반려 시점에 /api/contents에서 처리 (여기서는 생성만)
    return Response.json({ success: true, data: result })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}