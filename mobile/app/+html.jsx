import { ScrollViewStyleReset } from 'expo-router/html';

/**
 * Shell HTML do build web. É aqui que o app deixa de ser "uma página" e passa
 * a poder rodar em tela cheia: o manifesto e as metatags da Apple fazem o
 * iOS abrir sem a barra do Safari quando adicionado à tela de início.
 */
export default function Root({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover libera as áreas seguras sob o notch em standalone */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"
        />

        <title>EV ChargeOps</title>
        <meta name="description" content="Sua recarga no condomínio, medida por kWh e cobrada com transparência." />

        <link rel="manifest" href="/app/manifest.webmanifest" />
        <meta name="theme-color" content="#0B0B0D" />
        <meta name="color-scheme" content="dark" />

        {/* iOS: sem estas três, "adicionar à tela de início" abre no Safari */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="EV ChargeOps" />
        <link rel="apple-touch-icon" href="/app/icone-180.png" />

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: estilo }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const estilo = `
  html, body, #root { height: 100%; background-color: #0B0B0D; }
  body { overscroll-behavior: none; }
  /* O realce azul de toque do iOS destoa do design. */
  * { -webkit-tap-highlight-color: transparent; }
`;
