// Everything personal lives in this file.
// Change the words here (or swap photos in assets/img/) and the whole site follows.

export const config = {
  name: 'Paul',
  nickname: 'Baami',      // what I call him most
  nickname2: 'Oga mi',    // the other one
  from: 'Perey',
  birthday: '5 November',
  birthdayShort: '05 · 11',
  year: '2026',

  song: {
    src: 'assets/audio/song.mp3',
    credit: '“Oluwa Ku’se” · Psalmos',
  },

  // The opening title card. Perey's own words.
  intro: ['Not every brother shares your blood.', 'Some are found along the way.'],

  // Every photo, by key. HTML elements ask for one with data-photo="key".
  // `caption` shows in the full-screen viewer. Captions never claim who else is in a picture.
  photos: {
    'grey-kaftan': { src: 'assets/img/grey-kaftan.jpg', alt: 'Paul in a grey kaftan and clear glasses, standing in warm afternoon sun', caption: 'The man of the day' },
    'grey-phone': { src: 'assets/img/grey-phone.jpg', alt: 'Paul in a grey kaftan, looking down at his phone', caption: 'Always reading something' },
    'white-tee': { src: 'assets/img/white-tee.jpg', alt: 'Paul in a white T-shirt, standing outside a building', caption: 'Easy, as always' },
    'bench-tall': { src: 'assets/img/bench-tall.jpg', alt: 'Paul sitting on a bench beside a home-made barbell', caption: 'Strength is built in plain places' },
    'bench-seated': { src: 'assets/img/bench-seated.jpg', alt: 'Paul seated on a wooden bench, hands clasped, smiling', caption: 'Sit down, let’s talk' },
    'shades-pose': { src: 'assets/img/shades-pose.jpg', alt: 'Paul in sunglasses and a dark T-shirt, one hand in his pocket', caption: 'Confidence, quietly' },
    'arms-crossed': { src: 'assets/img/arms-crossed.jpg', alt: 'Paul in sunglasses with his arms crossed', caption: 'Steady' },
    'cap-boots': { src: 'assets/img/cap-boots.jpg', alt: 'Paul in a black cap, black T-shirt and boots', caption: 'Discipline' },
    'training-gloves': { src: 'assets/img/training-gloves.jpg', alt: 'Paul in a striped vest and work gloves on a dirt track', caption: 'The work nobody claps for' },
    'thumbs-up': { src: 'assets/img/thumbs-up.jpg', alt: 'Paul in sunglasses, smiling and giving two thumbs up', caption: 'Here’s to another year' },
    'three-brothers': { src: 'assets/img/three-brothers.jpg', alt: 'Paul in a camo-print shirt, standing between two friends', caption: 'Among brothers' },
    'selfie-duo': { src: 'assets/img/selfie-duo.jpg', alt: 'A selfie of two young men outside a house', caption: 'Same ground, same sun' },
    'cadets': { src: 'assets/img/cadets.jpg', alt: 'Paul smiling wide among a group of young cadets in uniform', caption: 'That smile' },
    'wedding-white': { src: 'assets/img/wedding-white.jpg', alt: 'Paul in a white tuxedo jacket with his bride on their wedding day', caption: 'Husband' },
    'wedding-traditional': { src: 'assets/img/wedding-traditional.jpg', alt: 'Paul in green traditional attire with his bride', caption: 'Tradition, honoured' },
    'wedding-registry': { src: 'assets/img/wedding-registry.jpg', alt: 'Paul with his bride at the marriage registry', caption: 'At the registry' },
    'family-group': { src: 'assets/img/family-group.jpg', alt: 'Paul in a white kaftan with three women outside a house', caption: 'Family' },
    'home-elder': { src: 'assets/img/home-elder.jpg', alt: 'Paul with his arm around an older woman', caption: 'Home' },
  },

  // Act II: the words that sum him up. Each one gets its own photo.
  qualities: [
    { word: 'Maturity', line: 'He’s further down the road of life than I am, and it shows in how he thinks.', photo: 'grey-phone' },
    { word: 'Responsibility', line: 'Soldier, husband, student. He shows up for all of it.', photo: 'bench-tall' },
    { word: 'Respect', line: 'He gives it as easily as he earns it.', photo: 'white-tee' },
    { word: 'Dedication', line: 'He reads. He studies. He doesn’t cut corners.', photo: 'training-gloves' },
    { word: 'Openness', line: 'Age has never been a wall with him.', photo: 'bench-seated' },
  ],

  // Act III: the horizontal reel. `text` frames and `photo` frames alternate.
  reel: [
    { kind: 'text', kicker: 'Where it started', title: 'Same department. Same level.', body: 'We met the way course mates meet: the same classes, the same lecture halls, the same deadlines.' },
    { kind: 'photo', photo: 'three-brothers' },
    { kind: 'text', kicker: 'The difference', title: 'He’s older. You’d never know it.', body: 'Not from the way he talks to me. Not from the way he treats me. Age just never turned into distance.' },
    { kind: 'photo', photo: 'selfie-duo' },
    { kind: 'text', kicker: 'The thing I notice most', title: 'He asks what I think.', body: 'And then he actually listens. Like we’re age mates. Like my opinion counts. That means more than he knows.' },
    { kind: 'photo', photo: 'cadets' },
    { kind: 'text', kicker: 'And then', title: 'No ceremony. Just time.', body: 'Nobody announced it. Somewhere along the way, the course mate became a brother.', big: true },
  ],

  // Act IV: the ordinary moments. Only things Perey told me actually happen.
  moments: [
    { line: 'We read.', photo: 'grey-phone' },
    { line: 'We study.', photo: 'white-tee' },
    { line: 'We talk.', photo: 'selfie-duo' },
    { line: 'We sit.', photo: 'bench-seated' },
    { line: 'Sometimes I just come by.', photo: 'bench-tall' },
  ],

  // Act VI: the letter, in Perey's voice. One string per paragraph.
  letter: [
    'Baami,',
    'I’ve been trying to work out when exactly it happened. When you stopped being the older guy from my department and became my brother. I can’t find the day. I think that’s the point. It happened slowly, one ordinary afternoon at a time.',
    'On paper we’re just course mates. Same department, same level, same lectures. But you never treated me like just a course mate. You’re older than me. You wear a uniform, you have a wife and a home, and you carry responsibilities I’m still years away from. Somehow none of that ever turned into distance. You talk to me like an equal. You ask what I think, and you actually listen. I don’t take that lightly.',
    'I value the time we spend together more than I usually say. Reading, studying, sitting and talking about everything and nothing. The days I come by your place and we just sit. Those are some of my favourite parts of university, and honestly, some of my favourite parts of life right now.',
    'So on your birthday I just want you to know this: I respect you, and I’m grateful. Grateful that life put you in my department, and grateful that you let a course mate become your younger brother.',
    'I wish you good health, peace of mind, and strength for everything you carry. I pray that every responsibility ahead of you, at work, at home and in school, turns into fulfilment. May this new year of your life be your best one yet.',
    'Happy birthday, Oga mi.',
  ],

  // Act VII: ten wishes. `word` is the front of the card, `text` the back.
  wishes: [
    { word: 'Health', text: 'Good health in every season of the year.' },
    { word: 'Peace', text: 'Peace of mind that nothing can shake.' },
    { word: 'Wisdom', text: 'Wisdom for every decision, big and small.' },
    { word: 'Growth', text: 'Growth you can feel, in every part of your life.' },
    { word: 'Studies', text: 'A smooth road through school, all the way to graduation.' },
    { word: 'Service', text: 'Fulfilment and honour in your work.' },
    { word: 'Home', text: 'Joy, laughter and peace in your home.' },
    { word: 'Protection', text: 'Strength and protection wherever duty takes you.' },
    { word: 'Doors', text: 'New doors, and the courage to walk through them.' },
    { word: 'Reward', text: 'A year that pays you back for everything you put in.' },
  ],

  // Act VIII: end credits. [role, name]
  credits: [
    ['A film for', 'Paul'],
    ['Also known as', 'Baami · Oga mi'],
    ['Starring', 'Paul, as himself'],
    ['Written & built by', 'His younger brother, Perey'],
    ['Music', '“Oluwa Ku’se” · Psalmos'],
    ['Filmed on', 'Ordinary days'],
  ],
};
