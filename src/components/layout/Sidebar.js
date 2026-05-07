'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

const menus = [
  { label: '대시보드', href: '/admin' },
  { label: '고객 입력', href: '/admin/input' },
  { label: '콘텐츠 관리', href: '/admin/content' },
  { label: '검수', href: '/admin/review' },
  { label: '리드 관리', href: '/admin/leads' },
  { label: '리포트', href: '/admin/report' },
]

export default function Sidebar() {
  const pathname = usePathname()

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
    </aside>
  )
}