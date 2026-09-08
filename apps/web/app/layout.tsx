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
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
          <Sidebar />
          <div className="flex min-h-screen min-w-0 flex-col">
            <Topbar />
            <main className="flex-1 space-y-6 px-4 py-6 md:px-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
