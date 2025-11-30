// React default import is not needed with the JSX runtime

export default function Footer() {
  return (
    <footer style={{ marginTop: 32, padding: 12, textAlign: 'center', color: 'var(--muted)' }}>
      &copy; {new Date().getFullYear()} Mini-profil — Built with care
    </footer>
  )
}
