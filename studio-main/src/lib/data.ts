import placeholderData from './placeholder-images.json';
import type { ImagePlaceholder } from './placeholder-images';

export interface Movie {
  id: string;
  title: string;
  genre: string;
  description: string;
  posterId: string;
  posterUrl: string;
  posterHint: string;
  duration: number; // Duration in minutes
}

const rawMovies: Omit<Movie, 'posterUrl' | 'posterHint'>[] = [
    {
        id: '1',
        title: 'Inception',
        genre: 'Sci-Fi, Thriller, Action',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        posterId: 'inception-poster',
        duration: 148
    },
    {
        id: '2',
        title: 'The Matrix',
        genre: 'Sci-Fi, Action',
        description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
        posterId: 'matrix-poster',
        duration: 136
    },
    {
        id: '3',
        title: 'Pulp Fiction',
        genre: 'Crime, Drama',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        posterId: 'pulp-fiction-poster',
        duration: 154
    },
    {
        id: '4',
        title: 'The Godfather',
        genre: 'Crime, Drama',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        posterId: 'godfather-poster',
        duration: 175
    },
    {
        id: '5',
        title: 'Forrest Gump',
        genre: 'Drama, Romance',
        description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.',
        posterId: 'forrest-gump-poster',
        duration: 142
    },
    {
        id: '6',
        title: 'The Dark Knight',
        genre: 'Action, Crime, Drama',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        posterId: 'dark-knight-poster',
        duration: 152
    },
    {
        id: '7',
        title: 'The Shawshank Redemption',
        genre: 'Drama',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        posterId: 'shawshank-poster',
        duration: 142
    },
    {
        id: '8',
        title: 'Fight Club',
        genre: 'Drama',
        description: 'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and they form an underground fight club that evolves into something much, much more.',
        posterId: 'fight-club-poster',
        duration: 139
    },
    {
        id: '9',
        title: 'Interstellar',
        genre: 'Sci-Fi, Drama, Adventure',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        posterId: 'interstellar-poster',
        duration: 169
    },
    {
        id: '10',
        title: 'Parasite',
        genre: 'Thriller, Comedy, Drama',
        description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
        posterId: 'parasite-poster',
        duration: 132
    },
    {
        id: '11',
        title: 'Goodfellas',
        genre: 'Crime, Drama, Biography',
        description: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.',
        posterId: 'goodfellas-poster',
        duration: 146
    },
    {
        id: '12',
        title: 'Se7en',
        genre: 'Crime, Drama, Mystery',
        description: 'Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.',
        posterId: 'se7en-poster',
        duration: 127
    },
    {
        id: '13',
        title: 'The Silence of the Lambs',
        genre: 'Crime, Drama, Thriller',
        description: 'A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims.',
        posterId: 'silence-lambs-poster',
        duration: 118
    },
    {
        id: '14',
        title: 'The Usual Suspects',
        genre: 'Crime, Mystery, Thriller',
        description: 'A sole survivor tells of the twisty events leading up to a horrific gun battle on a boat, which began when five criminals met in a seemingly random police lineup.',
        posterId: 'usual-suspects-poster',
        duration: 106
    },
    {
        id: '15',
        title: 'Gladiator',
        genre: 'Action, Adventure, Drama',
        description: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
        posterId: 'gladiator-poster',
        duration: 155
    },
    {
        id: '16',
        title: 'Saving Private Ryan',
        genre: 'Drama, War',
        description: 'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.',
        posterId: 'saving-private-ryan-poster',
        duration: 169
    },
    {
        id: '17',
        title: 'Back to the Future',
        genre: 'Adventure, Comedy, Sci-Fi',
        description: 'Marty McFly, a 17-year-old high school student, is accidentally sent thirty years into the past in a time-traveling DeLorean invented by his close friend, the eccentric scientist Doc Brown.',
        posterId: 'back-to-the-future-poster',
        duration: 116
    },
    {
        id: '18',
        title: 'The Lion King',
        genre: 'Animation, Adventure, Drama',
        description: 'Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.',
        posterId: 'the-lion-king-poster',
        duration: 88
    },
    {
        id: '19',
        title: 'Jurassic Park',
        genre: 'Action, Adventure, Sci-Fi',
        description: 'A pragmatic paleontologist visiting an almost complete theme park is tasked with protecting a couple of kids after a power failure causes the park\'s cloned dinosaurs to run loose.',
        posterId: 'jurassic-park-poster',
        duration: 127
    },
    {
        id: '20',
        title: 'Alien',
        genre: 'Horror, Sci-Fi',
        description: 'After a space merchant vessel receives an unknown transmission as a distress call, one of the crew is attacked by a mysterious life form and they soon realize that its life cycle has merely begun.',
        posterId: 'alien-poster',
        duration: 117
    }
];

const imageMap = new Map<string, ImagePlaceholder>(
  placeholderData.placeholderImages.map(img => [img.id, img])
);

export const movies: Movie[] = rawMovies.map(movie => {
  const imageData = imageMap.get(movie.posterId);
  return {
    ...movie,
    posterUrl: imageData?.imageUrl || '',
    posterHint: imageData?.imageHint || '',
  };
});
