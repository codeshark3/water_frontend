"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Loader2 } from "lucide-react";

const UpdateTestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gender: z.string().min(1, "Gender is required"),
  age: z.coerce.number().int().min(1, "Age must be at least 1").max(120, "Age must be less than 120"),
  location: z.string().min(1, "Location is required"),
  oncho: z.string().optional(),
  schistosomiasis: z.string().optional(),
  lf: z.string().optional(),
  helminths: z.string().optional(),
});

type UpdateTestFormData = z.infer<typeof UpdateTestSchema>;

interface UpdateTestFormProps {
  testId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UpdateTestForm({ 
  testId, 
  isOpen, 
  onClose, 
  onSuccess 
}: UpdateTestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTest, setIsLoadingTest] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateTestFormData>({
    resolver: zodResolver(UpdateTestSchema),
  });

  // Fetch test data when dialog opens
  useEffect(() => {
    if (isOpen && testId) {
      fetchTestData();
    }
  }, [isOpen, testId]);

  const fetchTestData = async () => {
    setIsLoadingTest(true);
    try {
      const response = await fetch(`/api/tests/${testId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch test data");
      }
      const { data } = await response.json();
      
      // Populate form with existing data
      setValue("name", data.name || "");
      setValue("gender", data.gender || "");
      setValue("age", data.age || 0);
      setValue("location", data.location || "");
      setValue("oncho", data.oncho || "");
      setValue("schistosomiasis", data.schistosomiasis || "");
      setValue("lf", data.lf || "");
      setValue("helminths", data.helminths || "");
    } catch (error) {
      console.error("Error fetching test data:", error);
      toast.error("Failed to load test data");
    } finally {
      setIsLoadingTest(false);
    }
  };

  const onSubmit = async (data: UpdateTestFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update test");
      }

      const result = await response.json();
      toast.success("Test updated successfully");
      onSuccess?.();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error updating test:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update test");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (isLoadingTest) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Test</DialogTitle>
            <DialogDescription>
              Loading test data...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Update Test</DialogTitle>
          <DialogDescription>
            Update the test information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={watch("gender")}
                onValueChange={(value) => setValue("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                {...register("age")}
                placeholder="Enter age"
              />
              {errors.age && (
                <p className="text-sm text-red-500">{errors.age.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Enter location"
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test Results</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="oncho">Onchocerciasis</Label>
                <Select
                  value={watch("oncho")}
                  onValueChange={(value) => setValue("oncho", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schistosomiasis">Schistosomiasis</Label>
                <Select
                  value={watch("schistosomiasis")}
                  onValueChange={(value) => setValue("schistosomiasis", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lf">Lymphatic Filariasis</Label>
                <Select
                  value={watch("lf")}
                  onValueChange={(value) => setValue("lf", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="helminths">Soil-transmitted Helminths</Label>
                <Select
                  value={watch("helminths")}
                  onValueChange={(value) => setValue("helminths", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Test
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
