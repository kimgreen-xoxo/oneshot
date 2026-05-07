import styles from './Header.module.css'

export default function Header({ title }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.profile}>관리자</div>
    </header>
  )
}