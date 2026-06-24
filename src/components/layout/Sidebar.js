'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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