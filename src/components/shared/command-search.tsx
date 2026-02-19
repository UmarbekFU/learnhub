"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, BookOpen, User, FolderOpen } from "lucide-react";

interface SearchResult {
  courses: { id: string; title: string; slug: string }[];
  categories: { id: string; name: string; slug: string }[];
}

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ courses: [], categories: [] });
  const router = useRouter();

  useEffect(() => {
    function down(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const search = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setResults({ courses: [], categories: [] });
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        setResults(await res.json());
      }
    } catch {
      // Search failed silently
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 300);
    return () => clearTimeout(timeout);
  }, [query, search]);

  function handleSelect(url: string) {
    setOpen(false);
    setQuery("");
    router.push(url);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search courses, categories..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {results.courses.length > 0 && (
            <CommandGroup heading="Courses">
              {results.courses.map((course) => (
                <CommandItem
                  key={course.id}
                  onSelect={() => handleSelect(`/courses/${course.slug}`)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  {course.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {results.categories.length > 0 && (
            <CommandGroup heading="Categories">
              {results.categories.map((cat) => (
                <CommandItem
                  key={cat.id}
                  onSelect={() => handleSelect(`/browse/${cat.slug}`)}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  {cat.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
