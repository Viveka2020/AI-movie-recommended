'use server';

/**
 * @fileOverview AI flow to generate movie recommendations based on a selected movie's content.
 *
 * - generateRecommendations - Function to generate movie recommendations.
 * - GenerateRecommendationsInput - Input type for the generateRecommendations function.
 * - GenerateRecommendationsOutput - Output type for the generateRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecommendationsInputSchema = z.object({
  movieTitle: z.string().describe('The title of the movie to base recommendations on.'),
  movieGenre: z.string().describe('The genre of the movie.'),
  movieDescription: z.string().describe('A detailed description of the movie.'),
});

export type GenerateRecommendationsInput = z.infer<typeof GenerateRecommendationsInputSchema>;

const GenerateRecommendationsOutputSchema = z.object({
  recommendedMovies: z
    .array(z.string())
    .describe('A list of recommended movie titles based on the input movie.'),
});

export type GenerateRecommendationsOutput = z.infer<typeof GenerateRecommendationsOutputSchema>;

export async function generateRecommendations(
  input: GenerateRecommendationsInput
): Promise<GenerateRecommendationsOutput> {
  return generateRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecommendationsPrompt',
  input: {schema: GenerateRecommendationsInputSchema},
  output: {schema: GenerateRecommendationsOutputSchema},
  prompt: `You are a movie expert. Recommend 5 movies similar to the following movie. Consider genre and description when recommending.

Movie Title: {{{movieTitle}}}
Genre: {{{movieGenre}}}
Description: {{{movieDescription}}}

Recommended Movies:`,
});

const generateRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateRecommendationsFlow',
    inputSchema: GenerateRecommendationsInputSchema,
    outputSchema: GenerateRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
