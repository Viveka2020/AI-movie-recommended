'use client';

import { movies, type Movie } from '@/lib/data';
import { MovieCard } from '@/components/movie-card';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

export default function MoviesPage() {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleMovieClick = (movie: Movie) => {
    router.push(`/?movieId=${movie.id}`);
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
        <div className="container py-10">
          <h1 className="text-3xl font-bold mb-8 font-headline">Browse All Movies</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {movies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onClick={() => handleMovieClick(movie)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
