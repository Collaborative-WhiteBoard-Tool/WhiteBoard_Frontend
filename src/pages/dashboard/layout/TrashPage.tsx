// pages/dashboard/layout/TrashPage.tsx
import { useEffect, useState } from "react";
import { useWhiteboard } from "@/hooks/use-whiteboard";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User, RotateCcw, Trash2 } from "lucide-react";

const TrashPage = () => {
  const {
    deletedBoards,
    deletedTotal,
    isLoading,
    fetchDeletedBoards,
    restoreBoard,
    permanentlyDelete,
  } = useWhiteboard();

  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    fetchDeletedBoards(page, limit);
  }, [fetchDeletedBoards, page]);

  const handleRestore = async (boardId: string) => {
    const success = await restoreBoard(boardId);
    if (success) {
      fetchDeletedBoards(page, limit);
    }
  };

  const handlePermanentDelete = async (boardId: string) => {
    if (
      confirm("Permanently delete this board? This action cannot be undone.")
    ) {
      const success = await permanentlyDelete(boardId);
      if (success) {
        fetchDeletedBoards(page, limit);
      }
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-purple-50/30 to-fuchsia-50/30">
      <div className="bg-gradient-to-br from-red-100 via-orange-50 to-yellow-50 px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Trash
              </h1>
              <div className="px-3 py-1 bg-gradient-to-r from-red-200 to-orange-200 rounded-full">
                <span className="text-sm font-semibold text-red-700">
                  {deletedTotal}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              Boards will be permanently deleted after 30 days
            </p>
          </div>
        </div>
      </div>

      <section className="px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          </div>
        ) : deletedBoards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/20 to-gray-500/20 blur-3xl"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-slate-100 via-gray-100 to-slate-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                <Trash2 className="h-12 w-12 text-slate-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Trash is empty
            </h3>
            <p className="text-slate-500 text-sm max-w-md text-center">
              Deleted boards will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deletedBoards.map((board) => (
              <Card
                key={board.id}
                className="group relative overflow-hidden border border-slate-200 bg-white rounded-2xl"
              >
                <CardContent className="p-0 relative">
                  <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 opacity-60">
                    <img
                      src={
                        board.thumbnailUrl ||
                        "https://res.cloudinary.com/dltbqnpfg/image/upload/v1771001011/backgorund_grid_eax4q6.jpg"
                      }
                      className="h-full w-full object-cover"
                      alt={board.title}
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-3 p-4 bg-white">
                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 w-full">
                    {board.title}
                  </h3>

                  <div className="w-full space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        Deleted {new Date(board.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span className="line-clamp-1">
                        {board.owner.username}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleRestore(board.id)}
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handlePermanentDelete(board.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TrashPage;
