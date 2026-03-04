import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/AuthStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const GoogleSuccessPage = () => {
  const navigate = useNavigate();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  useEffect(() => {
    console.log("🔍 GoogleSuccessPage mounted");
    console.log("accessToken from URL:", accessToken);
    console.log("refreshToken from URL:", refreshToken);
    const handleCallback = async () => {
      if (error) {
        toast.error(`Login failed: ${error}`);
        navigate("/login");
        return;
      }

      if (accessToken && refreshToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      }

      try {
        await refreshUser();
        navigate("/dashboard");
      } catch (err) {
        console.error("Failed to refresh user:", err);
        toast.error("Authentication failed");
        navigate("/login");
      }
    };

    handleCallback();
  }, []); // ← dependency array rỗng, chỉ chạy 1 lần duy nhất

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
        <h2 className="text-2xl font-semibold">Completing sign in...</h2>
        <p className="text-gray-600">Please wait a moment</p>
      </div>
    </div>
  );
};
