'use server';

import { generateRecommendations } from '@/ai/flows/generate-recommendations';
import { movies, type Movie } from '@/lib/data';

export async function getRecommendedMovies(selectedMovie: Movie): Promise<Movie[]> {
  try {
    const output = await generateRecommendations({
      movieTitle: selectedMovie.title,
      movieGenre: selectedMovie.genre,
      movieDescription: selectedMovie.description,
    });

    if (!output || !output.recommendedMovies) {
        throw new Error('AI did not return recommendations.');
    }

    const recommendedTitles = new Set(output.recommendedMovies.map(t => t.toLowerCase()));

    const recommendedMovies = movies.filter(movie =>
      recommendedTitles.has(movie.title.toLowerCase())
    );

    // If we have fewer than 5 recommendations, supplement with movies of the same genre.
    if (recommendedMovies.length < 5) {
      const primaryGenre = selectedMovie.genre.split(',')[0].trim();
      const genreFallback = movies.filter(movie =>
        movie.genre.includes(primaryGenre) &&
        movie.id !== selectedMovie.id &&
        !recommendedMovies.some(rm => rm.id === movie.id)
      );

      const needed = 5 - recommendedMovies.length;
      recommendedMovies.push(...genreFallback.slice(0, needed));
    }
    
    // Ensure the selected movie is not in the recommendations and limit to 5
    return recommendedMovies.filter(movie => movie.id !== selectedMovie.id).slice(0, 5);

  } catch (error) {
    console.error("Error generating recommendations:", error);
    // Fallback: return top 5 movies of the same genre if AI fails
    const primaryGenre = selectedMovie.genre.split(',')[0].trim();
    return movies.filter(movie =>
        movie.genre.includes(primaryGenre) &&
        movie.id !== selectedMovie.id
    ).slice(0, 5);
  }
}
