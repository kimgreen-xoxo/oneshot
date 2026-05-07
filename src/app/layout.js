import '../styles/globals.css'

export const metadata = {
  title: 'OneShot',
  description: 'OneShot 관리 시스템',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  )
}