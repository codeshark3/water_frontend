"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "~/lib/auth-client";
// import { updateUserAction } from "~/app/src/server/user_actions";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface CreateUserDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

const CreateUserDialog = ({ isOpen, onClose, onSuccess }: CreateUserDialogProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [open, setOpen] = useState<boolean>(!!isOpen);

  // Sync internal state when controlled prop provided
  useEffect(() => {
    if (typeof isOpen === "boolean") setOpen(isOpen);
  }, [isOpen]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      if (!form.password || form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      // Prefer admin API to avoid session/redirect
      const { data, error } = await authClient.admin.createUser({
        email: form.email,
        name: form.name,
        password: form.password,
      });
      if (error) throw new Error(error.message || "Failed to create user");

      // Ensure default role is "user" if available
      // If your auth provider supports role on sign-up, set it there.

      toast.success("User created");
      onSuccess?.();
      onClose?.();
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (onClose) {
      if (!next) onClose();
    } else {
      setOpen(next);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New User</DialogTitle>
          <DialogDescription>Create a new user account.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={form.name} onChange={onChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={onChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={form.password} onChange={onChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleCreate} disabled={isLoading}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;


