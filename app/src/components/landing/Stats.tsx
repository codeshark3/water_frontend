import { MoveDownLeft, MoveUpRight } from "lucide-react";

const items = [
  {
    value: "1000" + "+",
    label: "Datasets",
  },
  {
    value: "1500",
    label: "Published papers",
  },
  {
    value: "200",
    label: "Active users",
  },
  {
    value: "1000" + "+",
    label: "Collaborating institutions",
  },
];

function Item({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col justify-center gap-0 rounded-md border p-6">
      {/* <MoveUpRight className="mb-10 h-4 w-4 text-primary" /> */}
      <h2 className="font-regular flex max-w-xl flex-row items-end justify-center gap-4 text-center text-4xl tracking-tighter">
        {value}
        {/* <span className="text-sm tracking-normal text-muted-foreground">
          +2.1%
        </span> */}
      </h2>
      <p className="max-w-xl text-center text-base leading-relaxed tracking-tight text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export const Stats = () => (
  <div className="w-full py-10 lg:py-20">
    <div className="container mx-auto">
      <div className="grid w-full grid-cols-1 gap-4 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {items.map((item) => (
          <Item key={item.label} value={item.value} label={item.label} />
        ))}
      </div>
    </div>
  </div>
);
