import { supabase } from '@/lib/supabase'

// 콘텐츠 단건 조회
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)

    const content = {
      id: data.id,
      createdAt: data.created_at,
      clientName: data.client_name,
      channel: data.channel,
      type: data.type,
      prompt: data.prompt,
      result: data.result,
      status: data.status,
      scheduledDate: data.scheduled_date,
      imageUrl: data.image_url,
      rejectionReason: data.rejection_reason,
    }

    return Response.json({ success: true, data: content })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 콘텐츠 상태 변경 (승인/반려)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, rejectionReason } = body

    const updatePayload = { status }
    if (status === '반려') {
      updatePayload.rejection_reason = rejectionReason || ''
    }

    const { error } = await supabase
      .from('contents')
      .update(updatePayload)
      .eq('id', id)

    if (error) throw new Error(error.message)
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}