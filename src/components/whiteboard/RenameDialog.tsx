import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onRename: (newTitle: string) => Promise<boolean>;
}

export const RenameDialog = ({
  open,
  onOpenChange,
  currentTitle,
  onRename,
}: RenameDialogProps) => {
  const [title, setTitle] = useState(currentTitle);
  const [isLoading, setIsLoading] = useState(false);

  const handleRename = async () => {
    if (!title.trim() || title === currentTitle) {
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    const success = await onRename(title);
    setIsLoading(false);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-200">
        <DialogHeader>
          <DialogTitle>Rename Board</DialogTitle>
          <DialogDescription>Enter a new name for your board</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="board-title">Board Name</Label>
            <Input
              id="board-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter board name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename();
                }
              }}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="hover:bg-red-500 hover:border-0"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            disabled={isLoading || !title.trim()}
            className="bg-blue-300 hover:shadow-amber-500"
          >
            {isLoading ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
