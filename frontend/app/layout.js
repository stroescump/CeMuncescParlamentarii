import '../styles/global.css';

export const metadata = {
  title: 'Ce Muncesc Parlamentarii',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="sticky top-0 z-40 header-blur border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-semibold text-lg text-primary">Ce muncesc parlamentarii?</a>
            <div className="text-sm text-slate-600">Demo</div>
          </div>
        </div>

        <div>{children}</div>
      </body>
    </html>
  );
}