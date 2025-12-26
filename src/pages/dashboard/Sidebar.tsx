import { Link } from "react-router-dom"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { ChevronDown, Grid2x2, Home, Info, ListFilter, Settings, Trash2, User, Users } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible"
import { Button } from "../../components/ui/button"
import { NavLink } from "react-router-dom"
const SidebarDashboard = () => {

    const item = [
        {
            title: "All Boards",
            url: "/dashboard/listboard",
            icon: Grid2x2
        },
        {
            title: "Owned by me",
            url: "#",
            icon: User
        },
        {
            title: "Shared with me",
            url: "#",
            icon: Users
        },
        {
            title: "Trash",
            url: "#",
            icon: Trash2
        },

    ]
    return (
        <Collapsible defaultOpen className="group/collapsible ">
            <SidebarHeader >
                <h1 className="font-medium text-gray-500">FILTERS</h1>
            </SidebarHeader>
            <SidebarContent >
                <SidebarGroup>
                    <SidebarMenu>
                        {item.map((item) => (

                            <SidebarMenuItem key={item.title} className="font-medium  py-2 rounded-md hover:bg-blue-100 hover:text-blue-600 active:scale-95 transition ">
                                < SidebarMenuButton asChild >
                                    <NavLink to={item.url} >
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </NavLink>


                                </SidebarMenuButton>
                                {/* <SidebarMenuBadge>24</SidebarMenuBadge> */}
                            </SidebarMenuItem>
                        ))}


                    </SidebarMenu>

                    {/* <SidebarGroupLabel asChild>
                        <CollapsibleTrigger className="flex items-center" >
                            <span className="text-lg font-normal">Help</span>
                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>

                        <SidebarGroupContent className="mt-2" >
                            <h1>Contract to ...</h1>
                        </SidebarGroupContent>
                    </CollapsibleContent> */}
                </SidebarGroup>
            </SidebarContent >
        </Collapsible >
    )

}

export default SidebarDashboard