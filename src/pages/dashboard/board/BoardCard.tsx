// pages/Client/Dashboard/BoardCard.tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Clock,
  User,
  MoreVertical,
  Pencil,
  Trash2,
  Star,
  Share2,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { WhiteBoardItem } from "@/types/board.type";
import { ShareDialog } from "@/components/whiteboard/ShareDialog";
import { RenameDialog } from "@/components/whiteboard/RenameDialog";
import { DeleteConfirmDialog } from "@/components/whiteboard/DeleteConfirmDialog";

interface BoardCardProps {
  board: WhiteBoardItem;
  onNavigate: () => void;
  onRename: (boardId: string, newTitle: string) => Promise<boolean>;
  onMoveToTrash: (boardId: string) => Promise<boolean>;
  onToggleFavorite: (boardId: string, isFavorite: boolean) => Promise<boolean>;
  onShare: (
    boardId: string,
    email: string,
    role: "EDITOR" | "VIEWER",
  ) => Promise<boolean>;
  onDownload: (boardId: string) => Promise<boolean>;
}

const BoardCard = ({
  board,
  onNavigate,
  onMoveToTrash,
  onRename,
  onToggleFavorite,
  onShare,
  onDownload,
}: BoardCardProps) => {
  const [isFavorite, setIsFavorite] = useState(board.isFavorite || false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingBoard, setIsDeletingBoard] = useState(false);

  console.log("🔄 BoardCard rendering for:", board.id, board.title);

  const handleCardClick = () => {
    onNavigate();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameDialogOpen(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareDialogOpen(true);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onDownload(board.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeletingBoard(true);
    const success = await onMoveToTrash(board.id); // ✅ Dùng prop
    setIsDeletingBoard(false);
    if (success) setDeleteDialogOpen(false);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    const success = await onToggleFavorite(board.id, newFavoriteState);
    if (success) {
      setIsFavorite(newFavoriteState);
    }
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        className="group relative overflow-hidden border border-slate-200 bg-white hover:shadow-xl hover:shadow-violet-500/10 hover:border-violet-300 transition-all duration-300 cursor-pointer hover:-translate-y-1 rounded-2xl"
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>

        <CardContent className="p-0 relative">
          <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
            {!board.thumbnailUrl ? (
              <img
                src="https://res.cloudinary.com/dltbqnpfg/image/upload/v1771001011/backgorund_grid_eax4q6.jpg"
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                alt={board.title}
              />
            ) : (
              <img
                src={board.thumbnailUrl}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                alt={board.title}
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Top Actions Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
              {/* Favorite Button */}
              <button
                onClick={handleToggleFavorite}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110"
              >
                <Star
                  className={`h-4 w-4 transition-colors ${
                    isFavorite
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-600"
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                  <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110">
                    <MoreVertical className="h-4 w-4 text-slate-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-white border-slate-200 shadow-xl rounded-xl"
                  align="end"
                  onClick={handleMenuClick}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={handleRename}
                      className="cursor-pointer hover:bg-violet-50 focus:bg-violet-50 flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    >
                      <Pencil className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">
                        Rename
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleShare}
                      className="cursor-pointer hover:bg-violet-50 focus:bg-violet-50 flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    >
                      <Share2 className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">
                        Share
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleDownload}
                      className="cursor-pointer hover:bg-violet-50 focus:bg-violet-50 flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    >
                      <Download className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">
                        Download
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-slate-100 my-1" />

                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={handleDeleteClick}
                      className="cursor-pointer hover:bg-red-50 focus:bg-red-50 flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Move to Trash</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Quick Open Badge */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white backdrop-blur-sm rounded-full shadow-lg">
                <span className="text-xs font-semibold">Open →</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-3 p-4 bg-white relative z-20">
          {/* Title with Favorite Indicator */}
          <div className="flex items-start justify-between w-full gap-2">
            <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-violet-600 transition-colors flex-1">
              {board.title}
            </h3>
            {isFavorite && (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0 animate-pulse" />
            )}
          </div>

          <div className="w-full space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{new Date(board.updatedAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span className="line-clamp-1">{board.owner.username}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-slate-600">Active</span>
          </div>
        </CardFooter>
      </Card>

      {/* Dialogs */}
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        currentTitle={board.title}
        onRename={(newTitle) => onRename(board.id, newTitle)} // ✅ dùng prop
      />

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onShare={(email, role) => onShare(board.id, email, role)} // ✅ dùng prop
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        boardTitle={board.title}
        isLoading={isDeletingBoard}
      />
    </>
  );
};

export default BoardCard;
