import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

export type SearchBoxProps = {
  defaultValue?: string;
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  id?: string;
  className?: string;
};

/** Plain GET form to /search — works without JavaScript and is crawlable (SearchAction target). */
export function SearchBox({ defaultValue, size = "md", placeholder = "Search jars, mops, racks…", id = "site-search", className }: SearchBoxProps) {
  return (
    <form role="search" action="/search" method="get" className={cn("relative w-full", className)}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <Input
        id={id}
        name="q"
        type="search"
        size={size}
        defaultValue={defaultValue}
        placeholder={placeholder}
        leadingIcon={<Search className="h-4 w-4" />}
        enterKeyHint="search"
        autoComplete="off"
        className="rounded-full bg-background"
      />
    </form>
  );
}
