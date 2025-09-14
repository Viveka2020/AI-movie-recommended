import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import {
  Film as FilmIcon,
  Star as StarIcon,
  Search as SearchIcon,
  PlayCircle as PlayIcon,
} from "lucide-react";

// Dataset URL provided by user attachment
const DATASET_URL =
  "https://cdn.builder.io/o/assets%2F71c7b6b864574b1b8961350c142edc8e%2Ffadf24aeff3f429dbc2f0fae63067fab?alt=media&token=8cc13d24-7ba2-44b9-8500-b47dae542e76&apiKey=71c7b6b864574b1b8961350c142edc8e";

type Movie = {
  id: string;
  title: string;
  year: number;
  rating: number; // 0 - 10, fallback 0 if missing
  genres: string[];
};

const GENRE_LIMIT = 12;
const GENRE_PALETTE: { bg: string; text: string; ring: string }[] = [
  { bg: "bg-rose-500/15", text: "text-rose-700", ring: "ring-rose-400/40" },
  {
    bg: "bg-orange-500/15",
    text: "text-orange-700",
    ring: "ring-orange-400/40",
  },
  { bg: "bg-amber-500/15", text: "text-amber-700", ring: "ring-amber-400/40" },
  {
    bg: "bg-yellow-500/15",
    text: "text-yellow-700",
    ring: "ring-yellow-400/40",
  },
  { bg: "bg-lime-500/15", text: "text-lime-700", ring: "ring-lime-400/40" },
  { bg: "bg-green-500/15", text: "text-green-700", ring: "ring-green-400/40" },
  {
    bg: "bg-emerald-500/15",
    text: "text-emerald-700",
    ring: "ring-emerald-400/40",
  },
  { bg: "bg-teal-500/15", text: "text-teal-700", ring: "ring-teal-400/40" },
  { bg: "bg-cyan-500/15", text: "text-cyan-700", ring: "ring-cyan-400/40" },
  { bg: "bg-sky-500/15", text: "text-sky-700", ring: "ring-sky-400/40" },
  { bg: "bg-blue-500/15", text: "text-blue-700", ring: "ring-blue-400/40" },
  {
    bg: "bg-indigo-500/15",
    text: "text-indigo-700",
    ring: "ring-indigo-400/40",
  },
  {
    bg: "bg-violet-500/15",
    text: "text-violet-700",
    ring: "ring-violet-400/40",
  },
  {
    bg: "bg-purple-500/15",
    text: "text-purple-700",
    ring: "ring-purple-400/40",
  },
  {
    bg: "bg-fuchsia-500/15",
    text: "text-fuchsia-700",
    ring: "ring-fuchsia-400/40",
  },
  { bg: "bg-pink-500/15", text: "text-pink-700", ring: "ring-pink-400/40" },
];

