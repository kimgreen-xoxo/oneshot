import Sidebar from '@/components/layout/Sidebar'
import styles from './layout.module.css'

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  )
}
