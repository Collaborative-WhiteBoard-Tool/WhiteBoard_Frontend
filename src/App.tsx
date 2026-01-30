import { useEffect } from 'react';
import { useAuthStore } from '@/store/AuthStore';
import { Loader2 } from 'lucide-react';
import AppRouter from './router';

// Thành phần kiểm tra Auth ngay khi mở Web
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    const publicPaths = ['/login', '/register', '/homepage'];
    const isPublicPath = publicPaths.includes(window.location.pathname);
    if (!isPublicPath) {
      refreshUser();
    } else {
      // Nếu là trang public, tắt loading ngay lập tức để render nội dung
      useAuthStore.setState({ isLoading: false });
    }

  }, [refreshUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthInitializer>
      <AppRouter />
    </AuthInitializer>
  );
}

export default App;