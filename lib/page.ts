import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DashboardState {
    showDashboard: boolean;
    setShowDashboard: (show: boolean) => void;
}
const useDashboardStore = create<DashboardState>()(
    devtools((set) => ({
        showDashboard: false,
        setShowDashboard: (show: boolean) => set({ showDashboard: show }),
    }))
);

export default useDashboardStore;