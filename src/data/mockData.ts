import { Review, Comment } from '@/types';

export const mockReviews: Review[] = [
  {
    id: '1',
    title: 'Oppenheimer',
    titleLower: 'oppenheimer',
    language: 'English',
    rating: 5,
    snippet: 'Christopher Nolan delivers a masterpiece that explores the moral complexities of creating the atomic bomb. Cillian Murphy gives a career-defining performance as J. Robert Oppenheimer...',
    content: `Christopher Nolan delivers a masterpiece that explores the moral complexities of creating the atomic bomb. Cillian Murphy gives a career-defining performance as J. Robert Oppenheimer, the brilliant physicist who led the Manhattan Project.

The film is a stunning achievement in biographical filmmaking, weaving together multiple timelines with Nolan's signature precision. The supporting cast, including Robert Downey Jr., Emily Blunt, and Matt Damon, all deliver exceptional performances.

What sets this film apart is its unflinching examination of the consequences of scientific advancement without ethical boundaries. The Trinity test sequence is one of the most visceral and haunting scenes in modern cinema.

Hoyte van Hoytema's cinematography is breathtaking, capturing both the intimate moments of Oppenheimer's personal struggles and the grand scale of the project. Ludwig Göransson's score pulses with tension throughout.

This is essential viewing - a film that demands to be seen on the biggest screen possible. It's a testament to what cinema can achieve when every element aligns perfectly.`,
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    tags: ['Biography', 'Drama', 'History'],
    releaseYear: 2023,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'admin',
    commentCount: 24,
    helpfulCount: 156,
  },
  {
    id: '2',
    title: 'RRR',
    titleLower: 'rrr',
    language: 'Telugu',
    rating: 5,
    snippet: 'S.S. Rajamouli crafts an epic bromance that transcends boundaries. Ram Charan and Jr. NTR deliver performances that will be remembered for generations. The Naatu Naatu sequence alone is worth the price of admission...',
    content: `S.S. Rajamouli crafts an epic bromance that transcends boundaries. Ram Charan and Jr. NTR deliver performances that will be remembered for generations. The Naatu Naatu sequence alone is worth the price of admission.

RRR is a fictional story about two legendary revolutionaries and their journey away from home before they started fighting for their country in the 1920s. The film is a visual spectacle that pushes the boundaries of what Indian cinema can achieve.

The action sequences are nothing short of breathtaking. From the bridge rescue scene to the climactic battle, every set piece is meticulously crafted and executed with flair that Hollywood blockbusters often lack.

The emotional core of the film - the friendship between Bheem and Ram - is what elevates it beyond mere spectacle. Their bond, tested by duty and circumstance, provides genuine dramatic weight.

M.M. Keeravani's music is perfectly integrated, enhancing every emotional beat. The film moves at a brisk pace despite its runtime, never letting the audience's attention waver.

This is blockbuster filmmaking at its absolute finest.`,
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop',
    tags: ['Action', 'Drama', 'Musical'],
    releaseYear: 2022,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    createdBy: 'admin',
    commentCount: 45,
    helpfulCount: 234,
  },
  {
    id: '3',
    title: 'Pathaan',
    titleLower: 'pathaan',
    language: 'Hindi',
    rating: 4,
    snippet: 'Shah Rukh Khan returns with a bang in this high-octane spy thriller. The action sequences are world-class, and the chemistry between SRK and Deepika Padukone sizzles on screen...',
    content: `Shah Rukh Khan returns with a bang in this high-octane spy thriller. The action sequences are world-class, and the chemistry between SRK and Deepika Padukone sizzles on screen.

After a four-year hiatus, the King of Bollywood proves why he's still at the top. Pathaan is a stylish, entertaining ride that delivers exactly what fans wanted - Shah Rukh Khan being effortlessly cool while saving the day.

The film doesn't pretend to be anything more than a popcorn entertainer, and it excels at that. Director Siddharth Anand crafts action sequences that rival international productions, with practical stunts and impressive choreography.

John Abraham makes for a compelling antagonist, bringing gravitas to his role. The spy universe connections add layers for fans of the franchise.

While the plot is fairly predictable, the execution is so slick that it hardly matters. The Jhoome Jo Pathaan song sequence is pure joy, and the finale delivers satisfying payoffs.

A triumphant return for SRK.`,
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
    tags: ['Action', 'Thriller', 'Spy'],
    releaseYear: 2023,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    createdBy: 'admin',
    commentCount: 32,
    helpfulCount: 189,
  },
  {
    id: '4',
    title: 'The Batman',
    titleLower: 'the batman',
    language: 'English',
    rating: 4,
    snippet: 'Matt Reeves reinvents the Dark Knight with a noir-detective approach that feels fresh and compelling. Robert Pattinson brings a vulnerability to Bruce Wayne that we haven\'t seen before...',
    content: `Matt Reeves reinvents the Dark Knight with a noir-detective approach that feels fresh and compelling. Robert Pattinson brings a vulnerability to Bruce Wayne that we haven't seen before.

This isn't just another Batman movie - it's a detective thriller that happens to feature Batman. Reeves leans heavily into the "World's Greatest Detective" aspect of the character, creating a gritty, rain-soaked Gotham that feels lived-in and dangerous.

Pattinson's Batman is younger, angrier, and more damaged than previous iterations. His journey from vengeance to hope forms the emotional backbone of the film. The chemistry with Zoë Kravitz's Catwoman is electric.

Paul Dano's Riddler is genuinely unsettling, a villain for the social media age. Colin Farrell disappears completely into the Penguin role, unrecognizable and fascinating.

Greig Fraser's cinematography is stunning, using shadows and red accents to create unforgettable imagery. Michael Giacchino's theme is instantly iconic.

At nearly three hours, it demands patience, but rewards it with a rich, immersive experience.`,
    posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop',
    tags: ['Action', 'Crime', 'Drama'],
    releaseYear: 2022,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'admin',
    commentCount: 18,
    helpfulCount: 145,
  },
  {
    id: '5',
    title: 'Kantara',
    titleLower: 'kantara',
    language: 'Kannada',
    rating: 5,
    snippet: 'Rishab Shetty creates a cultural phenomenon that celebrates the rich traditions of coastal Karnataka. The climactic Bhoota Kola sequence is one of the most powerful scenes in Indian cinema...',
    content: `Rishab Shetty creates a cultural phenomenon that celebrates the rich traditions of coastal Karnataka. The climactic Bhoota Kola sequence is one of the most powerful scenes in Indian cinema.

Kantara is more than a movie - it's an experience. Set in the fictional village of Dakshina Kannada, it explores the conflict between modern development and ancient traditions, between human law and divine justice.

Rishab Shetty delivers a tour-de-force performance, completely inhabited by his character Shiva. His transformation in the climax must be seen to be believed - it's a moment that transcends acting.

The film's treatment of Bhoota Kola, the traditional ritual art form, is respectful and awe-inspiring. B. Ajaneesh Loknath's music perfectly complements the spiritual atmosphere.

What makes Kantara special is its authenticity. This isn't folklore packaged for mass consumption - it's a genuine celebration of culture, belief, and identity. The forest sequences are magical, creating a world where the supernatural feels natural.

A landmark achievement in Indian regional cinema.`,
    posterUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop',
    tags: ['Action', 'Drama', 'Thriller'],
    releaseYear: 2022,
    createdAt: new Date('2023-12-28'),
    updatedAt: new Date('2023-12-28'),
    createdBy: 'admin',
    commentCount: 67,
    helpfulCount: 312,
  },
  {
    id: '6',
    title: 'Dune: Part Two',
    titleLower: 'dune: part two',
    language: 'English',
    rating: 5,
    snippet: 'Denis Villeneuve completes his vision with a sequel that surpasses the original in every way. Timothée Chalamet fully embraces Paul Atreides\' dark destiny, while Zendaya finally gets the screen time she deserves...',
    content: `Denis Villeneuve completes his vision with a sequel that surpasses the original in every way. Timothée Chalamet fully embraces Paul Atreides' dark destiny, while Zendaya finally gets the screen time she deserves.

Dune: Part Two is the rare sequel that delivers on every promise made by its predecessor. The scale is grander, the stakes higher, and the emotional depth more profound.

Chalamet's transformation from reluctant hero to messianic figure is captivating. Zendaya's Chani serves as the moral compass, her skepticism providing crucial counterweight to the religious fervor surrounding Paul.

The new additions - Austin Butler's unhinged Feyd-Rautha, Florence Pugh's calculating Princess Irulan, and Christopher Walken's Emperor - all make strong impressions. Butler, in particular, is magnetic in his villainy.

The sandworm riding sequences are everything fans hoped for. Hans Zimmer's score is even more immersive than the first film. The battle scenes are epic without losing the human element.

This is science fiction filmmaking at its apex - visionary, thoughtful, and utterly transporting.`,
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop',
    tags: ['Sci-Fi', 'Adventure', 'Drama'],
    releaseYear: 2024,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    createdBy: 'admin',
    commentCount: 89,
    helpfulCount: 456,
  },
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    reviewId: '1',
    text: 'Absolutely agree! Murphy deserved every award for this performance. The way he portrayed Oppenheimer\'s internal struggle was incredible.',
    isAnonymous: false,
    displayName: 'MovieFan123',
    userId: 'user1',
    createdAt: new Date('2024-01-16'),
    reported: false,
  },
  {
    id: 'c2',
    reviewId: '1',
    text: 'The Trinity test scene gave me chills. Nolan is a master of building tension.',
    isAnonymous: true,
    displayName: 'Anonymous',
    userId: 'user2',
    createdAt: new Date('2024-01-17'),
    reported: false,
  },
  {
    id: 'c3',
    reviewId: '1',
    text: 'Great review! Though I think you undersold RDJ\'s performance. He was phenomenal.',
    isAnonymous: false,
    displayName: 'Guest',
    userId: null,
    createdAt: new Date('2024-01-18'),
    reported: false,
  },
  {
    id: 'c4',
    reviewId: '2',
    text: 'Naatu Naatu winning the Oscar was one of the best moments in recent awards history!',
    isAnonymous: false,
    displayName: 'Cinephile',
    userId: 'user3',
    createdAt: new Date('2024-01-11'),
    reported: false,
  },
  {
    id: 'c5',
    reviewId: '2',
    text: 'The bromance between Ram Charan and Jr. NTR is legendary. Perfect casting!',
    isAnonymous: true,
    displayName: 'Anonymous',
    userId: null,
    createdAt: new Date('2024-01-12'),
    reported: false,
  },
];

export const languages = ['English', 'Telugu', 'Hindi', 'Kannada', 'Tamil', 'Malayalam'];
