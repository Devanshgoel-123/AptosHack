import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

interface AddInfluencerDialogProps {
  onAdd: (handle: string) => void;
}

export default function AddInfluencerDialog({ onAdd }: AddInfluencerDialogProps) {
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      onAdd(handle.trim());
      setHandle("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Track Influencer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track New Influencer</DialogTitle>
          <DialogDescription>
            Enter a Twitter/X handle to track their crypto mentions
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="handle">Twitter Handle</Label>
            <Input
              id="handle"
              placeholder="@username"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-full">
            Track Influencer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
