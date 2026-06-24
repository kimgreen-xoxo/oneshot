// lib/supabaseClient.js
// 클라이언트 사이드(브라우저)에서 사용하는 Supabase client.
// 로그인/로그아웃 등 Auth 기능 전용. publishable key 사용 (공개되어도 안전한 키).
// ⚠️ DB 데이터 조회/수정은 이 client로 하지 말 것 — 그건 기존 lib/supabase.js(service role) + API route로 처리.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase client env variables')
}

export const supabaseClient = createClient(supabaseUrl, supabasePublishableKey)
