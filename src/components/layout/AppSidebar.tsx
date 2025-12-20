import { Link } from "react-router-dom"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

const Sidebar = () => {
    return (
        <aside style={{ width: 200, background: '#f4f4f4', padding: 16 }}>
            <ul>
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link to="/dashboard/user">Users</Link>
                </li>
                <li>
                    <Link to="/dashboard/products">Products</Link>
                </li>
            </ul>
        </aside>
    )

}

export default Sidebar