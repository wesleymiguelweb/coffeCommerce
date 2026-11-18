import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import styles from './DefaultLayout.module.css'

export function DefaultLayout() {
  const { pathname } = useLocation()

  return (
    <div className={styles.app}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1} className={styles.main}>
        <div key={pathname} className={styles.route}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
