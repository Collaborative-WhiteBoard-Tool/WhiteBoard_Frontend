import { SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Grid2x2, Trash2, User, Users, Zap, Sparkles } from "lucide-react"
import { Collapsible } from "../../components/ui/collapsible"
import { NavLink } from "react-router-dom"

const SidebarDashboard = () => {
    const items = [
        {
            title: "All Boards",
            url: "/dashboard/listboard",
            icon: Grid2x2,
            badge: null
        },
        {
            title: "Owned by me",
            url: "/dashboard/owned",
            icon: User,
            badge: null
        },
        {
            title: "Shared with me",
            url: "/dashboard/shared",
            icon: Users,
            badge: "3"
        },
        {
            title: "Trash",
            url: "/dashboard/trash",
            icon: Trash2,
            badge: null
        },
    ]

    return (
        <Collapsible defaultOpen className="group/collapsible h-full relative overflow-hidden ">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-linear-to-br from-violet-50 via-purple-50 to-fuchsia-50"></div>
            
            {/* Decorative animated blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-linear-to-br from-violet-200/40 to-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-linear-to-br from-fuchsia-200/40 to-pink-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-linear-to-br from-purple-200/30 to-violet-200/30 rounded-full blur-3xl animate-pulse delay-500"></div>

            {/* Content */}
            <div className="relative z-10">
                <SidebarHeader className="px-4 py-6 border-b border-white/40 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-600" />
                        <h2 className="text-xs font-bold text-violet-700 uppercase tracking-wider">
                            Workspace
                        </h2>
                    </div>
                </SidebarHeader>

                <SidebarContent className="px-3">
                    <SidebarGroup>
                        <SidebarMenu className="space-y-2">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLink
                                            to={item.url}
                                            className={({ isActive }) =>
                                                `group/item relative flex items-center gap-3 px-4 py-5 rounded-xl font-medium text-sm transition-all duration-300 overflow-hidden ${
                                                    isActive
                                                        ? 'text-white shadow-xl shadow-violet-500/30'
                                                        : 'text-slate-700 hover:text-violet-700'
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    {/* Active background with gradient - using animate-pulse instead */}
                                                    {isActive && (
                                                        <>
                                                            <div className="absolute inset-0 bg-linear-to-r from-violet-600 via-purple-600 to-fuchsia-600"></div>
                                                            {/* Shine effect */}
                                                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-1000"></div>
                                                        </>
                                                    )}
                                                    
                                                    {/* Hover background */}
                                                    {!isActive && (
                                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                                                    )}

                                                    {/* Icon */}
                                                    <item.icon className={`relative z-10 h-5 w-5 transition-all duration-300 ${
                                                        isActive 
                                                            ? 'text-white scale-110 drop-shadow-lg' 
                                                            : 'text-slate-600 group-hover/item:text-violet-600 group-hover/item:scale-110'
                                                    }`} />
                                                    
                                                    {/* Title */}
                                                    <span className={`relative z-10 flex-1 transition-all duration-300 ${
                                                        isActive 
                                                            ? 'font-semibold' 
                                                            : 'group-hover/item:translate-x-1'
                                                    }`}>
                                                        {item.title}
                                                    </span>
                                                    
                                                    {/* Badge */}
                                                    {item.badge && (
                                                        <span className={`relative z-10 px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-300 ${
                                                            isActive 
                                                                ? 'bg-white/20 text-white backdrop-blur-sm shadow-lg' 
                                                                : 'bg-violet-100 text-violet-700 group-hover/item:bg-violet-200'
                                                        }`}>
                                                            {item.badge}
                                                        </span>
                                                    )}

                                                    {/* Active indicator */}
                                                    {isActive && (
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full shadow-lg"></div>
                                                    )}
                                                </>
                                            )}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                    {/* Pro Tip Card */}
                    <div className="mt-4 px-1">
                        <div className="relative  overflow-hidden bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 group/tip">
                            {/* Animated gradient border */}
                            <div className="absolute  inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-0 group-hover/tip:opacity-20 blur-xl transition-opacity duration-500"></div>
                            
                            <div className="relative flex items-start gap-3">
                                <div className="p-2 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-lg shadow-sm group-hover/tip:shadow-md group-hover/tip:scale-110 transition-all duration-300">
                                    <Zap className="h-4 w-4 text-violet-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-bold text-violet-700 mb-1.5">💡 Pro Tip</h4>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Press <kbd className="px-2 py-1 bg-white/80 border border-violet-200 rounded text-xs font-mono text-violet-700 shadow-sm">Ctrl+M</kbd> to create a new board
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upgrade Banner */}
                    <div className="mt-4 px-1">
                        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-xl p-4 shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 cursor-pointer group/upgrade">
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-violet-600 opacity-0 group-hover/upgrade:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/upgrade:translate-x-full transition-transform duration-1000"></div>
                            
                            <div className="relative text-center">
                                <Sparkles className="h-6 w-6 text-yellow-300 mx-auto mb-2 animate-pulse" />
                                <h4 className="text-sm font-bold text-white mb-1">Upgrade to Pro</h4>
                                <p className="text-xs text-white/80 mb-3">Unlock unlimited boards</p>
                                <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-semibold rounded-lg transition-all duration-300 border border-white/40">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </SidebarContent>
            </div>
        </Collapsible>
    )
}

export default SidebarDashboard