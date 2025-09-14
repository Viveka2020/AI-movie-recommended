import { Film } from "lucide-react";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <Film className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold font-headline text-primary-foreground">
        ReelRecs
      </h1>
    </div>
  );
}
