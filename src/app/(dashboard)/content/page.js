'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.css'

const statusColors = {
  '검수대기': styles.badgeWaiting,
  '승인완료': styles.badgeApproved,
  '발행완료': styles.badgeDone,
  '반려': styles.badgeRejected,
}

const filters = ['전체', '검수대기', '승인완료', '발행완료', '반려']

export default function ContentPage() {
  const [filter, setFilter] = useState('전체')
  const [contents, setContents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/contents')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setContents(data.data)
        }
      })
      .catch((err) => console.error('콘텐츠 목록 오류:', err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === '전체'
    ? contents
    : contents.filter((c) => c.status === filter)

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>콘텐츠 관리</h2>

      {/* 필터 */}
      <div className={styles.filterRow}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className={styles.card}>
        {loading ? (
          <p className={styles.emptyText}>불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <p className={styles.emptyText}>해당 상태의 콘텐츠가 없습니다.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>고객명</th>
                <th>유형</th>
                <th>채널</th>
                <th>상태</th>
                <th>생성일</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.clientName}</td>
                  <td>{item.type}</td>
                  <td>{item.channel}</td>
                  <td>
                    <span className={`${styles.badge} ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
                  <td>
                    <button className={styles.actionBtn}>상세보기</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}