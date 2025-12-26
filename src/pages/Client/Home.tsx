import Header from "./Header"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

import anh1 from '@/assets/anh1.png'
import anh2 from '@/assets/anh2.png'
import anh3 from '@/assets/anh3.png'
import anh4 from '@/assets/anh4.jpg'
import { Link } from "react-router-dom"


const Home = () => {
    return (
        <div className="wrapper bg-linear-65 from-purple-500 to-pink-500 h-screen">
            <div className="mx-auto w-[85%]">
                <Header />
                <section >
                    <div className="box-carousel mt-10 justify-items-center">
                        <Carousel className="w-[60%]" plugins={[
                            Autoplay({
                                delay: 2000
                            })
                        ]}>
                            <CarouselContent >
                                <CarouselItem>
                                    <img src={anh1} alt="" className="h-full w-full object-cover rounded-lg" />
                                </CarouselItem>
                                <CarouselItem>
                                    <img src={anh2} alt="" className="h-full w-full object-cover rounded-lg" />
                                </CarouselItem>
                                <CarouselItem>
                                    <img src={anh3} alt="" className="h-full w-full object-cover rounded-lg" />
                                </CarouselItem>
                            </CarouselContent>
                            <CarouselPrevious className="hover:scale-150 transition" />
                            <CarouselNext className="hover:scale-150 transition" />
                        </Carousel>
                        <div className="box-title flex flex-col items-center text-center gap-4 mt-5">
                            <h1 className="text-4xl font-bold">Bring your ideas to Life, Together </h1>
                            <p className="text-sm text-gray-500">The ultimate online whiteboard for seamless team collaboration and brainstorming.</p>
                            <button className="bg-cyan-500 rounded-lg text-white px-14 py-2 text-sm  hover:scale-95 hover:cursor-pointer transition shadow-indigo-500/50 shadow-lg ">
                                <Link to="">
                                    Create New Board
                                </Link>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}


export default Home