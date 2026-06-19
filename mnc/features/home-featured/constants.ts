// const heroSlides = [
//   'https://images.pexels.com/photos/28712146/pexels-photo-28712146.jpeg',
//   'https://images.pexels.com/photos/36930062/pexels-photo-36930062.jpeg',
//   'https://images.pexels.com/photos/30217970/pexels-photo-30217970.jpeg',
//   // 'https://www.pexels.com/download/video/35771140/'
// ];

import { type FeaturedItem } from "./types";

export const HOME_FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: '1',
    title: 'Home Featured 1',
    description: 'Home Featured 1 description Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
    type: 'IMAGE',
    image: 'https://images.pexels.com/photos/28712146/pexels-photo-28712146.jpeg'
  },
  {
    id: '2',
    title: 'Home Featured 2',
    description: 'Home Featured 2 description Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
    type: 'IMAGE',
    logo: 'https://images.pexels.com/photos/33645968/pexels-photo-33645968.jpeg',
    image: 'https://images.pexels.com/photos/36930062/pexels-photo-36930062.jpeg'
  },
  {
    id: '3',
    title: 'Home Featured 2',
    description: 'Home Featured 2 description Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
    type: 'VIDEO',
    logo: 'https://images.pexels.com/photos/33645968/pexels-photo-33645968.jpeg',
    image: 'https://www.pexels.com/download/video/35771140/',
    link: 'https://www.google.com',
    linkText: 'Trade Now',
  },
  {
    id: '4',
    title: 'Building a Cleaner City',
    description: 'Join our community initiatives to keep Raipur green and sustainable for everyone.',
    type: 'TEXT',
    logo: 'https://images.pexels.com/photos/33645968/pexels-photo-33645968.jpeg',
    image: 'https://images.pexels.com/photos/30217970/pexels-photo-30217970.jpeg',
    link: 'https://www.google.com',
    linkText: 'Read More',
  }
];