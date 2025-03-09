import { SessionProvider } from "next-auth/react";

import { AppProps } from "next/app";

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  
  console.log("Session:", session); // Debugging
  console.log("PageProps:", pageProps); // Debugging
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}