import { FcGoogle } from "react-icons/fc";

interface GoogleLoginButtonProps {
    text?: string;
    disabled?: boolean;
}

export const GoogleLoginButton = ({
    text = 'Continue with Google',
    disabled = false,
}: GoogleLoginButtonProps) => {
    const handleGoogleLogin = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/';
        window.location.href = `${apiUrl}/oauth/google`;
    };

    return (
        <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={disabled}
            className="flex items-center text-sm justify-center mt-2 gap-3 w-full py-2 border-2 border-gray-300 rounded-2xl bg-white hover:bg-gray-50 hover:cursor-pointer hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
            <FcGoogle className="w-5 h-5" />
            <span className="font-medium text-gray-700">{text}</span>
        </button>
    );
};