import { useParams } from "react-router-dom"

export const Whiteboard1 = () => {
    const param = useParams()
    return ("White_board_page: " + param.id)
}
