export type Verdict = 'busted' | 'hasMerit' | 'practicalOrigin';

export type Region = 'india' | 'japan' | 'china' | 'middleEast' | 'europe' | 'americas' | 'africa';

export type Category =
  | 'numbers'
  | 'animals'
  | 'foodAndEating'
  | 'deathAndAfterlife'
  | 'marriageAndLove'
  | 'homeAndDaily'
  | 'travelAndJourney';

export interface Superstition {
  id: string;
  title: string;
  country: string;
  countryFlag: string;
  region: Region;
  category: Category;
  whatPeopleBelieve: string;
  historicalOrigin: string;
  theRealReason: string;
  verdict: Verdict;
  funFact?: string;
}

export const regionLabels: Record<Region, string> = {
  india: 'India',
  japan: 'Japan',
  china: 'China',
  middleEast: 'Middle East',
  europe: 'Europe',
  americas: 'Americas',
  africa: 'Africa',
};

export const regionEmojis: Record<Region, string> = {
  india: '🇮🇳',
  japan: '🇯🇵',
  china: '🇨🇳',
  middleEast: '🕌',
  europe: '🏰',
  americas: '🗽',
  africa: '🌍',
};

export const categoryLabels: Record<Category, string> = {
  numbers: 'Numbers',
  animals: 'Animals',
  foodAndEating: 'Food & Eating',
  deathAndAfterlife: 'Death & Afterlife',
  marriageAndLove: 'Marriage & Love',
  homeAndDaily: 'Home & Daily Life',
  travelAndJourney: 'Travel & Journey',
};

export const categoryEmojis: Record<Category, string> = {
  numbers: '🔢',
  animals: '🐾',
  foodAndEating: '🍽️',
  deathAndAfterlife: '💀',
  marriageAndLove: '💍',
  homeAndDaily: '🏠',
  travelAndJourney: '🧳',
};

export const verdictLabels: Record<Verdict, string> = {
  busted: 'BUSTED',
  hasMerit: 'HAS MERIT',
  practicalOrigin: 'PRACTICAL ORIGIN',
};