export default function Index() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"rating" | "year">("rating");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const genreColorMap = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    loadDataset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDataset() {
    try {
      setLoading(true);
      setError(null);
      // Prefer server-side parsed JSON to avoid large browser buffers
      const jsonUrl =
        "/api/dataset-json?url=" + encodeURIComponent(DATASET_URL);
      try {
        const r = await fetch(jsonUrl, { cache: "no-cache" });
        if (r.ok) {
          const { rows } = await r.json();
          const normalized: Movie[] = rows
            .map((row: any, idx: number) => mapRowToMovie(row, idx))
            .filter((m: Movie) => !!m.title);
          applyMovies(normalized);
          return;
        }
      } catch (e) {
        console.warn("dataset-json failed, falling back to client parse", e);
      }

      const proxyUrl = "/api/dataset?url=" + encodeURIComponent(DATASET_URL);
      const localUrl = "/dataset.xlsx";
      let buf: ArrayBuffer | null = null;

      // Try local cached copy, then proxy, then direct
      try {
        const local = await fetch(localUrl, { cache: "no-cache" });
        if (!local.ok) throw new Error(`Local HTTP ${local.status}`);
        buf = await local.arrayBuffer();
      } catch (errLocal) {
        try {
          const res = await fetch(proxyUrl);
          if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
          buf = await res.arrayBuffer();
        } catch (errProxy) {
          const direct = await fetch(DATASET_URL, {
            method: "GET",
            headers: {
              Accept:
                "application/octet-stream, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;q=0.9, */*;q=0.1",
            },
            mode: "cors",
          });
          if (!direct.ok) throw new Error(`Direct HTTP ${direct.status}`);
          buf = await direct.arrayBuffer();
        }
      }

      if (!buf) throw new Error("No data buffer received");
      const XLSXMod: any = await import("xlsx");
      const XLSX = XLSXMod.default ?? XLSXMod;
      const rows = parseRowsWithFallback(buf, XLSX);

      const normalized: Movie[] = rows
        .map((row, idx) => mapRowToMovie(row, idx))
        .filter((m): m is Movie => !!m.title);

      applyMovies(normalized);
    } catch (e: any) {
      setError("Failed to load dataset");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function applyMovies(list: Movie[]) {
    const genreSet = new Set<string>();
    list.forEach((m) => m.genres.forEach((g) => genreSet.add(g)));
    const sortedGenres = Array.from(genreSet).sort((a, b) =>
      a.localeCompare(b),
    );
    genreColorMap.current.clear();
    sortedGenres.forEach((g, i) =>
      genreColorMap.current.set(g, i % GENRE_PALETTE.length),
    );
    setMovies(list);
    setAllGenres(sortedGenres);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = movies.filter((m) =>
      q ? m.title.toLowerCase().includes(q) : true,
    );
    if (selected.length) {
      list = list.filter((m) =>
        selected.every((sel) => m.genres.some((g) => isCategoryMatch(sel, g))),
      );
    }
    list = [...list].sort((a, b) =>
      sortBy === "rating" ? b.rating - a.rating : b.year - a.year,
    );
    return list;
  }, [movies, search, selected, sortBy]);

  const trending = useMemo(() => {
    return [...movies]
      .sort((a, b) =>
        a.rating === b.rating ? b.year - a.year : b.rating - a.rating,
      )
      .slice(0, 6);
  }, [movies]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary/10 ring-1 ring-primary/30 grid place-items-center">
              <FilmIcon className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold tracking-tight">CineMatch</span>
            <Badge variant="secondary" className="ml-1 hidden md:inline-flex">
              Interactive • Colorful
            </Badge>
          </div>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Home
            </Button>
            <Button asChild>
              <a href="#discover">Discover</a>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero / Controls */}
        <section className="container grid gap-6 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Movie recommendations from your dataset
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Search titles, filter by genres, and sort by rating or year.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  id="movie-search"
                  name="search"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  placeholder="Search movies"
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "rating" ? "default" : "outline"}
                  onClick={() => setSortBy("rating")}
                >
                  Top Rated
                </Button>
              </div>
            </div>

            {/* Genre filters with colorful badges */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {(showAllGenres
                ? allGenres
                : allGenres.slice(0, GENRE_LIMIT)
              ).map((g) => {
                const idx = genreColorMap.current.get(g) ?? 0;
                const palette = GENRE_PALETTE[idx];
                const active = selected.includes(g);
                return (
                  <button
                    key={g}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs transition-all hover:scale-105",
                      "animate-in fade-in-50 duration-300",
                      palette.bg,
                      palette.text,
                      active ? cn("ring-2", palette.ring, "ring-offset-2") : "",
                    )}
                    onClick={() =>
                      setSelected((prev) =>
                        prev.includes(g)
                          ? prev.filter((x) => x !== g)
                          : [...prev, g],
                      )
                    }
                  >
                    {g}
                  </button>
                );
              })}
              {allGenres.length > GENRE_LIMIT && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAllGenres((v) => !v)}
                >
                  {showAllGenres
                    ? "Show less"
                    : `Show more (${allGenres.length - GENRE_LIMIT})`}
                </Button>
              )}
              {selected.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected([])}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {loading && (
            <div className="mx-auto mt-4 max-w-md text-center text-sm text-muted-foreground">
              Loading dataset…
            </div>
          )}
          {error && (
            <div className="mx-auto mt-4 max-w-md text-center text-sm text-destructive">
              {error}
            </div>
          )}
        </section>

        {/* Trending */}
        <section
          className="container py-4 md:py-8"
          aria-label="Trending movies"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Trending</h2>
            <div className="text-sm text-muted-foreground">
              Based on ratings
            </div>
          </div>
          <div className="relative">
            <Carousel className="w-full" opts={{ align: "start" }}>
              <CarouselContent>
                {trending.map((m) => (
                  <CarouselItem
                    key={m.id}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
                    <MovieCard
                      movie={m}
                      colorIdx={genreColorIndexForMovie(
                        m,
                        genreColorMap.current,
                      )}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>

        {/* Recommendations */}
        <section id="discover" className="container py-10 md:py-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recommendations</h2>
            <div className="text-sm text-muted-foreground">
              {filtered.length} results
            </div>
          </div>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No movies matched your filters.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((m) => (
                <MovieCard
                  key={m.id}
                  movie={m}
                  colorIdx={genreColorIndexForMovie(m, genreColorMap.current)}
                  onClick={() => setSelected(m.genres)}
                />
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="container pb-16 pt-4">
          <Card className="overflow-hidden">
            <div className="grid gap-6 p-8 md:grid-cols-2 md:p-10">
              <div>
                <CardHeader className="p-0">
                  <Badge className="w-fit">Interactive</Badge>
                  <CardTitle className="mt-2">
                    Click a card to filter by its genres
                  </CardTitle>
                  <CardDescription>
                    The UI updates instantly using your uploaded Excel dataset.
                  </CardDescription>
                </CardHeader>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild>
                  <a href="#discover">Browse picks</a>
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Back to top
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} CineMatch</p>
          <div className="flex items-center gap-4">
            <a className="hover:text-foreground" href="#discover">
              Discover
            </a>
            <a className="hover:text-foreground" href="#top">
              Back to top
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function isZipXlsx(ab: ArrayBuffer) {
  const sig = new Uint8Array(ab.slice(0, 4));
  return (
    sig[0] === 0x50 && sig[1] === 0x4b && sig[2] === 0x03 && sig[3] === 0x04
  ); // PK\x03\x04
}

function parseRowsWithFallback(ab: ArrayBuffer, XLSX: any): any[] {
  try {
    // Prefer XLSX (zip) parsing
    if (isZipXlsx(ab)) {
      const wb = XLSX.read(ab, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet, { defval: "" });
    }
    throw new Error("Not a ZIP/XLSX payload, attempting CSV parse");
  } catch (e) {
    // Fallback: attempt CSV parse from decoded text using XLSX.read on string
    try {
      const text = new TextDecoder("utf-8").decode(new Uint8Array(ab));
      const trimmed = text.trim();
      if (!trimmed) throw new Error("Empty dataset text");
      if (trimmed.startsWith("<"))
        throw new Error("Received HTML instead of dataset");
      const wb = XLSX.read(trimmed, { type: "string" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet, { defval: "" });
    } catch (e2) {
      console.error("Dataset parse failed", e, e2);
      throw e2;
    }
  }
}

function mapRowToMovie(row: Record<string, any>, idx: number): Movie {
  // Normalize keys to lower for flexible mapping
  const entries = Object.entries(row);
  const lower: Record<string, any> = {};
  for (const [k, v] of entries) lower[k.toLowerCase()] = v;

  const title = String(
    lower["title"] ??
      lower["name"] ??
      lower["movie"] ??
      lower["show_name"] ??
      "",
  ).trim();

  const yearRaw =
    lower["year"] ??
    lower["release_year"] ??
    lower["releaseyear"] ??
    lower["yr"];
  const year =
    Number.parseInt(String(yearRaw ?? "").replace(/[^0-9]/g, "")) || 0;

  const ratingRaw =
    lower["imdb_rating"] ??
    lower["imdb score"] ??
    lower["score"] ??
    lower["rating_score"] ??
    lower["ratingvalue"] ??
    lower["rating"];
  const rating = (() => {
    const n = Number.parseFloat(
      String(ratingRaw ?? "")
        .toString()
        .replace(/,/, "."),
    );
    if (Number.isFinite(n)) return n > 10 ? Math.min(10, n / 10) : n; // normalize 0-10
    return 0;
  })();

  const genresRaw =
    lower["genres"] ??
    lower["genre"] ??
    lower["listed_in"] ??
    lower["category"];
  const genres = Array.isArray(genresRaw)
    ? (genresRaw as any[]).map((g) => String(g).trim()).filter(Boolean)
    : String(genresRaw ?? "")
        .split(/[,/]|\|/)
        .map((s) => s.trim())
        .filter(Boolean);

  const id = title
    ? `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${idx}`
    : `${idx}`;

  return { id, title, year, rating, genres };
}

function genreColorIndexForMovie(m: Movie, map: Map<string, number>): number {
  const g = m.genres[0];
  return g ? (map.get(g) ?? 0) : 0;
}

function normCat(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/^tv\s+/, "");
}
function isCategoryMatch(a: string, b: string) {
  const na = normCat(a);
  const nb = normCat(b);
  return na === nb || nb.includes(na) || na.includes(nb);
}

function MovieCard({
  movie,
  colorIdx,
  onClick,
}: {
  movie: Movie;
  colorIdx?: number;
  onClick?: () => void;
}) {
  const palette = GENRE_PALETTE[(colorIdx ?? 0) % GENRE_PALETTE.length];
  return (
    <Card
      className={cn(
        "group overflow-hidden transition-colors hover:scale-[1.01]",
        "animate-in fade-in-50 zoom-in-95 duration-300",
        palette.bg,
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base leading-tight">
              {movie.title}
            </CardTitle>
            <CardDescription>
              {movie.year || "Year N/A"} •{" "}
              {movie.genres.join(", ") || "No genres"}
            </CardDescription>
          </div>
          <div
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1",
              palette.bg,
            )}
          >
            <StarIcon className={cn("h-4 w-4", palette.text)} />
            <span className={cn("font-medium text-sm", palette.text)}>
              {movie.rating ? movie.rating.toFixed(1) : "—"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-[16/9] w-full overflow-hidden rounded-md border bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-slate-200 group-hover:to-slate-300">
          <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
            <PlayIcon className="h-6 w-6" />
            <span className="text-xs">Trailer</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
