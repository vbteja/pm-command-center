import './globals.css'

export const metadata = {
  title: 'PM Command Center',
  description: 'Full-stack PM dashboard by Brahma Teja',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}