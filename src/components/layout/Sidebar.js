'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabaseClient'
import styles from './Sidebar.module.css'

const menus = [
  { label: '대시보드', href: '/' },
  { label: '고객 입력', href: '/input' },
  { label: '콘텐츠 관리', href: '/content' },
  { label: '검수', href: '/review' },
  { label: '리드 관리', href: '/leads' },
  { label: '리포트', href: '/report' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>OneShot</div>
      <nav>
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`${styles.menuItem} ${pathname === menu.href ? styles.active : ''}`}
          >
            {menu.label}
          </Link>
        ))}
      </nav>
      <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
        로그아웃
      </button>
    </aside>
  )
}