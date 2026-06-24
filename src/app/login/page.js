'use client'

import { useState } from 'react'
import { supabaseClient } from '@/lib/supabaseClient'
import styles from './page.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setLoading(false)
      setError(`로그인 실패: ${signInError.message}`)
      return
    }

    if (!data?.session) {
      setLoading(false)
      setError('로그인은 됐지만 세션이 생성되지 않았습니다. (data.session 없음)')
      return
    }

    // 세션이 쿠키에 실제로 반영됐는지 확인하기 위해 잠깐 대기 후 이동
    window.location.href = '/'
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.logo}>OneShot</h1>
        <p className={styles.subtitle}>관리자 로그인</p>

        <div className={styles.field}>
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  )
}
