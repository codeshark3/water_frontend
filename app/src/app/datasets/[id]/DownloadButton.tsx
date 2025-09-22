"use client";

import { Button } from "~/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonProps {
    fileUrl: string;
}

const DownloadButton = ({ fileUrl }: DownloadButtonProps) => (
    <Button
        variant="secondary"
        onClick={() => window.open(fileUrl, '_blank', 'noopener,noreferrer')}
    >
        <Download className="mr-2 h-4 w-4" />
        Download Dataset
    </Button>
);

export default DownloadButton; 