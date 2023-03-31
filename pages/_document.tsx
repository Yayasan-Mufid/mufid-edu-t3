import * as React from 'react'
import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx)
    return {
      ...initialProps,
      styles: React.Children.toArray([initialProps.styles])
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300&family=Noto+Naskh+Arabic&family=Noto+Sans+Arabic&display=swap" rel="stylesheet" />
        </Head>
        <body>
          <div className="drawer">
            <input className="drawer-toggle" id="top-drawer" type="checkbox" />
            <div id="__content" className="drawer-content overflow-y-auto mb-4">
              <Main />
              <NextScript />
            </div>
            <div className="drawer-side">
              <label htmlFor="top-drawer" className="drawer-overlay"></label>
              <div id="__drawer" className="h-screen w-fit bg-base-100 dark:bg-slate-800"></div>
            </div>
          </div>
        </body>
      </Html>
    )
  }
}

export default MyDocument