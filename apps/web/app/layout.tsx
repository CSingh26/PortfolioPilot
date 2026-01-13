import './globals.css';
import 'katex/dist/katex.min.css';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const metadata = {
  title: 'PortfolioPilot',
  description: 'Quant portfolio optimizer and backtesting lab.'
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink">
        <div className="grid min-h-screen grid-cols-[260px_1fr]">
          <Sidebar />
          <div className="flex min-h-screen flex-col">
            <Topbar />
            <main className="flex-1 space-y-6 px-8 py-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
