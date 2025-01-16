import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 pt-20 flex gap-6">
        <main className="flex-1">
          {children}
        </main>
        <aside className="hidden lg:block w-72 space-y-6">
          <div className="bg-muted/30 rounded-lg p-4 h-96 flex items-center justify-center border">
            <span className="text-muted-foreground">Google Ads Space</span>
          </div>
          <div className="bg-primary/5 rounded-lg p-4 h-72 flex items-center justify-center border">
            <span className="text-muted-foreground">In-house Ads</span>
          </div>
        </aside>
      </div>
    </div>
  );
}