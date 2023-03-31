import React, { ReactNode } from 'react'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
// import { AuthProvider } from '../components/auth'
import AppLayout from '@/components/layout'
import { trpc } from '@/lib/trpc/utils/trpc'
import { ThemeSwitcherProvider } from 'react-css-theme-switcher'
import '../styles/global.css'

interface MyAppProps extends AppProps {
  session: Session
}

type MyAppPropsType = MyAppProps & {
  Component: ReactNode,
  pageProps: MyAppProps
}

const themes = {
  'light': '/light-theme.css',
  'dark': '/dark-theme.css',
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: MyAppPropsType) {
  return (
    <SessionProvider session={session}>
      {/* <ThemeSwitcherProvider attr="data-theme" themeMap={themes} defaultTheme='light'> */}
      {
        'withoutLayout' in Component ? <Component {...pageProps} /> : (
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        )
      }
      {/* </ThemeSwitcherProvider> */}
    </SessionProvider>
  )
}

export default trpc.withTRPC(MyApp)