export const superstitions: Superstition[] = [
  // ============ INDIA ============
  {
    id: 'lemons-chillies-door',
    title: 'Hanging Lemons & Chillies at Doorways',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Tying seven green chillies and a lemon on a thread and hanging it at the entrance of your home or shop keeps away Alakshmi (the goddess of misfortune). If she comes, she\'ll eat the sour and spicy offering and leave satisfied without entering.',
    historicalOrigin:
      'This practice dates back centuries in Hindu tradition. Alakshmi is said to love sour and pungent things, so the offering was meant to appease her at the threshold. Shopkeepers especially adopted this to protect their businesses from "evil eye" and bad fortune.',
    theRealReason:
      'The cotton thread absorbs citric acid from the lemon and capsaicin from the chillies. Together, these act as natural insecticides and air purifiers. The acidic fumes keep flies, mosquitoes, and other pests from entering — essentially a DIY organic pest repellent that actually works.',
    verdict: 'practicalOrigin',
    funFact:
      'Some studies have shown that citric acid vapors can indeed repel certain insects. Your grandma was basically running a chemistry lab at the front door.',
  },
  {
    id: 'dont-cut-nails-night',
    title: "Don't Cut Your Nails at Night",
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Cutting your nails after sunset brings bad luck, invites evil spirits, or angers the goddess Lakshmi. Some versions say it shortens your life or brings poverty.',
    historicalOrigin:
      'This belief predates electricity in India. In ancient times, homes were lit by oil lamps that gave off dim, flickering light. Cutting nails with sharp tools in near-darkness was a genuine safety hazard.',
    theRealReason:
      'Pure safety precaution that got ritualized. Without proper lighting, you could cut yourself, and infections were a serious threat before modern medicine. The "evil spirits" angle was just the most effective way to make people follow the rule. Classic ancient parenting: "Because the demons said so."',
    verdict: 'practicalOrigin',
    funFact:
      'This superstition exists in Japan too! There, they say cutting nails at night means you won\'t be with your parents when they die. Different culture, same underlying reason — no electricity.',
  },
  {
    id: 'peepal-tree-night',
    title: "Don't Sleep Under a Peepal Tree at Night",
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Ghosts and spirits live in Peepal trees, and they come alive at night. Sleeping under one will make you possessed or sick. The tree is considered sacred but dangerous after dark.',
    historicalOrigin:
      'The Peepal tree (Ficus religiosa) has deep spiritual significance in Hinduism, Buddhism, and Jainism. Buddha attained enlightenment under one. The "ghosts at night" angle was likely added to keep people away from the trees after sunset.',
    theRealReason:
      'Basic biology. During the day, trees absorb CO₂ and release oxygen through photosynthesis. At night, this reverses — trees take in oxygen and release carbon dioxide. Peepal trees are especially large with dense canopies, creating a localized zone of higher CO₂ concentration. Sleeping there could genuinely cause breathing difficulties, headaches, or suffocation.',
    verdict: 'practicalOrigin',
    funFact:
      'The Peepal tree is one of the few trees that produces oxygen 24/7 through a process called Crassulacean Acid Metabolism (CAM) — but the CO₂ output at night still exceeds this in the immediate vicinity.',
  },
  {
    id: 'curd-sugar-before-leaving',
    title: 'Eat Curd & Sugar Before Important Events',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'foodAndEating',
    whatPeopleBelieve:
      'Before heading out for an exam, interview, or any important event, eating a spoonful of curd (yogurt) mixed with sugar brings good luck. Your mom basically won\'t let you leave without it.',
    historicalOrigin:
      'This tradition is deeply embedded in Indian culture, especially in North India. Curd is considered "sattvic" (pure) food in Ayurveda. The practice has been part of Hindu rituals for centuries, associated with prosperity and positive beginnings.',
    theRealReason:
      'Curd has a cooling effect on the body — crucial in India\'s hot climate. It prevents acidity and stomach issues caused by nervousness. Sugar provides instant glucose, giving you a quick energy boost. Together, they calm your stomach AND fuel your brain. It\'s basically ancient India\'s version of a pre-game energy shot.',
    verdict: 'practicalOrigin',
    funFact:
      'Probiotics in yogurt have been scientifically proven to reduce anxiety through the gut-brain axis. Your grandma was prescribing probiotics before science even had the word.',
  },
  {
    id: 'black-cat-india',
    title: 'Black Cat Crossing Your Path',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'animals',
    whatPeopleBelieve:
      'If a black cat crosses your path, your work will be unsuccessful. You should stop, wait for someone else to cross first, or take a different route entirely. Some people will literally turn around and go home.',
    historicalOrigin:
      'This belief likely came to India through Persian and European traders. In medieval Europe, black cats were associated with witches and the devil. The superstition merged with existing Indian beliefs about omens and traveled along trade routes.',
    theRealReason:
      'In the pre-electricity era, a dark-colored animal suddenly crossing a dimly lit road at night could startle horses and bullocks pulling carts, causing accidents. The "bad luck" was really just "you might crash." For pedestrians, a sudden dark shape darting across your path in the dark could cause you to trip and fall.',
    verdict: 'practicalOrigin',
    funFact:
      'In Japan and parts of Britain, black cats are considered GOOD luck. In ancient Egypt, all cats were sacred. So the same cat is lucky, unlucky, or divine depending on your zip code.',
  },
  {
    id: 'sweeping-after-sunset',
    title: "Don't Sweep After Sunset",
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Sweeping the house after sunset drives away Lakshmi (goddess of wealth). Your wealth will literally be swept out the door. Some families extend this to mopping too.',
    historicalOrigin:
      'This became a widespread practice in rural India where homes had earthen floors and were lit by oil lamps. The belief was codified in various regional folk traditions and connected to Lakshmi worship.',
    theRealReason:
      'Before electricity, sweeping in dim lamplight meant you couldn\'t see small valuable items on the floor — coins, jewelry, small utensils. You\'d literally sweep your wealth out the door with the dust. Also, dust clouds in a room with open oil lamps = fire hazard. The goddess angle was just better marketing.',
    verdict: 'practicalOrigin',
    funFact:
      'A similar superstition exists in China during Chinese New Year — you shouldn\'t sweep for the first few days because you\'ll sweep away good luck. Same energy, different calendar.',
  },
  {
    id: 'eclipse-food',
    title: "Don't Eat During a Solar Eclipse",
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'foodAndEating',
    whatPeopleBelieve:
      'Food prepared or consumed during a solar eclipse becomes impure and poisonous. Cooked food should be thrown away. Pregnant women especially should not eat, go outside, or use sharp objects during an eclipse.',
    historicalOrigin:
      'In Hindu mythology, the demon Rahu swallows the sun during an eclipse. Food exposed during this time is considered contaminated by his shadow. This belief led to elaborate rituals around eclipse periods, including fasting and ceremonial bathing afterward.',
    theRealReason:
      'During eclipses, UV radiation levels change, and the sudden temperature drop can accelerate bacterial growth in food left out in the open. In a pre-refrigeration era, this was a real concern. However, the pregnancy restrictions and "impurity" claims have zero scientific basis. Modern kitchens with closed containers make the food safety concern irrelevant.',
    verdict: 'hasMerit',
    funFact:
      'NASA has confirmed that there\'s nothing harmful about eating during an eclipse. The food safety concern was only relevant for uncovered food in ancient outdoor kitchens.',
  },
  {
    id: 'one-rupee-gift',
    title: 'Adding ₹1 to Gift Money',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'marriageAndLove',
    whatPeopleBelieve:
      'When giving money as a gift (weddings, festivals), you should always add ₹1 to make it 101, 501, 1001, etc. Round numbers are considered incomplete or inauspicious.',
    historicalOrigin:
      'This tradition is deeply rooted in Hindu numerology. The number 1 represents a new beginning — so 101 isn\'t "one hundred and one" but "one hundred PLUS a fresh start." It\'s also connected to the idea that the relationship is ongoing, not concluded.',
    theRealReason:
      'Practically, odd numbers couldn\'t be evenly divided, which symbolized that the gift was whole and inseparable — just like the relationship. Some historians also suggest it ensured the gift receiver remembered the exact amount (₹101 stands out more than ₹100 in memory). It\'s essentially a cultural UX feature.',
    verdict: 'hasMerit',
    funFact:
      'This tradition is so ingrained that Indian banks and gift card companies actually sell denominations ending in 1. The economy literally adapted to a superstition.',
  },
  {
    id: 'turmeric-body',
    title: 'Applying Turmeric on the Body',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'marriageAndLove',
    whatPeopleBelieve:
      'Applying turmeric paste (haldi) before weddings purifies the bride and groom, wards off evil spirits, and blesses them with a glowing complexion. The Haldi ceremony is a major pre-wedding ritual.',
    historicalOrigin:
      'Turmeric has been central to Indian culture for over 4,000 years. It\'s mentioned in ancient Ayurvedic texts as a healing agent. The wedding ritual likely started as a practical beauty and health treatment that got wrapped in ceremonial significance.',
    theRealReason:
      'Turmeric contains curcumin, a compound with scientifically proven antiseptic, antibacterial, and anti-inflammatory properties. Applying it to the skin genuinely helps heal minor blemishes, evens skin tone, and provides a natural glow. Ancient Indians were literally prescribing dermatological treatments as wedding prep.',
    verdict: 'practicalOrigin',
    funFact:
      'Curcumin is now a billion-dollar supplement industry worldwide. The West "discovered" what Indian grandmothers have known for millennia.',
  },
  {
    id: 'twitching-eye',
    title: 'Eye Twitching Predicts the Future',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'travelAndJourney',
    whatPeopleBelieve:
      'If your left eye twitches, something bad is coming. If your right eye twitches, good news is on the way. (For women, it\'s reversed in some regions.) People genuinely cancel plans over this.',
    historicalOrigin:
      'This belief appears in ancient Indian texts and is also found in Chinese and African cultures. The specific left-bad/right-good association connects to the broader Hindu concept of left being inauspicious and right being auspicious.',
    theRealReason:
      'Eye twitching (myokymia) is caused by stress, fatigue, caffeine, eye strain, or nutritional deficiencies. It\'s an involuntary muscle spasm with zero predictive powers. It\'s your body saying "get some sleep," not "cancel your meeting."',
    verdict: 'busted',
    funFact:
      'In Chinese culture, the interpretation depends on the TIME of day your eye twitches. There\'s literally a twitching timetable. Talk about overcomplicating a muscle spasm.',
  },
  {
    id: 'crow-cawing-guests',
    title: 'Crow Cawing Means Guests Are Coming',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'animals',
    whatPeopleBelieve:
      'If a crow sits on your house and caws, unexpected guests will arrive soon. In some regions, crows are believed to be messengers from ancestors or departed souls.',
    historicalOrigin:
      'Crows hold special significance in Hinduism. During Shradh (ancestor remembrance rituals), food is offered to crows as they\'re believed to carry souls of the departed. The "guests coming" belief likely evolved from observing crow behavior around human settlements.',
    theRealReason:
      'Crows are incredibly intelligent and social birds. They tend to gather and become vocal around food sources. If someone was cooking (preparing for guests) or if travelers were approaching with food supplies, crows would detect it first and start cawing. So the crows weren\'t predicting guests — they were reacting to the same stimulus before humans noticed it.',
    verdict: 'hasMerit',
    funFact:
      'Crows can recognize individual human faces and hold grudges for years. They\'re basically the elephants of the bird world.',
  },
  {
    id: 'broken-mirror-india',
    title: 'Breaking a Mirror Brings Bad Luck',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Breaking a mirror brings 7 years of bad luck. Some Indian families also believe the broken reflection fragments your soul or future.',
    historicalOrigin:
      'This superstition originated in ancient Rome, where mirrors were thought to hold pieces of the user\'s soul. Romans believed the soul renewed itself every 7 years, hence the 7-year curse. The belief traveled to India through trade and colonial contact.',
    theRealReason:
      'Mirrors were extraordinarily expensive throughout most of history — handcrafted from polished obsidian, bronze, or backed with mercury and silver. Breaking one was a genuine financial disaster for a household. The "7 years bad luck" was essentially an ancient insurance policy to make people handle mirrors carefully.',
    verdict: 'busted',
    funFact:
      'The cure for broken mirror bad luck (according to tradition) is to bury the pieces under moonlight. Which is just... a safe way to dispose of sharp glass shards where barefoot kids won\'t step on them. Even the cure is practical!',
  },

  // ============ JAPAN ============
  {
    id: 'number-4-japan',
    title: 'Number 4 Is Unlucky',
    country: 'Japan',
    countryFlag: '🇯🇵',
    region: 'japan',
    category: 'numbers',
    whatPeopleBelieve:
      'The number 4 is deeply unlucky and should be avoided. Many buildings skip the 4th floor. Hospitals skip room 4. Gifts should never come in sets of 4.',
    historicalOrigin:
      'In Japanese, the number 4 can be pronounced "shi" (四), which is a homophone for "shi" (死) meaning "death." This linguistic coincidence created one of the strongest superstitions in East Asian culture, shared with China and Korea.',
    theRealReason:
      'It\'s purely a linguistic coincidence — a homophone creating an association that doesn\'t exist in reality. The number 4 has no inherent connection to death. But the belief is so deeply embedded that it affects real estate prices (4th floor apartments are cheaper), product design, and even hospital practices.',
    verdict: 'busted',
    funFact:
      'This fear has its own name: tetraphobia. Japan uses the alternative pronunciation "yon" for 4 to avoid saying "shi." So they literally invented a workaround pronunciation for a number.',
  },
  {
    id: 'chopsticks-rice-japan',
    title: "Don't Stick Chopsticks Upright in Rice",
    country: 'Japan',
    countryFlag: '🇯🇵',
    region: 'japan',
    category: 'deathAndAfterlife',
    whatPeopleBelieve:
      'Sticking chopsticks vertically into a bowl of rice is extremely taboo. It\'s considered one of the worst things you can do at a dinner table — deeply offensive and inviting death into the home.',
    historicalOrigin:
      'This mimics the incense sticks placed upright in rice bowls at Buddhist funeral altars as offerings to the dead (called "tsukitate-bashi"). Doing it at a regular meal literally makes your dinner look like a funeral offering.',
    theRealReason:
      'This is entirely a cultural/religious taboo with no scientific basis. It\'s disrespectful because it visually references death rituals, not because anything bad will actually happen. Think of it like putting flowers on someone\'s desk in the same arrangement used for funerals — nothing supernatural, just really uncomfortable.',
    verdict: 'hasMerit',
    funFact:
      'There are actually about 25 different chopstick taboos in Japanese dining etiquette. Pointing with chopsticks, hovering them over dishes, and passing food chopstick-to-chopstick (another funeral ritual reference) are all no-gos.',
  },
  {
    id: 'sleeping-north-japan',
    title: "Don't Sleep Facing North",
    country: 'Japan',
    countryFlag: '🇯🇵',
    region: 'japan',
    category: 'deathAndAfterlife',
    whatPeopleBelieve:
      'Sleeping with your head pointing north (called "kita makura") brings bad luck or death. It\'s considered so unlucky that most Japanese people consciously avoid this sleeping position.',
    historicalOrigin:
      'In Buddhist tradition, when the historical Buddha died (entered Parinirvana), his body was laid with his head pointing north. Since then, bodies at Japanese funerals are traditionally positioned head-north. Sleeping this way = sleeping like a corpse.',
    theRealReason:
      'Purely a cultural association with death. There\'s zero scientific evidence that sleeping direction affects health or longevity. Interestingly, some Feng Shui practitioners actually recommend sleeping facing north for better rest, since it aligns with Earth\'s magnetic field. Same direction, completely opposite interpretation.',
    verdict: 'busted',
    funFact:
      'In Indian Vastu Shastra, sleeping with your head to the south is considered ideal — which means your feet point north, still aligning with the magnetic field. Ancient cultures accidentally agreed on the physics while disagreeing on the framing.',
  },
  {
    id: 'thumbs-hearse-japan',
    title: 'Hide Your Thumbs When a Hearse Passes',
    country: 'Japan',
    countryFlag: '🇯🇵',
    region: 'japan',
    category: 'deathAndAfterlife',
    whatPeopleBelieve:
      'When a funeral hearse or procession passes by, you should quickly hide your thumbs by tucking them inside your fists. If you don\'t, your parents will die early, or you won\'t be present at their deathbed.',
    historicalOrigin:
      'The Japanese word for thumb is "oya-yubi" (親指), which literally translates to "parent finger." The belief connects the physical thumb to your parents\' wellbeing. Hiding your "parent finger" protects your parents from the proximity of death.',
    theRealReason:
      'This is pure linguistic magic — the superstition exists entirely because of the word\'s etymology. Your thumb has zero metaphysical connection to your parents\' health. But it does reveal something beautiful about Japanese culture: even a reflexive gesture shows how deeply family protection is valued.',
    verdict: 'busted',
    funFact:
      'Some younger Japanese people have updated this to include ambulances too. The superstition is evolving in real-time.',
  },

  // ============ CHINA ============
  {
    id: 'number-4-china',
    title: 'Number 4 Is Deeply Unlucky',
    country: 'China',
    countryFlag: '🇨🇳',
    region: 'china',
    category: 'numbers',
    whatPeopleBelieve:
      'The number 4 is so unlucky that buildings skip the 4th, 14th, 24th, and sometimes even 40-49th floors. Phone numbers and license plates with 4 are cheaper. Addresses with 4 lower property values.',
    historicalOrigin:
      'Just like in Japanese, the Mandarin word for four ("sì" 四) sounds very similar to the word for death ("sǐ" 死). This tetraphobia is arguably even stronger in China than Japan, affecting everything from architecture to business deals.',
    theRealReason:
      'Same as Japan — a linguistic coincidence that became deeply embedded cultural practice. No number has inherent luck properties. But the economic impact is very real: apartments on the 4th floor sell for measurably less, and phone numbers without any 4s command premium prices.',
    verdict: 'busted',
    funFact:
      'The Beijing Olympics started on 08/08/2008 at exactly 8:08 PM — because 8 is the luckiest number in China (sounds like "prosperity"). They spent billions on an event timed around a homophone.',
  },
  {
    id: 'number-8-china',
    title: 'Number 8 Is Extremely Lucky',
    country: 'China',
    countryFlag: '🇨🇳',
    region: 'china',
    category: 'numbers',
    whatPeopleBelieve:
      'The number 8 brings wealth, prosperity, and good fortune. People pay massive premiums for phone numbers, license plates, and addresses with multiple 8s. Weddings are planned on dates with 8s.',
    historicalOrigin:
      'In Mandarin, eight ("bā" 八) sounds similar to "fā" (发) meaning "to generate wealth" or "to prosper." The visual symmetry of the number 8 (and the infinity symbol ∞ when rotated) also reinforces associations with endless prosperity.',
    theRealReason:
      'Another homophone-based superstition with zero scientific basis. A phone number with 8s won\'t make you richer. However, the belief is so strong that it creates real economic behavior — which is kind of fascinating from a behavioral economics perspective.',
    verdict: 'busted',
    funFact:
      'A Chinese license plate reading "8888" sold at auction for over $300,000. The superstition literally generated wealth for the seller, making it a self-fulfilling prophecy in the most ironic way possible.',
  },
  {
    id: 'dont-gift-clocks-china',
    title: "Never Gift a Clock",
    country: 'China',
    countryFlag: '🇨🇳',
    region: 'china',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Giving someone a clock as a gift is one of the biggest taboos in Chinese culture. It\'s essentially telling someone their time is running out — a death wish disguised as a present.',
    historicalOrigin:
      'The Mandarin phrase for "gifting a clock" (送钟, sòng zhōng) is a homophone for "attending a funeral" or "paying last respects" (送终, sòng zhōng). The identical pronunciation made clock-giving sound like you\'re arranging someone\'s funeral.',
    theRealReason:
      'Purely linguistic — the act of giving a clock has no connection to death. But this one is so deeply ingrained that even Chinese people who know it\'s irrational will feel uncomfortable receiving a clock as a gift. It\'s a great example of how language shapes emotional reality.',
    verdict: 'busted',
    funFact:
      'Watches are generally fine as gifts — the word for watch (手表, shǒubiǎo) doesn\'t have the same deadly homophone. So wristwatches = thoughtful gift, wall clocks = death threat. Language is wild.',
  },
  {
    id: 'red-luck-china',
    title: 'Red Brings Good Luck',
    country: 'China',
    countryFlag: '🇨🇳',
    region: 'china',
    category: 'marriageAndLove',
    whatPeopleBelieve:
      'Red is the color of luck, prosperity, and happiness. It\'s worn at weddings, used in New Year decorations (red lanterns, red envelopes with money), and dominates celebrations. White, conversely, is the color of mourning.',
    historicalOrigin:
      'Red has been auspicious in Chinese culture for thousands of years. Ancient Chinese believed red warded off evil spirits and the mythical beast Nian. The tradition of red envelopes (hongbao) dates back to the Qin Dynasty.',
    theRealReason:
      'Red is the most visible color in the spectrum and psychologically stimulates excitement and energy. The association with blood also connects it to life force across many cultures. While the "luck" aspect is cultural, the psychological impact of red (increased alertness, excitement) is scientifically documented.',
    verdict: 'hasMerit',
    funFact:
      'Digital red envelopes (through WeChat) are now bigger than physical ones in China. During Chinese New Year 2023, billions of digital hongbao were sent. Ancient superstition meets fintech.',
  },

  // ============ USA / UK / EUROPE ============
  {
    id: 'friday-13th',
    title: 'Friday the 13th Is Unlucky',
    country: 'USA / Europe',
    countryFlag: '🇺🇸',
    region: 'europe',
    category: 'numbers',
    whatPeopleBelieve:
      'Friday the 13th is the unluckiest day of the year. Bad things happen. Don\'t start anything new, don\'t travel, maybe just stay in bed. Some people have a genuine phobia of it (paraskevidekatriaphobia — try saying that three times).',
    historicalOrigin:
      'Two separate superstitions merged: Friday was considered unlucky (Jesus was crucified on a Friday) and 13 was unlucky (13 guests at the Last Supper, with Judas being the 13th). The combined "Friday the 13th" fear was turbocharged by the arrest of the Knights Templar on Friday, October 13, 1307.',
    theRealReason:
      'Statistical analysis shows no increase in accidents, deaths, or misfortunes on Friday the 13th compared to any other day. The Stress Management Center and Phobia Institute estimated that $800-900 million is lost in business every Friday the 13th because people refuse to fly, make deals, or even go to work. The superstition itself causes more damage than any "bad luck."',
    verdict: 'busted',
    funFact:
      'In Italy, Friday the 17th is the unlucky day instead. In Spain, it\'s Tuesday the 13th. The "unlucky" day can\'t even agree on a schedule.',
  },
  {
    id: 'walking-under-ladder',
    title: "Don't Walk Under a Ladder",
    country: 'UK',
    countryFlag: '🇬🇧',
    region: 'europe',
    category: 'travelAndJourney',
    whatPeopleBelieve:
      'Walking under a ladder propped against a wall brings terrible bad luck. You must go around it, no matter how inconvenient. If you accidentally walk under one, you should cross your fingers until you see a dog.',
    historicalOrigin:
      'A ladder against a wall forms a triangle, and in medieval Christian Europe, the triangle was a sacred symbol of the Holy Trinity. Walking through it was considered blasphemous. Earlier, in ancient Egypt, ladders were placed in tombs to help souls ascend to heaven — disturbing them was taboo.',
    theRealReason:
      'Someone is working above you on that ladder. Walking underneath risks having tools, paint, or debris dropped on your head. It\'s genuinely dangerous. This is one of those rare superstitions where the practical reason is so obvious it\'s almost funny that we needed a supernatural explanation.',
    verdict: 'practicalOrigin',
    funFact:
      'Construction safety guidelines to this day say "never walk under a ladder." OSHA basically codified a superstition into law.',
  },
  {
    id: 'umbrella-indoors',
    title: "Don't Open an Umbrella Indoors",
    country: 'UK',
    countryFlag: '🇬🇧',
    region: 'europe',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Opening an umbrella inside your house brings bad luck. Some versions say it insults the sun god, others say it angers the spirits who protect your home from bad weather.',
    historicalOrigin:
      'The most likely origin is Victorian-era England, when umbrellas had stiff metal spokes and spring-loaded mechanisms. They were large, clunky, and genuinely dangerous to open in enclosed spaces.',
    theRealReason:
      'Early metal-spoked umbrellas could easily poke someone\'s eye out, knock over furniture, or break things when opened suddenly indoors. It was a legitimate safety hazard that became wrapped in superstition because "you\'ll break stuff" was less memorable than "you\'ll anger the gods."',
    verdict: 'practicalOrigin',
    funFact:
      'Ancient Egyptian parasols were symbols of nobility and shade from the gods. Opening one indoors, away from the sun, was seen as disrespecting the sun god Ra. The superstition is older than umbrellas themselves.',
  },
  {
    id: 'knock-on-wood',
    title: 'Knock on Wood',
    country: 'USA / UK',
    countryFlag: '🇺🇸',
    region: 'europe',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'After saying something optimistic or tempting fate ("I\'ve never been in an accident"), you should immediately knock on wood to prevent jinxing yourself. If no wood is available, some people knock on their own head.',
    historicalOrigin:
      'Multiple possible origins: (1) Pagan belief that spirits lived in trees, and knocking invoked their protection. (2) Christians touching wooden crucifixes for divine protection. (3) A 19th-century British children\'s game called "Tiggy Touchwood" where touching wood made you safe from being tagged.',
    theRealReason:
      'Pure superstition with zero causal mechanism. However, a 2013 study at the University of Chicago found that physical actions like knocking on wood actually DO reduce people\'s anxiety about jinxing themselves. The ritual works — not by changing luck, but by changing your psychological state.',
    verdict: 'hasMerit',
    funFact:
      'The German version is "toi, toi, toi" (spitting three times over your left shoulder). Different cultures, same anxiety about tempting fate.',
  },
  {
    id: 'breaking-mirror',
    title: 'Breaking a Mirror = 7 Years Bad Luck',
    country: 'USA / UK',
    countryFlag: '🇺🇸',
    region: 'europe',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'If you break a mirror, you\'re cursed with 7 years of bad luck. Some traditions say you can break the curse by burying the pieces under moonlight or by spinning around three times counterclockwise.',
    historicalOrigin:
      'Ancient Romans believed mirrors reflected your soul. Breaking one meant damaging your soul. They also believed the soul regenerated every 7 years — hence the specific 7-year timeline. Before Romans, ancient Greeks used mirrors for divination (catoptromancy), making them sacred objects.',
    theRealReason:
      'Mirrors were insanely expensive for most of human history — early ones were polished bronze or obsidian, later ones used mercury and silver backing. Breaking one was a genuine financial catastrophe. The "7 years bad luck" was the ancient equivalent of "be careful with expensive things or you\'ll regret it." The moonlight burial cure? That\'s just safe glass disposal where kids won\'t find it.',
    verdict: 'busted',
    funFact:
      'The reason we say 7 years specifically is probably because of the Roman belief that life renews every 7 years. Modern cell biology shows most cells DO replace themselves every 7-10 years. The Romans weren\'t entirely wrong about the biology — just about the mirror part.',
  },

  // ============ LATIN AMERICA ============
  {
    id: 'mal-de-ojo',
    title: 'Mal de Ojo (Evil Eye)',
    country: 'Mexico / Latin America',
    countryFlag: '🇲🇽',
    region: 'americas',
    category: 'marriageAndLove',
    whatPeopleBelieve:
      'Someone can cause illness (especially in children) just by looking at them with envy or excessive admiration. Symptoms include crying, fever, and restlessness. Red bracelets or "ojo" amulets protect against it.',
    historicalOrigin:
      'The evil eye concept exists across dozens of cultures — from ancient Mesopotamia to modern Latin America, Middle East, and South Asia. In Latin America, it blended with indigenous beliefs and Catholic traditions, creating a unique syncretic practice. Curanderos (folk healers) specialize in treating it.',
    theRealReason:
      'There\'s no scientific evidence that envious looks can cause illness. However, the stress of constant social scrutiny (especially for new parents in tight-knit communities) is real and can manifest as anxiety. The "cure" rituals often involve calming techniques, massage, and herbal remedies that genuinely help soothe a fussy baby.',
    verdict: 'hasMerit',
    funFact:
      'The evil eye concept appears in the Bible, the Quran, and ancient Greek texts. It might be the single most widespread superstition in human history, spanning 5,000+ years and dozens of cultures.',
  },
  {
    id: '12-grapes-midnight',
    title: '12 Grapes at Midnight on New Year\'s',
    country: 'Spain / Latin America',
    countryFlag: '🇪🇸',
    region: 'americas',
    category: 'foodAndEating',
    whatPeopleBelieve:
      'At midnight on New Year\'s Eve, you must eat exactly 12 grapes — one for each bell chime — for 12 months of good luck. If you finish all 12 in time, the new year will be prosperous. If you choke or fail, bad luck awaits.',
    historicalOrigin:
      'This tradition started in Spain in 1895 when grape growers in Alicante had a massive surplus and needed a creative way to sell them. They marketed the grapes as a New Year\'s luck tradition, and it stuck. Yes — one of the most beloved cultural traditions in the Spanish-speaking world was literally invented by a marketing department.',
    theRealReason:
      'Grapes have no luck-granting properties. But the tradition IS fun, creates a shared cultural moment, and grapes are actually a pretty healthy midnight snack. Also, trying to eat 12 grapes in 12 seconds is genuinely hilarious to watch. Entertainment value: high. Supernatural value: zero.',
    verdict: 'busted',
    funFact:
      'An estimated 700 million grapes are consumed in Spain alone every New Year\'s Eve. Choking on grapes during the countdown is common enough that Spanish emergency rooms prepare for it. The luckiest tradition has its own injury statistics.',
  },

  // ============ MIDDLE EAST ============
  {
    id: 'nazar-evil-eye',
    title: 'Nazar (Evil Eye Amulet)',
    country: 'Turkey / Middle East',
    countryFlag: '🇹🇷',
    region: 'middleEast',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'The blue glass eye (nazar boncuğu) protects against the evil eye — envious or malicious stares that can cause harm, illness, or bad luck. You\'ll find them hanging in homes, cars, offices, and even on airplanes.',
    historicalOrigin:
      'The concept dates back to ancient Mesopotamia and Egypt (3300 BC). The blue glass amulet specifically became popular in the Ottoman Empire. Blue was chosen because it was believed to reflect the evil gaze back to the sender. The tradition spread throughout the Mediterranean, Middle East, and South Asia.',
    theRealReason:
      'No glass eye can deflect envy or negative energy. However, the practice serves a genuine psychological purpose: it gives people a sense of control over unpredictable misfortune. Studies show that belief in protective amulets can reduce anxiety, which in turn improves decision-making and health outcomes. The placebo effect is real.',
    verdict: 'hasMerit',
    funFact:
      'Turkish Airlines has a nazar on every plane. The Istanbul Grand Bazaar sells over 1 million nazar amulets per year. It\'s probably the world\'s most commercially successful superstition.',
  },
  {
    id: 'right-hand-eating',
    title: 'Always Eat with Your Right Hand',
    country: 'Middle East / South Asia',
    countryFlag: '🕌',
    region: 'middleEast',
    category: 'foodAndEating',
    whatPeopleBelieve:
      'Eating with the left hand is considered extremely disrespectful and impure. Food must be passed, received, and eaten with the right hand only. Using your left hand at the dinner table is a serious social offense.',
    historicalOrigin:
      'In many Middle Eastern and South Asian cultures, the left hand was historically used for personal hygiene (cleaning after using the toilet) due to the absence of toilet paper. The right hand was kept clean for eating and social interactions. Religious texts in Islam also emphasize right-hand use.',
    theRealReason:
      'Before modern plumbing and sanitization, this was a critical hygiene practice. Designating one hand for hygiene and the other for eating prevented the spread of disease. It was essentially an ancient public health protocol. With modern soap and sanitation, the practical need has diminished, but the cultural practice remains strong.',
    verdict: 'practicalOrigin',
    funFact:
      'About 10% of the world\'s population is left-handed. In cultures with this tradition, left-handed children were (and sometimes still are) trained to eat with their right hand. It\'s one of the few superstitions that literally changes your dominant hand.',
  },

  // ============ AFRICA ============
  {
    id: 'owl-death-omen',
    title: 'Owl Sightings Mean Death Is Near',
    country: 'Various African Countries',
    countryFlag: '🌍',
    region: 'africa',
    category: 'animals',
    whatPeopleBelieve:
      'Seeing or hearing an owl — especially near your home at night — is an omen of death or serious misfortune. Owls are associated with witchcraft, sorcery, and dark spirits across many African cultures.',
    historicalOrigin:
      'This belief spans numerous African cultures from the Zulu to the Kikuyu to West African traditions. Owls are nocturnal, silent predators with an eerie call and the ability to rotate their heads 270 degrees — traits that understandably unnerved ancient observers. Many cultures associated them with witches\' familiars or shapeshifted sorcerers.',
    theRealReason:
      'Owls are attracted to areas with high rodent populations. Rodents are attracted to areas with poor sanitation. Poor sanitation leads to disease. So owls appearing near homes could actually correlate with conditions that led to illness and death — not because the owls caused it, but because they were attracted to the same environments. Correlation masquerading as causation, basically.',
    verdict: 'hasMerit',
    funFact:
      'In ancient Greece, owls were symbols of wisdom and sacred to Athena. In India, the owl (ullu) is the vehicle of Lakshmi, goddess of wealth. Same bird, wildly different PR across cultures.',
  },
  {
    id: 'stepping-over-person',
    title: "Don't Step Over Someone Lying Down",
    country: 'Various African Countries',
    countryFlag: '🌍',
    region: 'africa',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Stepping over someone who is lying or sitting on the ground will stunt their growth. The only way to reverse it is for the person who stepped over them to step back over in the opposite direction.',
    historicalOrigin:
      'This belief is widespread across West African and Southern African cultures. It reflects a broader worldview where physical proximity and bodily interactions carry spiritual weight. The "reversal" mechanism suggests a belief in balance and correctable actions.',
    theRealReason:
      'No amount of stepping over someone affects their growth. However, the superstition encourages basic respect for personal space and physical safety — stepping over a lying person is genuinely risky (you could trip and fall on them, kick them, or step on them). The "stunted growth" fear made children and adults alike more careful about personal boundaries.',
    verdict: 'practicalOrigin',
    funFact:
      'This superstition also exists in parts of India, the Caribbean, and among some Roma communities in Europe — likely traveling along historical migration and trade routes. It\'s a superstition with a passport.',
  },
];

export function getSuperstitionById(id: string): Superstition | undefined {
  return superstitions.find((s) => s.id === id);
}

export function getSuperstitionsByRegion(region: Region): Superstition[] {
  return superstitions.filter((s) => s.region === region);
}

export function getSuperstitionsByCategory(category: Category): Superstition[] {
  return superstitions.filter((s) => s.category === category);
}

export function searchSuperstitions(query: string): Superstition[] {
  const q = query.toLowerCase();
  return superstitions.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q) ||
      s.whatPeopleBelieve.toLowerCase().includes(q) ||
      s.theRealReason.toLowerCase().includes(q) ||
      s.historicalOrigin.toLowerCase().includes(q)
  );
}
