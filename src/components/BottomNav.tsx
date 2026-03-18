import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, Settings } from 'lucide-react';
import { CreatePlotDialog } from './CreatePlotDialog';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isSettings = location.pathname === '/settings';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto py-2 px-4">
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
            isHome ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Garden</span>
        </button>

        <CreatePlotDialog>
          <button className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors -mt-4 shadow-lg">
            <Plus className="w-5 h-5" />
            <span className="text-[10px] font-medium">Add</span>
          </button>
        </CreatePlotDialog>

        <button
          onClick={() => navigate('/settings')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
            isSettings ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </nav>
  );
}
