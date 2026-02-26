import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { useWhiteboard } from "@/hooks/use-whiteboard";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  SlidersHorizontal,
  User,
  Clock,
  Grid2x2,
  Sparkles,
} from "lucide-react";
import BoardCard from "../board/BoardCard";

const ListBoard = () => {
  const navigate = useNavigate();
  const {
    whiteboards,
    fetchWhiteboards,
    createWhiteboard,
    moveToTrash,
    renameBoard,
    toggleFavorite,
    shareBoard,
    downloadBoard,
  } = useWhiteboard();

  useEffect(() => {
    fetchWhiteboards();
  }, [fetchWhiteboards]);

  const handleCreateBoard = async () => {
    const board = await createWhiteboard();
    if (board) {
      navigate(`/whiteboard/${board.id}`);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-purple-50/30 to-fuchsia-50/30">
      {/* Fixed Header Section */}
      <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-fuchsia-50 px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                All Boards
              </h1>
              <div className="px-3 py-1 bg-gradient-to-r from-violet-200 to-fuchsia-200 rounded-full">
                <span className="text-sm font-semibold text-violet-700">
                  {whiteboards.length}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Manage and organize your workspace
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-violet-300 transition-all shadow-sm hover:shadow">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            Advanced Filters
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select>
            <SelectTrigger className="w-auto h-8 bg-white border-slate-200 font-medium text-[12px] hover:border-violet-300 hover:shadow-sm transition-all rounded-xl">
              <Clock className="h-4 w-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Last modified" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
              <SelectGroup>
                <SelectItem
                  value="recent"
                  className="hover:bg-violet-50 focus:bg-violet-50 rounded-lg"
                >
                  Recently modified
                </SelectItem>
                <SelectItem
                  value="oldest"
                  className="hover:bg-violet-50 focus:bg-violet-50 rounded-lg"
                >
                  Oldest first
                </SelectItem>
                <SelectItem
                  value="name"
                  className="hover:bg-violet-50 focus:bg-violet-50 rounded-lg"
                >
                  Name (A-Z)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-auto h-8 bg-white border-slate-200 font-medium text-[12px] hover:border-violet-300 hover:shadow-sm transition-all rounded-xl">
              <Calendar className="h-4 w-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
              <SelectGroup>
                <SelectItem
                  value="today"
                  className="hover:bg-violet-50 focus:bg-violet-50 rounded-lg"
                >
                  Today
                </SelectItem>
                <SelectItem
                  value="week"
                  className="hover:bg-violet-50 focus:bg-violet-50 rounded-lg"
                >
                  This week
                </SelectItem>
                <SelectItem
                  value="month"
                  className="hover:bg-violet-50 focus:bg-violet-50 rounded-lg"
                >
                  This month
                </SelectItem>
                <SelectItem
                  value="all"
                  className="hover:bg-violet-50 focus:bg-violet-50 rounded-lg"
                >
                  All time
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-auto h-8 bg-white border-slate-200 font-medium text-[12px] hover:border-violet-300 hover:shadow-sm transition-all rounded-xl">
              <User className="h-4 w-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
              <SelectGroup>
                <SelectItem
                  value="me"
                  className="hover:bg-violet-50 focus:bg-violet-50 rounded-lg"
                >
                  Created by me
                </SelectItem>
                <SelectItem
                  value="shared"
                  className="hover:bg-violet-50 focus:bg-violet-50 rounded-lg"
                >
                  Shared with me
                </SelectItem>
                <SelectItem
                  value="all"
                  className="hover:bg-violet-50 focus:bg-violet-50 rounded-lg"
                >
                  All owners
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable Boards Grid */}
      <section className="px-8 py-8 mb-10 bg-gradient-to-br from-gray-200 via-gray-400 to-blue-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {whiteboards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onNavigate={() => navigate(`/whiteboard/${board.id}`)}
              onRename={renameBoard}
              onMoveToTrash={moveToTrash}
              onToggleFavorite={toggleFavorite}
              onShare={shareBoard}
              onDownload={downloadBoard}
            />
          ))}
        </div>

        {/* Empty State */}
        {whiteboards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-3xl"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/10">
                <Grid2x2 className="h-12 w-12 text-violet-600" />
                <Sparkles className="h-5 w-5 text-fuchsia-500 absolute -top-1 -right-1" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No boards yet
            </h3>
            <p className="text-slate-500 text-sm mb-8 max-w-md text-center">
              Create your first board and start collaborating with your team
            </p>
            <button
              onClick={handleCreateBoard}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all hover:scale-105"
            >
              Create New Board
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default ListBoard;
