// pages/dashboard/layout/SharedPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWhiteboard } from "@/hooks/use-whiteboard";
import { Sparkles, Users } from "lucide-react";
import BoardCard from "../board/BoardCard";

const SharedPage = () => {
  const navigate = useNavigate();
  const {
    sharedBoards,
    sharedTotal,
    isLoading,
    fetchSharedBoards,
    renameBoard,
    toggleFavorite,
    moveToTrash,
    shareBoard,
    downloadBoard,
  } = useWhiteboard();

  const [page] = useState(1);
  const limit = 8;

  useEffect(() => {
    fetchSharedBoards(page, limit);
  }, [fetchSharedBoards, page]);

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-purple-50/30 to-fuchsia-50/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-fuchsia-50 px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Shared with me
              </h1>
              <div className="px-3 py-1 bg-gradient-to-r from-violet-200 to-fuchsia-200 rounded-full">
                <span className="text-sm font-semibold text-violet-700">
                  {sharedTotal}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Boards shared with you by other users
            </p>
          </div>
        </div>
      </div>

      {/* Boards Grid */}
      <section className="px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          </div>
        ) : sharedBoards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-3xl"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/10">
                <Users className="h-12 w-12 text-violet-600" />
                <Sparkles className="h-5 w-5 text-fuchsia-500 absolute -top-1 -right-1" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No shared boards
            </h3>
            <p className="text-slate-500 text-sm max-w-md text-center">
              When someone shares a board with you, it will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sharedBoards.map((board) => (
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
        )}
      </section>
    </div>
  );
};

export default SharedPage;
