"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Test } from "~/app/tests/columns";

interface DeleteTestDialogProps {
  test: Test | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteTestDialog({ 
  test, 
  isOpen, 
  onClose, 
  onSuccess 
}: DeleteTestDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!test) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tests/${test.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete test");
      }

      toast.success("Test deleted successfully");
      onSuccess?.();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete test");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Test</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this test? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {test && (
          <div className="py-4">
            <div className="space-y-2">
              <p><strong>Name:</strong> {test.name}</p>
              <p><strong>Age:</strong> {test.age}</p>
              <p><strong>Gender:</strong> {test.gender}</p>
              <p><strong>Location:</strong> {test.location}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
