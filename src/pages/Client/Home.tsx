import Header from "./Header"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useState } from "react";
import anh1 from '@/assets/anh1.png'
import anh2 from '@/assets/anh2.png'
import anh3 from '@/assets/anh3.png'
import { Link, useNavigate } from "react-router-dom"
import { Sparkles, Zap, Users } from "lucide-react"
import { useAuth } from "@/hooks/use-auth";

const Home = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateBoard = async () => {
        // Kiểm tra đăng nhập
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        // Nếu đã đăng nhập, tạo board
        try {
            setIsCreating(true);
            // const newBoard = await whiteboardApi.create();
            navigate(`/dashboard/listboard`);
        } catch (error) {
            console.error('Failed to create board:', error);
            // Có thể hiển thị toast/notification lỗi ở đây
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="wrapper relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 h-screen overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative mx-auto w-[90%] h-full z-10 flex flex-col py-4">
                <Header />

                <section className="flex-1 flex items-center justify-center overflow-hidden py-6">
                    <div className="grid grid-cols-2 gap-8 items-center w-full max-w-7xl">
                        {/* Left Side - Text Content */}
                        <div className="text-left space-y-5">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span className="text-sm font-medium text-white">The Future of Collaboration</span>
                            </div>

                            <h1 className="text-5xl font-extrabold text-white leading-tight">
                                Bring Your Ideas to Life,
                                <br />
                                <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                                    Together
                                </span>
                            </h1>

                            <p className="text-lg text-white/90 font-light leading-relaxed">
                                The ultimate online whiteboard for seamless team collaboration and brainstorming.
                            </p>

                            <div className="flex gap-4 items-center pt-2">
                                <button
                                    onClick={handleCreateBoard}
                                    className="group relative bg-white text-purple-600 rounded-xl px-7 py-3.5 text-base font-semibold hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/50">
                                    <span className="flex items-center gap-2">
                                        <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        {isCreating ? 'Creating...' : 'Create New Board'}
                                    </span>
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                </button>

                                <button className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl px-7 py-3.5 text-base font-semibold hover:bg-white/20 transition-all duration-300">
                                    <Link to="" className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        View Demo
                                    </Link>
                                </button>
                            </div>

                            {/* Feature badges */}
                            <div className="flex gap-3 flex-wrap pt-4">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-white text-sm font-medium">Real-time Collaboration</span>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    <span className="text-white text-sm font-medium">Unlimited Boards</span>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                    <span className="text-white text-sm font-medium">AI-Powered</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Carousel */}
                        {/* Right Side - Carousel */}
                        <div className="relative h-full flex items-center">
                            <Carousel
                                className="w-full"
                                plugins={[
                                    Autoplay({
                                        delay: 3500
                                    })
                                ]}
                            >
                                <CarouselContent>
                                    <CarouselItem>
                                        <div className="relative overflow-hidden rounded-2xl">
                                            <div className="aspect-[4/3] w-full">
                                                <img
                                                    src={anh1}
                                                    alt="Collaboration board preview"
                                                    className="w-full h-full object-contain rounded-2xl shadow-2xl"
                                                />
                                            </div>
                                        </div>
                                    </CarouselItem>
                                    <CarouselItem>
                                        <div className="relative overflow-hidden rounded-2xl">
                                            <div className="aspect-[4/3] w-full">
                                                <img
                                                    src={anh2}
                                                    alt="Team workspace"
                                                    className="w-full h-full object-contain rounded-2xl shadow-2xl"
                                                />
                                            </div>
                                        </div>
                                    </CarouselItem>
                                    <CarouselItem>
                                        <div className="relative overflow-hidden rounded-2xl">
                                            <div className="aspect-[4/3] w-full">
                                                <img
                                                    src={anh3}
                                                    alt="Creative brainstorming"
                                                    className="w-full h-full object-contain rounded-2xl shadow-2xl"
                                                />
                                            </div>
                                        </div>
                                    </CarouselItem>
                                </CarouselContent>
                                <CarouselPrevious className="transition-all duration-300 bg-gray-600 hover:bg-white -left-5 shadow-lg" />
                                <CarouselNext className="transition-all duration-300 bg-gray-600 hover:bg-white -right-5 shadow-lg" />
                            </Carousel>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Home