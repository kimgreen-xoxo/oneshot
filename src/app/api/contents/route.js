import { supabase } from '@/lib/supabase'

// 콘텐츠 저장
export async function POST(request) {
  try {
    const body = await request.json()

    const { error } = await supabase.from('contents').insert({
      client_name: body.clientName || '',
      channel: body.channel || '',
      type: body.type || '',
      prompt: body.prompt || '',
      result: body.result || '',
      status: body.status || '검수대기',
      scheduled_date: body.scheduledDate || '',
      image_url: body.imageUrl || '',
    })

    if (error) throw new Error(error.message)
    return Response.json({ success: true })
  } catch (error) {
    console.error('콘텐츠 저장 오류:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 콘텐츠 목록 조회
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientName = searchParams.get('clientName')

    let query = supabase
      .from('contents')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientName) {
      query = query.eq('client_name', clientName)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)

    const contents = data.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      clientName: row.client_name,
      channel: row.channel,
      type: row.type,
      prompt: row.prompt,
      result: row.result,
      status: row.status,
      scheduledDate: row.scheduled_date,
      imageUrl: row.image_url,
    }))

    return Response.json({ success: true, data: contents })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 상태 업데이트
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { id, status } = body

    const { error } = await supabase
      .from('contents')
      .update({ status })
      .eq('id', id)

    if (error) throw new Error(error.message)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}