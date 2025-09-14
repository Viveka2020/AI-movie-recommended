import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Movie } from '@/lib/data';
import { Clock } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function MovieCard({ movie, onClick, className, style }: MovieCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const cardContent = (
    <Card
      className={cn(
        'h-full overflow-hidden border-2 border-transparent transition-all duration-300 ease-in-out hover:border-primary hover:shadow-lg hover:shadow-primary/20',
        onClick ? 'cursor-pointer' : '',
        className
      )}
      style={style}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-[2/3] w-full">
          <Image
            src={movie.posterUrl}
            alt={`Poster for ${movie.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={movie.posterHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="line-clamp-1 text-lg font-bold font-headline">
          {movie.title}
        </CardTitle>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {movie.genre}
        </p>
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1.5" />
          <span>{formatDuration(movie.duration)}</span>
        </div>
      </CardContent>
    </Card>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="h-full w-full text-left">
        {cardContent}
      </button>
    );
  }

  return cardContent;
}
