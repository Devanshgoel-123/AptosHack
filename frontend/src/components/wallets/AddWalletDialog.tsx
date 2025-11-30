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
import { Plus } from "lucide-react";

interface AddWalletDialogProps {
  onAdd: (wallet: { address: string; name: string }) => void;
  trigger?: React.ReactNode;
}

export default function AddWalletDialog({ onAdd, trigger }: AddWalletDialogProps) {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onAdd({
        address: address.trim(),
        name: name.trim() || address.trim(),
      });
      setAddress("");
      setName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Wallet</DialogTitle>
          <DialogDescription>
            Enter your wallet address and a friendly name to track it
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="address">Wallet Address</Label>
            <Input
              id="address"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="name">Wallet Name (Optional)</Label>
            <Input
              id="name"
              placeholder="My Trading Wallet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-full">
            Add Wallet
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
