import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MainHeader } from "./MainHeader";
import { useReminderStore } from "@/stores/reminderStore";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { loadDueCount } = useReminderStore();

  useEffect(() => {
    loadDueCount();
  }, [loadDueCount]);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MainHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
