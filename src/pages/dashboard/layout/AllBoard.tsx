import boardImg from '@/assets/anh4.jpg'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "../../../components/ui/card"
import { useCallback } from 'react';
import { toast } from 'sonner';

const ListBoard = () => {
    // const fetchWhiteboards = useCallback(
    //     async (page: number = 1, limit: number = 10) => {
    //         try {
    //             const response = await whiteboardApi.getAll(page, limit);
    //             setWhiteboards(response.data.whiteboards);
    //             setTotal(response.data.total);
    //         } catch (error: any) {

    //             toast.error('Error!', {
    //                 description: error.response?.data?.message || 'Failed to fetch whiteboards',
    //                 duration: 3000,
    //             });
    //         }
    //         // finally {
    //         //     setIsLoading(false);
    //         // }
    //     },
    //     [toast]
    // );


    return (
        < div className="bg-gray-100 p-5 h-screen">
            <header className="border border-t-0 border-x-0 border-b-gray-300">
                <h1 className="text-3xl font-bold mb-2 mx-3">List All Boards</h1>
                <div className="filter flex gap-3 mx-3 my-4">
                    <Select>
                        <SelectTrigger className="w-auto h-7 bg-white font-medium shadow-none ">
                            <SelectValue placeholder="Sort by: Last mondified" />
                        </SelectTrigger>
                        <SelectContent className="bg-white" >
                            <SelectGroup >
                                <SelectItem value="apple" className='hover:bg-gray-200 hover:scale-95'>Apple</SelectItem>
                                <SelectItem value="banana" className='hover:bg-gray-200 hover:scale-95'>Banana</SelectItem>
                                <SelectItem value="blueberry" className='hover:bg-gray-200 hover:scale-95'>Blueberry</SelectItem>
                                <SelectItem value="grapes" className='hover:bg-gray-200 hover:scale-95'>Grapes</SelectItem>
                                <SelectItem value="pineapple" className='hover:bg-gray-200 hover:scale-95'>Pineapple</SelectItem>
                            </SelectGroup>
                        </SelectContent>

                    </Select>


                    <Select>
                        <SelectTrigger className="w-auto h-7 bg-white font-medium shadow-none">
                            <SelectValue placeholder="Date range" />
                        </SelectTrigger>
                        <SelectContent className="text-sm">
                            <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="apple" >Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                <SelectItem value="grapes">Grapes</SelectItem>
                                <SelectItem value="pineapple">Pineapple</SelectItem>
                            </SelectGroup>
                        </SelectContent>

                    </Select>

                    <Select>
                        <SelectTrigger className="w-auto h-7 bg-white font-medium shadow-none">
                            <SelectValue placeholder="Owner" />
                        </SelectTrigger>
                        <SelectContent className="text-sm">
                            <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="apple" >Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="blueberry">Blueberry</SelectItem>
                                <SelectItem value="grapes">Grapes</SelectItem>
                                <SelectItem value="pineapple">Pineapple</SelectItem>
                            </SelectGroup>
                        </SelectContent>

                    </Select>
                </div>
            </header>


            {/* List board */}
            <section className="mx-3 mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
                <Card className="w-[90%] max-w-sm overflow-hidden shadow-none border-none hover:scale-98 transition">
                    <CardContent className="p-3">
                        <img src={boardImg}
                            className="h-40 w-full object-cover rounded-2xl" alt="" />
                    </CardContent>
                    <CardFooter className="block  text-sm">
                        <b>Title</b>
                        <p className="text-muted-foreground">Last modified: Today</p>
                        <p className="text-muted-foreground">Owner: You</p>
                    </CardFooter>
                </Card>




            </section>
        </div>
    )
}

export default ListBoard