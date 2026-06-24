'use client'

import { useState } from 'react'
import styles from './page.module.css'

const mockContents = [
  {
    id: 1,
    client: '김철수',
    industry: '부동산',
    type: '이미지',
    channel: 'Instagram',
    status: '검수대기',
    createdAt: '2026-04-25',
  },
  {
    id: 2,
    client: '이영희',
    industry: '병원',
    type: '영상',
    channel: 'YouTube',
    status: '승인완료',
    createdAt: '2026-04-24',
  },
  {
    id: 3,
    client: '박민수',
    industry: '학원',
    type: '텍스트',
    channel: '네이버 블로그',
    status: '발행완료',
    createdAt: '2026-04-23',
  },
  {
    id: 4,
    client: '최지원',
    industry: '뷰티',
    type: '이미지',
    channel: 'Instagram',
    status: '반려',
    createdAt: '2026-04-22',
  },
]

const statusColors = {
  '검수대기': styles.badgeWaiting,
  '승인완료': styles.badgeApproved,
  '발행완료': styles.badgeDone,
  '반려': styles.badgeRejected,
}

const filters = ['전체', '검수대기', '승인완료', '발행완료', '반려']

export default function ContentPage() {
  const [filter, setFilter] = useState('전체')

  const filtered = filter === '전체'
    ? mockContents
    : mockContents.filter((c) => c.status === filter)

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
        <table className={styles.table}>
          <thead>
            <tr>
              <th>고객명</th>
              <th>업종</th>
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
                <td>{item.client}</td>
                <td>{item.industry}</td>
                <td>{item.type}</td>
                <td>{item.channel}</td>
                <td>
                  <span className={`${styles.badge} ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.createdAt}</td>
                <td>
                  <button className={styles.actionBtn}>상세보기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}