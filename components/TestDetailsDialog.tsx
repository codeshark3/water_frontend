"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Test } from "~/app/tests/columns";

interface TestDetailsDialogProps {
  test: Test | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TestDetailsDialog({ 
  test, 
  isOpen, 
  onClose 
}: TestDetailsDialogProps) {
  if (!test) return null;

  const getResultBadge = (result: string | null) => {
    if (!result) return <Badge variant="secondary">N/A</Badge>;
    
    return (
      <Badge 
        variant={result === "positive" ? "destructive" : "default"}
        className={result === "positive" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
      >
        {result}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Test Details</DialogTitle>
          <DialogDescription>
            Detailed information about the test record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-sm">{test.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Age</label>
                <p className="text-sm">{test.age}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-sm capitalize">{test.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-sm">{test.location}</p>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Onchocerciasis</label>
                <div className="mt-1">
                  {getResultBadge(test.oncho)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Schistosomiasis</label>
                <div className="mt-1">
                  {getResultBadge(test.schistosomiasis)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Lymphatic Filariasis</label>
                <div className="mt-1">
                  {getResultBadge(test.lf)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Soil-transmitted Helminths</label>
                <div className="mt-1">
                  {getResultBadge(test.helminths)}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Record Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Test ID</label>
                <p className="text-xs font-mono">{test.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-xs font-mono">{test.userId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="text-sm">{new Date(test.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Updated At</label>
                <p className="text-sm">{new Date(test.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
