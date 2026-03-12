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
  modernTwist: string;
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
    modernTwist:
      'Walk through any Indian market in 2026 and you\'ll still see these hanging everywhere — right next to the CCTV cameras and digital payment QR codes. The "organic pest control" influencer crowd has actually started promoting lemon-chilli strings as eco-friendly alternatives to chemical repellents. Your grandma was doing sustainable living before it had a hashtag.',
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
    modernTwist:
      'You have LED lights, nail clippers with precision edges, and Band-Aids in the drawer. The original reason is completely irrelevant now. Yet millions of people still won\'t do it — and if you do, your mom WILL call you to ask why things went wrong this week. The superstition has outlived its purpose by about 150 years.',
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
    modernTwist:
      'Nobody\'s sleeping under trees in 2026 — we have apartments with AC. But the Peepal tree has found a new life in the urban environmentalism movement. Cities are planting them specifically because they produce so much oxygen during the day. The "haunted tree" is now a "climate hero." Same tree, very different Instagram caption.',
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
    modernTwist:
      'Gut health and probiotics are a multi-billion dollar wellness industry now. People pay ₹500 for a fancy kombucha that does what a ₹10 bowl of dahi does. The "curd before exams" ritual was biohacking before Silicon Valley invented the word. Your Indian mom was basically a gut health influencer without the ring light.',
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
    modernTwist:
      'People in cars on well-lit highways still stop when a black cat crosses. Uber drivers have been known to take detours. Meanwhile, black cats are the least adopted cats in shelters worldwide — partly because of this superstition. The irony: the cats are getting the bad luck, not you.',
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
    modernTwist:
      'Robot vacuums run at 2 AM and nobody panics about Lakshmi leaving. But bring out a jhadoo after 7 PM at your grandma\'s house and watch the chaos unfold. The Roomba has accidentally become the loophole — it\'s not YOU sweeping, it\'s the robot. Superstition hack: blame the technology.',
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
    modernTwist:
      'During the 2024 solar eclipse, WhatsApp groups exploded with warnings about not eating. Pregnant women were told to stay indoors. Meanwhile, NASA live-streamed the whole thing and scientists ate lunch while watching. Eclipse tourism is now a billion-dollar industry — people fly across the world to see them. We went from "hide from the demon" to "book a flight to see it" in one generation.',
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
    modernTwist:
      'Digital payment apps like GPay and PhonePe now have pre-set buttons for ₹101, ₹501, ₹1001. The superstition is literally baked into fintech UX design. Even when we went cashless, the extra ₹1 survived the transition. That\'s one resilient rupee.',
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
    modernTwist:
      'Turmeric lattes are a $3 billion global industry. Sephora sells turmeric face masks for $40. Gwyneth Paltrow\'s Goop recommends it. The haldi ceremony went from "weird Indian ritual" to "luxury wellness experience" — except your nani did it for free with actual turmeric, not a branded version with 15 ingredients you can\'t pronounce.',
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
    modernTwist:
      'Screen time has made eye twitching way more common — we\'re all staring at phones 8+ hours a day. So ironically, in 2026, an eye twitch IS an omen... of too much doom scrolling. If your eye twitches, the universe isn\'t sending a message. Your screen time report is.',
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
    modernTwist:
      'Crows in urban India have adapted to city life — they hang around chai stalls and street food vendors. In some cities, crow populations are actually declining because of changing food habits and sealed garbage bins. Your guest-predicting alarm system is slowly going offline. Good thing we have phones now.',
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
    modernTwist:
      'A basic mirror costs ₹200 at any store now. Breaking one is a minor inconvenience, not a financial catastrophe. But the superstition persists — people still feel that gut punch of dread when a mirror shatters. Our brains haven\'t caught up with our economics. Also, selfie cameras basically made physical mirrors optional anyway.',
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
    modernTwist:
      'In 2026, you can literally get a 4th-floor apartment in Tokyo for cheaper because of this. Smart expats specifically request floor 4 for the discount. Tech companies designing products for the Japanese market still avoid the number 4 in model names, pricing, and packaging. A linguistic coincidence from centuries ago is still shaping UX design.',
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
    modernTwist:
      'This is one tourists still mess up constantly. TikTok is full of "things NOT to do in Japan" videos featuring this. Ramen shops in tourist areas have even started putting little signs on tables about chopstick etiquette. The superstition has evolved into a cultural literacy test — if you know about it, you get respect points.',
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
    modernTwist:
      'Japanese real estate apps actually show compass orientation for bedrooms so buyers can verify they won\'t be sleeping north. Airbnb hosts in Japan sometimes mention bed direction in listings. Sleep tracking apps and biohackers have tried to prove sleeping direction matters — the data says it doesn\'t. But the listings keep mentioning it anyway.',
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
    modernTwist:
      'Younger Japanese people have extended this to ambulances and even hospital zones. Some do it ironically, some genuinely. It\'s become a meme on Japanese Twitter — people posting about instinctively hiding their thumbs and then questioning their own rationality. The superstition went from sincere belief to ironic self-aware habit, which might be the most modern thing ever.',
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
    modernTwist:
      'Some Chinese skyscrapers go from floor 3 to floor 5, 13 to 15, and skip everything in the 40s. A 50-story building might only have 36 actual floors. Real estate developers, phone companies, and even car manufacturers design around this belief. In 2026, the number 4 costs actual money to avoid.',
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
    modernTwist:
      'Crypto wallet addresses with 8s sell for premiums. Startup founders time product launches on dates with 8s. The belief has migrated seamlessly from the physical to the digital world — your WeChat lucky money amount, your Douyin follower milestones, even NFT pricing. The number 8 went from analog superstition to digital flex.',
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
    modernTwist:
      'Smartwatches created an interesting loophole — an Apple Watch is technically a "watch" (acceptable) not a "clock" (death wish). But some older relatives still side-eye it. Gift registry apps for Chinese weddings now flag clock-related items automatically. Technology is literally coding around a superstition.',
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
    modernTwist:
      'WeChat\'s digital red envelopes (hongbao) moved the tradition into the 21st century — billions are sent every Chinese New Year. Brands design their entire Chinese market packaging in red. Even Western luxury brands like Gucci and Louis Vuitton release red collections specifically for Chinese New Year. An ancient superstition now drives global marketing strategy.',
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
    modernTwist:
      'Airlines offer cheaper flights on Friday the 13th because of lower demand — savvy travelers specifically book these dates. Taylor Swift has called 13 her lucky number, single-handedly trying to rebrand it for an entire generation. Horror movies still drop on Friday the 13th for marketing. The superstition is now a business opportunity.',
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
    modernTwist:
      'This one actually aged well. OSHA workplace safety regulations literally say don\'t walk under ladders. It went from folk superstition to federal law. Construction sites worldwide enforce this. Sometimes the ancient wisdom is just... correct. No supernatural explanation needed, but it took us thousands of years to admit that.',
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
    modernTwist:
      'Modern umbrellas are compact and light — you could safely open one in a closet. The practical danger is gone. But people still flinch when someone opens an umbrella indoors. It\'s now more of a social etiquette thing than a superstition — like putting your elbows on the table. The fear became a norm became a habit.',
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
    modernTwist:
      'People type "knock on wood" in Slack, Teams, and WhatsApp messages. We digitized a pagan tree ritual into a text abbreviation. Some people even tap their phone screen or desk when they say it. The gesture has completely detached from actual wood — it\'s now a pure anxiety management ritual that we perform on plastic, glass, and aluminum surfaces.',
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
    modernTwist:
      'You can buy a full-length mirror for $15 at IKEA. The financial catastrophe argument is dead. But breaking a mirror still triggers a visceral "oh no" reaction in most people — even those who don\'t believe in superstitions. It\'s hardwired into our cultural DNA at this point. Also, the front camera on your phone is technically a mirror. Has anyone calculated the bad luck from cracked phone screens?',
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
    modernTwist:
      'Instagram and social media IS the modern evil eye — we literally broadcast our lives for people to look at with envy. The 🧿 nazar emoji is one of the most-used emojis globally. People put it in their bios, captions, and stories. "Protecting my energy" is the Gen-Z version of warding off mal de ojo. The concept survived by perfectly adapting to the attention economy.',
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
    modernTwist:
      'TikTok and Instagram Reels have turned this into a viral challenge every December 31st. Spanish grocery stores now sell pre-packaged "12 lucky grapes" kits — peeled, seedless, perfectly sized. A marketing gimmick from 1895 is still generating content and revenue 130 years later. That Alicante grape farmer was the original growth hacker.',
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
    modernTwist:
      'The nazar has become a global fashion accessory — you\'ll see it on Zara jewelry, Urban Outfitters home decor, and high-fashion runway shows. Turkish Airlines puts one on every plane. It\'s on phone cases, laptop stickers, and tattoos. It might be the most commercially successful superstition artifact in human history, generating hundreds of millions in annual sales.',
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
    modernTwist:
      'Modern plumbing, soap, and sanitizer have made the hygiene argument obsolete — both hands can be equally clean. But the social norm persists strongly. Left-handed people in these cultures still face awkward dinner situations. The one area where this still makes genuine sense: eating communal dishes with your hands. Using a designated "clean" hand for shared food is actually still practical hygiene.',
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
    modernTwist:
      'Conservation efforts for owls in Africa constantly battle this superstition — owls are killed on sight in some communities because of the death omen belief. Wildlife organizations now run campaigns reframing owls as pest controllers (they eat the rats that actually spread disease). The superstition is literally an endangered species issue in 2026.',
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
    modernTwist:
      'This one still comes up in everyday life — at sleepovers, at the beach, when someone\'s lying on the living room floor watching TV. The "step back over to reverse it" rule is still enforced by African and Caribbean families worldwide. It\'s essentially a personal space and respect lesson disguised as a growth curse. As a teaching tool for boundaries, it\'s honestly still pretty effective.',
    verdict: 'practicalOrigin',
    funFact:
      'This superstition also exists in parts of India, the Caribbean, and among some Roma communities in Europe — likely traveling along historical migration and trade routes. It\'s a superstition with a passport.',
  },
  // ── New entries from deep research ──
  {
    id: 'shaking-legs-lose-wealth',
    title: 'Shaking Your Legs Drains Your Wealth',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Bouncing or jiggling your legs while sitting (pair hilana in Hindi) causes prosperity to "flow away." Elders commonly scold children: "Apne pair mat hila, acha nahi hota." The belief extends across East and Southeast Asia — in Japan, China, and South Korea, shaking legs is also believed to drive away good luck.',
    historicalOrigin:
      'Vedic astrology attributes restless legs to Saturn (Shani) or Rahu\'s negative planetary aspects. Since Shani governs stability, discipline, and long-term earnings, his negative influence supposedly manifests as restlessness. But the deeper root is cultural etiquette — in Indian joint family culture, body language carried enormous social weight. Shaking legs in front of elders or guests signaled poor manners, nervousness, or disrespect.',
    theRealReason:
      'Shaking legs universally signals anxiety, impatience, or nervousness — traits that undermine confidence in business dealings and social negotiations. In a society where merchant reputation and interpersonal trust drove commerce, appearing restless could literally cost you deals. Elders used the "loss of wealth" framing because supernatural consequences ensured compliance far better than "sit still."',
    modernTwist:
      'Plot twist: modern health research suggests leg-shaking while sitting for long periods actually improves blood flow and reduces cardiovascular risk. A 2016 study in the American Journal of Physiology found that fidgeting counteracts vascular damage from prolonged sitting. Your fidgeting may cost social points but could save you a heart attack. Still, try not to do it in a job interview.',
    verdict: 'busted',
    funFact:
      'A 2016 study in the American Journal of Physiology found that fidgeting while sitting counteracts vascular damage from prolonged sitting. Your grandmother\'s worst habit might be your heart\'s best friend.',
  },
  {
    id: 'dont-gift-sharp-objects',
    title: "Don't Gift Knives or Sharp Objects",
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Gifting knives, scissors, or blades "cuts" the relationship between giver and receiver. Even passing scissors hand-to-hand is avoided — you place them on a surface for the other person. Monetary gifts (shagun) must be in odd numbers (₹101, ₹501, ₹1,001) — round numbers end in zero, signifying completion/ending, while the extra ₹1 represents new beginnings.',
    historicalOrigin:
      'In Hindu culture and Vastu Shastra, sharp objects carry the energy of separation. The principle connects to "Ahimsa paramo dharmah" (non-violence is the highest duty). This taboo exists across Swiss, German, Brazilian, Egyptian, Chinese, Japanese, and Indian cultures. Multiple cultures independently developed the same counter-ritual: attach a small coin so the recipient "pays" for the sharp object, transforming a gift into a transaction.',
    theRealReason:
      'Handing sharp objects directly is genuinely dangerous — placing scissors down rather than passing hand-to-hand is essentially a safety protocol wrapped in superstition. Symbolically, gifts are acts of bonding, and a blade is a tool of separation. The ₹1 tradition creates a psychological sense of continuity — the gift isn\'t "complete," so the relationship continues.',
    modernTwist:
      'The Japanese knife company Oishya includes a 5-yen coin with every knife sold — the coin (go-en) sounds like "good fortune/fate," so the exchange both neutralizes bad luck and invokes good luck. Marketing genius meets ancient superstition. Meanwhile, wedding registries worldwide still quietly avoid listing knife sets.',
    verdict: 'hasMerit',
    funFact:
      'The Japanese knife company Oishya includes a 5-yen coin (go-en, meaning "good fortune/fate") with every knife sold — neutralizing bad luck while invoking good luck. Marketing genius meets ancient superstition.',
  },
  {
    id: 'hiccups-someone-thinking-of-you',
    title: 'Hiccups Mean Someone Is Thinking of You',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Unexpected hiccups signal someone close is thinking about you — often negatively. Some versions link it to the evil eye (nazar), suggesting envy. The folk remedy: recite names of people you know, and when hiccups stop, you\'ve identified the "thinker." If your crush\'s name stops them, they were thinking of you.',
    historicalOrigin:
      'This belongs to the broad category of folk beliefs that interpret involuntary bodily sensations as social signals. In India, it connects to the nazar/drishti (evil eye) framework rooted in Vedic and Puranic traditions. Cross-culturally: in Slavic folklore, different hiccup rhythms corresponded to types of conversations. In Hungary, hiccups mean gossip. In ancient Greece, someone was complaining about you. The Old English word for hiccup is "ælfsogoða" — literally "elf hiccup."',
    theRealReason:
      'Hiccups are involuntary spasms of the diaphragm caused by irritation of the phrenic and vagus nerves. Common triggers include eating too fast, temperature changes, carbonated drinks, and emotional stress. They are a brainstem reflex arc — completely physiological. The superstition persists due to confirmation bias: if you hiccup and then receive a message, the brain links the events.',
    modernTwist:
      'The "name your crush" hiccup test has gone viral on TikTok and Instagram Reels, with millions of people filming their hiccup-naming experiments. It\'s basically a socially acceptable way to admit who you\'re into. Your diaphragm isn\'t picking up psychic Wi-Fi signals — but naming your crush during hiccups? That\'s free therapy.',
    verdict: 'busted',
    funFact:
      'In Japan, hiccuping 100 consecutive times is believed to mean you will die. The world record for longest hiccup attack belongs to Charles Osborne, who hiccuped continuously for 68 years (1922–1990). Apparently, a lot of people were thinking about him.',
  },
  {
    id: 'dont-wash-hair-tuesday-thursday',
    title: "Don't Wash Hair on Tuesdays or Thursdays",
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Washing or cutting hair on Tuesday, Thursday, or Saturday is disrespectful to Hindu deities. Tuesday violations anger Hanuman and Lakshmi; Thursday violations displease Lord Brihaspati (Jupiter), leading to financial ruin; Saturday violations anger Shani Dev. For married women especially, washing hair on Thursday is believed to "wash away" Lakshmi\'s blessings.',
    historicalOrigin:
      'Deeply rooted in Hindu planetary astrology (Jyotish Shastra) and deity-day associations. Tuesday is ruled by Mars (Mangal), dedicated to Hanuman — cutting hair is believed to weaken one\'s "energetic armor." Thursday is ruled by Jupiter/Brihaspati — washing hair symbolically "washes away" knowledge and blessings. Saturday is ruled by Saturn/Shani Dev — grooming is seen as vanity counter to the day\'s austere character. Barbers traditionally had Tuesdays off.',
    theRealReason:
      'Restricting washing to specific days conserved water in agrarian communities with limited water infrastructure. Ayurveda recognized that over-washing strips natural oils (sebum), causing dryness — limiting wash days maintained hair health. Designating "rest days" from grooming aligned with temple visits, fasting days, and communal worship, creating a structured weekly rhythm.',
    modernTwist:
      'The planets don\'t care about your shampoo schedule, but dermatologists today actually recommend NOT washing hair daily — 2-3 times per week is optimal for most hair types. Your ancestors were secretly brilliant water conservationists disguised as astrologers. Meanwhile, the "no-poo" movement is basically rediscovering what Indian grandmothers enforced for centuries.',
    verdict: 'practicalOrigin',
    funFact:
      'The tradition varies wildly by region and marital status. In some interpretations, newly married women should wash hair on Wednesday to conceive a boy — while mothers of one son should never wash on Wednesday. The rules are so contradictory you\'d need an astrologer just to shower.',
  },
  {
    id: 'coconut-lemon-new-vehicle',
    title: 'Breaking a Coconut for a New Vehicle',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'travelAndJourney',
    whatPeopleBelieve:
      'Before a new vehicle\'s maiden journey, a Vahan Puja must be performed — breaking a coconut near the right front tire, sprinkling coconut water on all four tires, hanging nimbu-mirchi from the bumper, and placing lemons under all four tires to be crushed as the vehicle drives forward. This invokes blessings of Lord Ganesha (remover of obstacles) and Vishwakarma (divine architect).',
    historicalOrigin:
      'The coconut (Sriphala — "God\'s fruit" in Sanskrit) has been sacred in Hinduism for thousands of years. The three marks on a coconut represent Lord Shiva\'s three eyes. Critically, coconut breaking replaced the ancient practice of animal sacrifice (Narabali) — Adi Shankaracharya ensured coconut replaced animal heads in ritual offerings, the hard outer shell symbolizing the human skull. Regional variations include charcoal pieces in Maharashtra and drishti bommai (grotesque face dolls) in Tamil Nadu.',
    theRealReason:
      'Capsaicin in chillies and citric acid in lemons naturally repel insects — especially relevant in India\'s tropical climate. The ritual also creates a psychological anchor: performing a ceremony reduces new-vehicle anxiety and increases confidence, which paradoxically may lead to safer driving. Coconut water has genuine antibacterial properties and was used to clean spaces.',
    modernTwist:
      'Urban Indians now use plastic replicas and designer nimbu-mirchi charms; some even post emoji versions as WhatsApp status during car purchases. Luxury car dealerships and street food carts alike display the real thing — a truly cross-class tradition that survived the leap from bullock cart to BMW. YouTube is filled with Vahan Puja tutorials for Tesla owners.',
    verdict: 'hasMerit',
    funFact:
      'Alakshmi may not be hitchhiking on your Honda, but capsaicin genuinely repels bugs — your ancestors basically invented the first organic car freshener. This tradition is one of the few that crossed the class divide entirely intact.',
  },
  {
    id: 'dont-whistle-at-night',
    title: "Don't Whistle at Night",
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'Whistling after dark summons snakes, evil spirits, or both. In some versions, it invites bhoot-pret (ghosts) or brings financial ruin. This is one of the most globally universal superstitions — found in Japan, Hawaii, Turkey, Mexico, Korea, Russia, and even Inuit culture.',
    historicalOrigin:
      'In India, it connects to the deep cultural relationship with serpents — Naga worship, Nag Panchami, Shiva\'s snake Vasuki. Snake charmers used flute-like instruments, and whistling was thought to mimic this sound. But the belief appears independently everywhere: Japan (criminals used whistle signals), Hawaii (summons Night Marchers), Turkey (summons the Devil), Mexico (invites the Lechuza witch-owl), Russia (whistles away your fortune), and Inuit culture (whistling at Northern Lights calls spirits from the aurora).',
    theRealReason:
      'In pre-electric agrarian India, nights were genuinely dangerous. Whistling revealed your location to predators, both animal and human. Across cultures, criminals and bandits used whistling to communicate at night — a casual whistle could inadvertently signal thieves. While snakes lack external ears and detect ground vibrations (50–1,000 Hz) far below human whistling frequency (1,500–5,000 Hz), the advice to stay silent at night had genuine survival value.',
    modernTwist:
      'Snakes literally can\'t hear your whistle, but your grandma wasn\'t worried about cobras — she was worried about dacoits. Today, the superstition lives on as a general "don\'t attract attention at night" rule. In urban India, it\'s mostly ignored, but try whistling in a rural area after dark and watch the elders panic.',
    verdict: 'practicalOrigin',
    funFact:
      'In the Turkish village of Kuşköy, residents communicate via a whistled language across mountain valleys, day and night, for centuries — with no reported snake infestations or demonic visitations. UNESCO recognized it as Intangible Cultural Heritage in 2017.',
  },
  {
    id: 'salt-chilli-nazar-removal',
    title: 'Salt & Chilli Ritual to Remove Evil Eye',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'When someone feels unwell or has received excessive praise, a family elder performs nazar utarna — holding rock salt, dried red chillies, and sometimes mustard seeds, circling them around the affected person\'s head, then burning them. The diagnostic: if the chillies produce a strong, eye-watering smell, no nazar was present. If they burn without the acrid smell, negative energy has been "absorbed."',
    historicalOrigin:
      'Evil eye (nazar/drishti) is one of humanity\'s oldest superstitions, with protective amulets dating to ancient Mesopotamia (~3,300 BCE). It originated independently across Indo-European, Mediterranean, and Middle Eastern cultures — referenced in the Atharva Veda, Greek texts by Hesiod and Plutarch, Quranic passages, and rabbinic literature. Regional Indian variations include salt + chillies (Hindi belt), drishti bommai dolls (Tamil Nadu), kala dhaga black thread (Punjab), and kajal rituals (Bengal).',
    theRealReason:
      'The ritual provides psychological comfort and a sense of control. When someone feels unwell for no clear reason, the ritual reframes the issue as external (someone\'s jealousy) rather than internal — reducing anxiety and self-blame. The dramatic burning ceremony provides emotional catharsis and "closure." Salt is genuinely antimicrobial. The caring attention from a family elder likely did make people feel better — a form of healing touch that predates modern medicine.',
    modernTwist:
      'Your grandmother\'s chilli-and-salt ceremony is basically an ancient Indian placebo with theatrical flair. Evil eye amulets are now a major fashion trend worn by celebrities worldwide. A 2012 Pew survey found evil eye belief prevalent across 20 Muslim-majority countries, while 66% of Greek adults still believe in it. It may be the most popular superstition on Earth — it outlasted empires, survived the Enlightenment, and thrives in the smartphone age.',
    verdict: 'hasMerit',
    funFact:
      'Evil eye amulets are now a major fashion trend worn by Oprah, Jennifer Aniston, and Brad Pitt. It may be the most popular superstition on Earth — it has outlasted empires, survived the Enlightenment, and thrives in the smartphone age.',
  },
  {
    id: 'single-crow-vs-pair',
    title: 'One Crow Is Sorrow, Two Crows Are Joy',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'animals',
    whatPeopleBelieve:
      'A single crow is inauspicious — a harbinger of sorrow. Two crows together signal joy, good luck, or arriving guests. The direction of a crow\'s flight after eating offerings is also interpreted — flying right to left means ancestors have accepted the offering.',
    historicalOrigin:
      'Crows are central to Pitru Paksha and Shradh rituals. During Shradh (annual death anniversary), families prepare feasts on banana leaves and call "Ka! Ka!" to invite crows — when a crow pecks the food, the ancestor has "eaten." In Nepal, the first day of Diwali/Tihar is Kag Puja (Crow Worship Day). The Western parallel is the British nursery rhyme "One for Sorrow, Two for Joy" (first recorded 1780, about magpies). Varahamihira\'s Brihat Samhita contains an entire chapter on crow omens.',
    theRealReason:
      'Crows are communal and typically move in pairs or groups. A solitary crow genuinely may signal distress — it may have lost its mate or been outcast. Their presence near homes correlates with food availability, and their cawing increases before visitors arrive. As scavengers, their association with death sites was natural.',
    modernTwist:
      'One crow isn\'t bad luck — it\'s just a bird having lunch alone. During Shradh, if no crow comes to eat the offering, families literally drive around looking for crows to complete the ritual — making it possibly the only religious ceremony where the congregation has wings and no RSVP obligations. The band Counting Crows took their name from the British rhyme version.',
    verdict: 'busted',
    funFact:
      'During Shradh, if no crow comes to eat the offering, the family literally drives around looking for crows — making it possibly the only religious ceremony where the congregation has wings and no RSVP obligations.',
  },
  {
    id: 'sacred-broom-lakshmi',
    title: 'The Broom Is Sacred — Never Disrespect It',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'homeAndDaily',
    whatPeopleBelieve:
      'A newly purchased broom must be treated with reverence. The broom is considered an embodiment of Goddess Lakshmi. Stepping on a broom, kicking it, or disrespecting it in any way invites financial ruin. Elaborate Vastu Shastra rules govern every aspect: buy only on auspicious days, never keep standing upright, never store in the kitchen, sprinkle salt before first use, and never take an old broom to a new home.',
    historicalOrigin:
      'According to legend, when Goddess Lakshmi first entered Vaikuntha (Lord Vishnu\'s celestial abode), she swept the golden halls, declaring: "I am not sweeping dust — I am sweeping away pride, ego, and arrogance." The core principle: Lakshmi resides only in clean places; her opposite Alakshmi resides in dirty, neglected places. In Jainism, monks carry brooms (rajoharana) to sweep the ground before them, preventing unconscious killing of insects — an act of ahimsa. Buying a new broom on Dhanteras symbolizes sweeping away misfortune.',
    theRealReason:
      'Before modern sanitation, keeping homes clean was a survival matter. Associating cleanliness with the goddess of wealth ensured even reluctant people would maintain hygiene. Elevating the broom to sacred status ensured it was well-maintained, properly stored, and replaced when worn — all practically beneficial. The salt-sprinkling served as a mild disinfectant.',
    modernTwist:
      'The broom isn\'t just a cleaning tool — it\'s India\'s original Marie Kondo, with divine credentials. India has over 537 tribal communities that have created more than 100 varieties of brooms using different plant species. The broom is said to become "sentimentally attached" to its place — which is why you should never take it when moving. It may be the only household object with separation anxiety written into its cultural manual.',
    verdict: 'practicalOrigin',
    funFact:
      'India has over 537 tribal communities that have created more than 100 varieties of brooms using different plant species. The broom is said to become "sentimentally attached" to its place — making it possibly the only household object with separation anxiety written into its cultural manual.',
  },
  {
    id: 'peacock-feathers-bad-luck',
    title: 'Peacock Feathers Inside Home — Lucky or Cursed?',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    category: 'animals',
    whatPeopleBelieve:
      'This is the most regionally contradictory superstition in India. In mainstream Hindu tradition, peacock feathers (mor pankh) are deeply auspicious — associated with Lord Krishna. But in some regions and Western-influenced thought, the eye-like patterns represent the "evil eye" and bring bad luck, prevent marriages, and attract jealousy.',
    historicalOrigin:
      'The pro-peacock view dominates: Lord Krishna always wears a peacock feather on his crown; Lord Kartikeya rides the peacock as his vahana; it\'s India\'s National Bird. The anti-peacock view traces to Greek mythology — the peacock\'s eyes come from Argus Panoptes, the hundred-eyed giant killed by Hermes, linking them to jealousy and death. In medieval European Christianity, the peacock was associated with vanity. One compelling hypothesis: the "bad luck" story was deliberately spread to discourage poaching of India\'s national bird.',
    theRealReason:
      'Bird feathers can harbor allergens including feather mites and bird serum proteins. Unprocessed feathers contain measurable levels of dust-mite allergens. For people with asthma or respiratory sensitivity, natural feathers indoors could trigger reactions. However, commercially processed feathers (washed, dried at 125°C) have all detectable allergens removed.',
    modernTwist:
      'In India, the peacock feather is simultaneously Krishna\'s crown jewel and some grandmother\'s worst nightmare. Geography is destiny — the same feather that blesses you in Mathura might curse you in Manchester. The peacock conservation angle might be the most interesting modern take: if the "bad luck" story saves even a few birds from poaching, it\'s superstition doing conservation\'s job.',
    verdict: 'busted',
    funFact:
      'The peacock can predict rain by dancing before it pours — a real meteorological observation farmers have relied on for centuries. It also eats poisonous snakes without harm, which in Buddhism symbolizes transforming poison into beauty.',
  },
  {
    id: 'spilling-salt-bad-luck',
    title: 'Spilling Salt Invites Bad Luck',
    country: 'United Kingdom',
    countryFlag: '🇬🇧',
    region: 'europe',
    category: 'foodAndEating',
    whatPeopleBelieve:
      'Spilling salt invites betrayal or evil. The remedy: throw a pinch over your left shoulder (where the Devil lurks) using the right hand, blinding Satan. This is one of Europe\'s most enduring kitchen superstitions.',
    historicalOrigin:
      'Salt was extraordinarily valuable throughout antiquity — essential for food preservation, purification, and trade. Roman soldiers received salarium ("salt money") — the origin of our word "salary." The ancient Sumerians (~3500 BCE) were the first recorded to throw salt over the left shoulder. Leonardo da Vinci\'s "The Last Supper" (c. 1495–1498) cemented the superstition by depicting Judas having knocked over a salt cellar — though the spilled-salt omen existed before da Vinci.',
    theRealReason:
      'Salt\'s extraordinary value made spilling it genuinely catastrophic — equivalent to tossing money in the trash. Before refrigeration, salt was essential for preserving food and preventing starvation. The superstition functioned as a social norm to enforce careful handling of a precious resource.',
    modernTwist:
      'In a world where salt costs pennies per kilogram, the superstition has lost its economic teeth but kept its cultural grip. Restaurants still have salt-spilling regulars who instinctively toss a pinch over their shoulder. In Japanese Buddhist tradition, salt is thrown after a funeral to prevent spirits from following you home — proving salt may be the most spiritually significant seasoning in human history.',
    verdict: 'practicalOrigin',
    funFact:
      'The word "salary" comes from Latin salarium; "salad" from sal; and "worth his salt" from Petronius. Leonardo da Vinci gave the superstition perfect visual branding in The Last Supper — history\'s most famous spilled condiment.',
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
      s.historicalOrigin.toLowerCase().includes(q) ||
      s.modernTwist.toLowerCase().includes(q)
  );
}
