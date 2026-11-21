import { Chapter } from '../types';

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'ch-01',
    order_index: 1,
    title: 'The Beginning',
    subtitle: 'The moment my world quietly changed forever',
    description: 'Out of all the ordinary days in a crowded world, that one moment quietly rewrote my entire story. Before all the late-night conversations, the laughter, and the comfort we found in each other, there was just you—walking into my life and making everything feel brighter, calmer, and infinitely more meaningful.',
    cover_image: '/page_1_video.mp4',
    media_type: 'video',
    video_url: '/page_1_video.mp4',
    quote: '"Meeting you was not just a chapter in my life; it was the moment the real story truly began."',
    personal_note: 'Pratiksha, looking back at where we started, I realize that having you in my life is the greatest gift. You turned simple everyday seconds into memories I want to hold on to for a thousand years. Thank you for being you.',
    is_enabled: true,
    unlocks_chat: false
  },
  {
    id: 'ch-02',
    order_index: 2,
    title: 'With You, I Am Real',
    subtitle: 'The one place I never have to wear a mask',
    description: 'In front of the whole world, I always feel like I have to wear a mask—to be guarded, composed, and play the role everyone expects. But the moment you are around me, all of that disappears. You understand me in ways nobody else ever has, without me even having to explain. With you, I never have to pretend; I can just take off the armor and be truly, completely myself.',
    cover_image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    quote: '"To be seen and understood by someone, and loved for exactly who you are—that is the purest comfort in the world."',
    personal_note: 'Pratiksha, I love simply having you around me. With everyone else, there is a mask, but with you, my heart is completely at peace. Thank you for being my safe haven and loving the real me.',
    is_enabled: true,
    unlocks_chat: false
  },
  {
    id: 'ch-03',
    order_index: 3,
    title: 'Little Moments',
    subtitle: 'The memories that matter most',
    description: 'Not just the grand celebrations, but the quiet laughter, the shared songs, the silly arguments, and the comfort of just being together.',
    cover_image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    quote: '"It is the smallest moments that take up the most room in our hearts."',
    personal_note: 'Every time we laughed till our stomachs hurt, every quiet glance across the room—those are the memories carved deepest into my heart.',
    is_enabled: true,
    unlocks_chat: false
  },
  {
    id: 'ch-04',
    order_index: 4,
    title: 'Things I Never Said',
    subtitle: 'The truths between the lines',
    description: 'Sometimes the deepest feelings are the hardest to put into everyday words. Here is what I always carried in my heart.',
    cover_image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    quote: '"You showed me what it feels like to truly be understood without having to explain myself."',
    personal_note: 'You inspire me in ways you do not even realize. Your strength, your kindness, and the way you care make me want to be better every single day.',
    is_enabled: true,
    unlocks_chat: true // Milestone: Unlocks the private real-time two-way chat!
  },
  {
    id: 'ch-05',
    order_index: 5,
    title: 'Things Left Unsaid',
    subtitle: 'Promises for the future',
    description: 'No matter how much time passes, where life leads us, or what challenges arrive, some promises remain unbroken.',
    cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    quote: '"I have loved you for a thousand years, and I will love you for a thousand more."',
    personal_note: 'I promise to always celebrate your victories, hold your hand through the hard days, and remind you how extraordinary you are.',
    is_enabled: true,
    unlocks_chat: false
  },
  {
    id: 'ch-06',
    order_index: 6,
    title: 'The Birthday Surprise',
    subtitle: 'Celebrating the gift of you',
    description: 'Today is your day. The universe was made infinitely brighter the day you entered it.',
    cover_image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    quote: '"Count your life by smiles, not tears. Count your age by friends, not years."',
    personal_note: 'Happy Birthday, Pratiksha! May your candles burn bright and every secret wish you make come true.',
    is_enabled: true,
    unlocks_chat: false
  },
  {
    id: 'ch-07',
    order_index: 7,
    title: 'One Last Note',
    subtitle: 'A sealed letter to carry with you',
    description: 'As this digital story reaches its final page, remember that our real story is still being written, day by day, moment by moment.',
    cover_image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    quote: '"Wherever you go, go with all your heart."',
    personal_note: 'Thank you for being you, Pratiksha. Forever your biggest cheerleader, your friend, and someone who loves you beyond words.',
    is_enabled: true,
    unlocks_chat: false
  }
];
