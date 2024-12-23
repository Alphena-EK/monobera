import "../styles/globals.css";
import { readFileSync } from "fs";
import path from "path";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { IBM_Plex_Sans } from "next/font/google";
import Script from "next/script";
import { chainId, hubName, hubUrl, tokenListUrl } from "@bera/config";
import {
  Footer,
  Header,
  MainWithBanners,
  TailwindIndicator,
  TermOfUseModal,
} from "@bera/shared-ui";
import { cn } from "@bera/ui";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";

import Providers from "./Providers";
import { navItems } from "./config";

const fontSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(hubUrl),
  title: {
    template: `%s | ${hubName}`,
    default: hubName,
  },
};
const PostHogPageView = dynamic(() => import("./PostHogPageView"), {
  ssr: false,
});

export default async function RootLayout(props: { children: React.ReactNode }) {
  const fileContent = readFileSync(
    path.join(process.cwd(), `public/${tokenListUrl}`),
    "utf8",
  );
  const fetchedTokenList = JSON.parse(fileContent);
  return (
    <html lang="en" className="bg-background">
      <Script
        id="HotJarAnalytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(h,o,t,j,a,r){
            h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
            h._hjSettings={hjid:3728409,hjsv:6};
            a=o.getElementsByTagName('head')[0];
            r=o.createElement('script');r.async=1;
            r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
            a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
        }}
      />{" "}
      <body
        className={cn("min-h-screen font-sans antialiased", fontSans.variable)}
      >
        <Providers content={fetchedTokenList}>
          <TermOfUseModal />

          <PostHogPageView />
          {/* Note: This div previously had overflow-hidden, but it was removed as it interferes with sticky elements */}
          <div className="relative flex min-h-screen w-full flex-col ">
            <div className="z-[100]">
              <Toaster position="bottom-right" />
            </div>
            <div className="z-10 flex-1">
              <Header navItems={navItems} appName={hubName} hideTheme />
              <MainWithBanners
                // mt-8 should probably be removed
                className="mt-8"
                // paddingTop={150}
                // multiplier={50}
                appName={hubName}
              >
                {props.children}
              </MainWithBanners>
            </div>
            <Footer />
          </div>
          <TailwindIndicator />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
