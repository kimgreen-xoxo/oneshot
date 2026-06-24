'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    window.location.href = '/login'
  }

  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      <button
        type="button"
        className={styles.menuToggle}
        onClick={() => setIsOpen(true)}
        aria-label="메뉴 열기"
      >
        <span />
        <span />
        <span />
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={closeSidebar} />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>OneShot</div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeSidebar}
            aria-label="메뉴 닫기"
          >
            ✕
          </button>
        </div>
        <nav>
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={closeSidebar}
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
    </>
  )
}