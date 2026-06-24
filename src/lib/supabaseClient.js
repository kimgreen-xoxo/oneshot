// lib/supabaseClient.js
// 클라이언트 사이드(브라우저)에서 사용하는 Supabase client.
// 로그인/로그아웃 등 Auth 기능 전용. publishable key 사용 (공개되어도 안전한 키).
// ⚠️ DB 데이터 조회/수정은 이 client로 하지 말 것 — 그건 기존 lib/supabase.js(service role) + API route로 처리.
//
// createBrowserClient를 사용하는 이유: 세션을 쿠키에 저장해야 서버(proxy.js)에서도
// 같은 세션을 읽을 수 있음. 일반 createClient는 localStorage에 저장해서 서버가 못 읽음.
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase client env variables')
}

export const supabaseClient = createBrowserClient(supabaseUrl, supabasePublishableKey)
