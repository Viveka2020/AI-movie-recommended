'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { movies, type Movie } from '@/lib/data';
import { getRecommendedMovies } from './actions';
import { MovieCard } from '@/components/movie-card';
import { RecommendationSkeleton } from '@/components/recommendation-skeleton';
import { Logo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname, useSearchParams } from 'next/navigation';

const suggestedMovies = [
  'Inception',
  'The Matrix',
  'Pulp Fiction',
  'The Dark Knight',
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const movieId = searchParams.get('movieId');
    if (movieId) {
      const movie = movies.find(m => m.id === movieId);
      if (movie) {
        handleSelectMovie(movie);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm) {
      return [];
    }
    return movies.filter(movie =>
      movie.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ).slice(0, 5);
  }, [debouncedSearchTerm]);

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setRecommendations([]);
    setSearchTerm('');
    
    startTransition(async () => {
      try {
        const recommended = await getRecommendedMovies(movie);
        setRecommendations(recommended);
      } catch (error) {
        console.error(error);
        toast({
          title: "Recommendation Error",
          description: "Could not generate recommendations. Please try again.",
          variant: "destructive",
        })
      }
    });
  };
  
  const handleSuggestionClick = (movieTitle: string) => {
    const movie = movies.find(m => m.title === movieTitle);
    if (movie) {
      handleSelectMovie(movie);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === '/' ? 'text-primary' : 'text-muted-foreground')}>
                Home
              </Link>
              <Link href="/movies" className={cn("text-sm font-medium transition-colors hover:text-primary", pathname === '/movies' ? 'text-primary' : 'text-muted-foreground')}>
                Movies
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container relative pb-10">
          <section className="mx-auto flex max-w-3xl flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-12">
            <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] font-headline">
              Find Your Next Favorite Film
            </h1>
            <p
              className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl"
              data-branner-id="2"
            >
              Select a movie you love, and our AI will recommend what to watch next.
            </p>
          </section>

          <div className="relative mx-auto max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for a movie..."
                className="w-full rounded-full pl-10 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && searchTerm && (
              <div className="absolute top-full mt-2 w-full rounded-lg border bg-card shadow-lg z-10">
                <ul className="py-2">
                  {searchResults.map(movie => (
                    <li key={movie.id}>
                      <button 
                        className="w-full text-left px-4 py-2 hover:bg-accent flex items-center gap-4"
                        onClick={() => handleSelectMovie(movie)}
                      >
                        <div className="w-10 h-14 relative flex-shrink-0">
                          <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover rounded-sm" />
                        </div>
                        <div>
                          <p className="font-semibold">{movie.title}</p>
                          <p className="text-sm text-muted-foreground">{movie.genre}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {!selectedMovie && !searchTerm && (
            <div className="text-center mt-6">
              <p className="text-muted-foreground mb-3">Or try one of these:</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {suggestedMovies.map(title => (
                  <Button
                    key={title}
                    variant="outline"
                    className="rounded-full"
                    onClick={() => handleSuggestionClick(title)}
                  >
                    {title}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-12">
            {selectedMovie && (
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-headline">
                  Recommendations based on <span className="text-primary">{selectedMovie.title}</span>
                </h2>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {isPending && Array.from({ length: 5 }).map((_, index) => (
                <RecommendationSkeleton key={index} />
              ))}
              {!isPending && recommendations.map((movie, index) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleSelectMovie(movie)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
