
import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { Toaster } from "react-hot-toast";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import "~~/styles/civic_globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";


export const metadata = getMetadata({
  title: 'CivicPulse - Crowd-Powered Civic Reporting',
  description: 'Report issues, upvote problems, and make your community better. CivicPulse empowers residents to track potholes, trash, and hazards.'
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={``}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', (event) => {
                if (event.message && event.message.includes('chrome.runtime.sendMessage')) {
                  event.stopImmediatePropagation();
                }
              });
              window.addEventListener('unhandledrejection', (event) => {
                if (event.reason && event.reason.stack && event.reason.stack.includes('chrome-extension://')) {
                  event.stopImmediatePropagation();
                }
              });
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider enableSystem>
          <Toaster position="top-center" />
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;