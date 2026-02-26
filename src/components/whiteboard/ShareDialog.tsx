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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (email: string, role: "EDITOR" | "VIEWER") => Promise<boolean>;
}

export const ShareDialog = ({
  open,
  onOpenChange,
  onShare,
}: ShareDialogProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("VIEWER");
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) return;

    setIsLoading(true);
    const success = await onShare(email, role);
    setIsLoading(false);

    if (success) {
      setEmail("");
      setRole("VIEWER");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-200">
        <DialogHeader>
          <DialogTitle>Share Board</DialogTitle>
          <DialogDescription>
            Invite someone to collaborate on this board
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="user-email">Email Address</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-role">Permission</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as "EDITOR" | "VIEWER")}
              disabled={isLoading}
            >
              <SelectTrigger id="user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">View</SelectItem>
                <SelectItem value="EDITOR">Edit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isLoading || !email.trim()}>
            {isLoading ? "Sharing..." : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
