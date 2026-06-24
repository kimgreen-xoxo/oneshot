import styles from './page.module.css'
import Link from 'next/link'

const menus = [
  { icon: '✨', title: '새 콘텐츠 생성', desc: 'AI로 텍스트 / 이미지 / 영상 생성', href: '/content/new', color: 'var(--color-primary)' },
  { icon: '📋', title: '고객 DB 입력', desc: '업종 / 키워드 / 채널 / KPI 입력', href: '/input', color: 'var(--color-accent)' },
  { icon: '🔍', title: '검수 대기', desc: 'AI 생성 결과 승인 / 반려', href: '/review', color: 'var(--color-warning)' },
  { icon: '👥', title: '리드 관리', desc: '리드 목록 / 상태 관리', href: '/leads', color: '#7C3AED' },
  { icon: '📊', title: '리포트', desc: '채널별 성과 / 월간 리포트', href: '/report', color: 'var(--color-success)' },
  { icon: '📱', title: '채널 현황', desc: 'SNS 채널 상태 / 업로드 현황', href: '/content', color: '#DB2777' },
]

const notifications = [
  { id: 1, type: '검수', message: '김철수 / 부동산 이미지 검수 대기중', time: '10분 전' },
  { id: 2, type: '리드', message: '새 리드 등록 - 이영희 / 병원', time: '30분 전' },
  { id: 3, type: '업로드', message: '박민수 / 학원 콘텐츠 업로드 완료', time: '1시간 전' },
  { id: 4, type: '생성', message: '최지원 / 뷰티 콘텐츠 생성 완료', time: '2시간 전' },
]

const typeColors = {
  '검수': styles.typeReview,
  '리드': styles.typeLead,
  '업로드': styles.typeUpload,
  '생성': styles.typeCreate,
}

export default function AdminPage() {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  return (
    <div className={styles.container}>
      <div className={styles.welcome}>
        <div>
          <h2 className={styles.welcomeTitle}>안녕하세요, 관리자님 👋</h2>
          <p className={styles.welcomeDate}>{today}</p>
        </div>
        <Link href="/content/new" className={styles.newBtn}>
          + 새 콘텐츠 생성
        </Link>
      </div>

      <div>
        <h3 className={styles.sectionTitle}>업무 바로가기</h3>
        <div className={styles.menuGrid}>
          {menus.map((menu) => (
            <Link key={menu.title} href={menu.href} className={styles.menuCard}>
              <div className={styles.menuIcon} style={{ backgroundColor: menu.color + '20', color: menu.color }}>
                {menu.icon}
              </div>
              <div className={styles.menuInfo}>
                <h4 className={styles.menuTitle}>{menu.title}</h4>
                <p className={styles.menuDesc}>{menu.desc}</p>
              </div>
              <span className={styles.menuArrow}>→</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className={styles.sectionTitle}>최근 알림</h3>
        <div className={styles.notifList}>
          {notifications.map((n) => (
            <div key={n.id} className={styles.notifItem}>
              <span className={styles.notifType + ' ' + typeColors[n.type]}>{n.type}</span>
              <p className={styles.notifMessage}>{n.message}</p>
              <span className={styles.notifTime}>{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
