'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";

const rowsPerPageOptions = [25, 50, 100];

export function RowsPerPageSelect({ defaultValue }: { defaultValue: number }) {
    return (
        <form className="w-24">
            <Select
                name="perPage"
                defaultValue={String(defaultValue)}
                onValueChange={(value) => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('perPage', value);
                    url.searchParams.set('page', '1');
                    window.location.href = url.toString();
                }}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {rowsPerPageOptions.map((option) => (
                        <SelectItem key={option} value={String(option)}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </form>
    );
} 