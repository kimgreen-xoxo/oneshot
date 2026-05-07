import styles from './page.module.css'
import Link from 'next/link'

const services = [
  {
    icon: '🤖',
    title: 'AI 콘텐츠 생성',
    desc: '텍스트, 이미지, 영상을 AI가 자동으로 생성합니다. 업종과 키워드만 입력하면 끝.',
  },
  {
    icon: '📱',
    title: 'SNS 자동 업로드',
    desc: 'Instagram, YouTube, 네이버 블로그까지 검수 후 자동으로 업로드합니다.',
  },
  {
    icon: '📊',
    title: '성과 리포트',
    desc: '채널별 노출수, CTR, DB, ROAS를 자동으로 집계해 월간 리포트를 제공합니다.',
  },
]

const steps = [
  { step: '01', title: '고객 입력', desc: '업종, 키워드, 채널, KPI 입력' },
  { step: '02', title: 'AI 생성', desc: '텍스트 / 이미지 / 영상 자동 생성' },
  { step: '03', title: '검수', desc: '관리자 승인 / 반려 / 재생성' },
  { step: '04', title: '자동 업로드', desc: 'SNS 채널 자동 발행' },
  { step: '05', title: '리포트', desc: '성과 측정 및 월간 리포트' },
]

export default function Home() {
  return (
    <div className={styles.container}>

      {/* Hero */}
      <section className={styles.hero}>
        <p className={styles.heroTag}>AI 기반 콘텐츠 자동화 플랫폼</p>
        <h1 className={styles.heroTitle}>
          온라인 홍보,<br />
          원샷이 한 번에 해결합니다.
        </h1>
        <p className={styles.heroDesc}>
          기획부터 실행, DB 수집과 리포트까지<br />
          더 빠르고 체계적으로 연결합니다.
        </p>
        <div className={styles.heroButtons}>
          <Link href="/apply" className={styles.btnPrimary}>
            상담 신청하기
          </Link>
          <Link href="/service" className={styles.btnSecondary}>
            서비스 소개
          </Link>
        </div>
      </section>

      {/* 서비스 소개 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>서비스 소개</h2>
        <p className={styles.sectionDesc}>
          원샷 하나로 콘텐츠 생성부터 SNS 업로드까지 자동화합니다.
        </p>
        <div className={styles.serviceGrid}>
          {services.map((s) => (
            <div key={s.title} className={styles.serviceCard}>
              <div className={styles.serviceIcon}>{s.icon}</div>
              <h3 className={styles.serviceTitle}>{s.title}</h3>
              <p className={styles.serviceDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 프로세스 */}
      <section className={styles.processSection}>
        <h2 className={styles.sectionTitle}>어떻게 작동하나요?</h2>
        <p className={styles.sectionDesc}>
          5단계로 콘텐츠 생성부터 성과 측정까지 한 번에.
        </p>
        <div className={styles.steps}>
          {steps.map((s, i) => (
            <div key={s.step} className={styles.stepItem}>
              <div className={styles.stepNumber}>{s.step}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
              {i < steps.length - 1 && (
                <div className={styles.stepArrow}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>
          지금 바로 시작해보세요
        </h2>
        <p className={styles.ctaDesc}>
          복잡한 온라인 홍보, 원샷이 한 번에 해결합니다.
        </p>
        <Link href="/apply" className={styles.btnPrimary}>
          무료 상담 신청
        </Link>
      </section>

    </div>
  )
}