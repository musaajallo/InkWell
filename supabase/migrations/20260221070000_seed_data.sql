-- Seed data migration: writing_prompts (200+), poetry_forms (13), bundled_poems (50+)

---------------------------------------------------------------------------
-- 1. POETRY FORMS (13 rows)
---------------------------------------------------------------------------

INSERT INTO poetry_forms (slug, name, origin, description, rules, rhyme_scheme, line_count, syllable_pattern, examples) VALUES

('haiku', 'Haiku', 'Japan, 17th century', 'A minimalist Japanese form that captures a single moment in nature or human experience. Haiku relies on brevity, sensory imagery, and a seasonal reference (kigo) to evoke deep emotion in just three lines.',
  ARRAY['Three lines only', 'Syllable pattern: 5-7-5', 'Include a seasonal reference (kigo)', 'Capture a single moment or image', 'Avoid titles and rhyme', 'Use present tense'],
  NULL, 3, ARRAY[5,7,5],
  '[{"title":"The Old Pond","author":"Matsuo Bashō","text":"An old silent pond\nA frog jumps into the pond—\nSplash! Silence again."},{"title":"Lightning Flash","author":"Matsuo Bashō","text":"Lightning flash—\nwhat I thought were faces\nare plumes of pampas grass."}]'::jsonb),

('tanka', 'Tanka', 'Japan, 7th century', 'An older Japanese form that extends the haiku with two additional lines, allowing the poet to move from an observed image into personal reflection or emotional response.',
  ARRAY['Five lines', 'Syllable pattern: 5-7-5-7-7', 'First three lines present an image (upper phrase)', 'Last two lines offer reflection or emotion (lower phrase)', 'Often includes a pivot between observation and feeling'],
  NULL, 5, ARRAY[5,7,5,7,7],
  '[{"title":"Untitled","author":"Ono no Komachi","text":"The flowers withered,\nTheir color faded away,\nWhile meaninglessly\nI spent my days in the world\nAnd the long rains were falling."},{"title":"Untitled","author":"Lady Izumi Shikibu","text":"Watching the moon\nat dawn, solitary,\nmid-sky—\nI knew myself completely:\nno part left out."}]'::jsonb),

('sonnet-shakespearean', 'Shakespearean Sonnet', 'England, 16th century', 'A fourteen-line form popularized by William Shakespeare, structured as three quatrains and a closing couplet. It builds an argument or narrative across its stanzas with a memorable turn in the final couplet.',
  ARRAY['14 lines of iambic pentameter', 'Three quatrains (4 lines each) + one couplet (2 lines)', 'Rhyme scheme: ABAB CDCD EFEF GG', 'Each quatrain develops the theme', 'The couplet delivers a turn or resolution', '10 syllables per line'],
  'ABAB CDCD EFEF GG', 14, ARRAY[10,10,10,10,10,10,10,10,10,10,10,10,10,10],
  '[{"title":"Sonnet 18","author":"William Shakespeare","text":"Shall I compare thee to a summer''s day?\nThou art more lovely and more temperate:\nRough winds do shake the darling buds of May,\nAnd summer''s lease hath all too short a date.\nSometime too hot the eye of heaven shines,\nAnd often is his gold complexion dimmed;\nAnd every fair from fair sometime declines,\nBy chance, or nature''s changing course untrimmed;\nBut thy eternal summer shall not fade,\nNor lose possession of that fair thou ow''st,\nNor shall death brag thou wand''rest in his shade,\nWhen in eternal lines to time thou grow''st.\n  So long as men can breathe, or eyes can see,\n  So long lives this, and this gives life to thee."}]'::jsonb),

('sonnet-petrarchan', 'Petrarchan Sonnet', 'Italy, 14th century', 'The original sonnet form developed by Petrarch. It divides into an octave that presents a problem or situation and a sestet that offers a resolution or shift in perspective, connected by a dramatic volta.',
  ARRAY['14 lines of iambic pentameter', 'Octave (8 lines) + sestet (6 lines)', 'Octave rhyme: ABBAABBA', 'Sestet rhyme: CDCDCD or CDECDE', 'Volta (turn) between octave and sestet', '10 syllables per line'],
  'ABBAABBA CDCDCD', 14, ARRAY[10,10,10,10,10,10,10,10,10,10,10,10,10,10],
  '[{"title":"On His Blindness","author":"John Milton","text":"When I consider how my light is spent,\nEre half my days in this dark world and wide,\nAnd that one talent which is death to hide\nLodged with me useless, though my soul more bent\nTo serve therewith my Maker, and present\nMy true account, lest He returning chide;\n\"Doth God exact day-labour, light denied?\"\nI fondly ask. But Patience, to prevent\nThat murmur, soon replies, \"God doth not need\nEither man''s work or his own gifts. Who best\nBear his mild yoke, they serve him best. His state\nIs kingly: thousands at his bidding speed\nAnd post o''er land and ocean without rest;\nThey also serve who only stand and wait.\""}]'::jsonb),

('limerick', 'Limerick', 'Ireland/England, 18th century', 'A humorous five-line poem with a distinctive bouncing rhythm. Limericks are known for their wit, wordplay, and often absurd or bawdy subject matter.',
  ARRAY['Five lines', 'Rhyme scheme: AABBA', 'Lines 1, 2, 5 are longer (7-10 syllables, anapestic trimeter)', 'Lines 3, 4 are shorter (5-7 syllables, anapestic dimeter)', 'Humorous or witty in tone', 'Often begins with "There once was..."'],
  'AABBA', 5, ARRAY[8,8,5,5,8],
  '[{"title":"Untitled","author":"Edward Lear","text":"There was an Old Man with a beard,\nWho said, ''It is just as I feared!—\nTwo Owls and a Hen,\nFour Larks and a Wren,\nHave all built their nests in my beard!''"},{"title":"Untitled","author":"Edward Lear","text":"There was a Young Lady of Ryde,\nWhose shoe-strings were seldom untied;\nShe purchased some clogs,\nAnd some small spotted dogs,\nAnd frequently walked about Ryde."}]'::jsonb),

('villanelle', 'Villanelle', 'France/Italy, 16th century', 'A highly structured form built on obsessive repetition of two refrains. The repeating lines create a hypnotic, circular quality that suits themes of obsession, loss, and inevitability.',
  ARRAY['19 lines total', 'Five tercets (3 lines) + one quatrain (4 lines)', 'Two refrains: line 1 (A1) and line 3 (A2)', 'Rhyme scheme: ABA ABA ABA ABA ABA ABAA', 'Refrains alternate as final line of each tercet', 'Both refrains close the final quatrain', 'Typically iambic pentameter'],
  'ABA ABA ABA ABA ABA ABAA', 19, NULL,
  '[{"title":"Do Not Go Gentle into That Good Night","author":"Dylan Thomas","text":"Do not go gentle into that good night,\nOld age should burn and rave at close of day;\nRage, rage against the dying of the light.\n\nThough wise men at their end know dark is right,\nBecause their words had forked no lightning they\nDo not go gentle into that good night.\n\nGood men, the last wave by, crying how bright\nTheir frail deeds might have danced in a green bay,\nRage, rage against the dying of the light.\n\nWild men who caught and sang the sun in flight,\nAnd learn, too late, they grieved it on its way,\nDo not go gentle into that good night.\n\nGrave men, near death, who see with blinding sight\nBlind eyes could blaze like meteors and be gay,\nRage, rage against the dying of the light.\n\nAnd you, my father, there on the sad height,\nCurse, bless, me now with your fierce tears, I pray.\nDo not go gentle into that good night.\nRage, rage against the dying of the light."}]'::jsonb),

('ghazal', 'Ghazal', 'Arabia/Persia, 7th century', 'An ancient form of lyric poetry composed of self-contained couplets united by a refrain word (radif) and a rhyming pattern. Each couplet is a complete thought, yet all orbit the same emotional center.',
  ARRAY['Minimum 5 couplets (10 lines)', 'Each couplet is a self-contained unit', 'Both lines of the first couplet end with the refrain (radif)', 'Second line of each subsequent couplet ends with the refrain', 'Rhyme word (qafia) precedes the refrain', 'Poet may sign their name in the final couplet (makhta)', 'Themes: love, longing, loss'],
  'AA BA CA DA EA', NULL, NULL,
  '[{"title":"Ghazal of the Better-Unbegun","author":"Heather McHugh","text":"Too volatile, am I? too voluble? too much a word-Loss?\nI blame the soup: I am a creature of the Broth.\n\nToo amorous, am I? Too much a moose-Loss?\nWhy, race me to the gate; I love a Joust.\n\nHail me? Hell, no. Hale? Not hardly. Hurry-Loss\nto the matter. To the Crux. To the Nub. To the Gist."}]'::jsonb),

('free-verse', 'Free Verse', 'America/Europe, 19th century', 'Poetry freed from regular meter, rhyme, or fixed structure. Free verse relies on natural speech rhythms, line breaks, and imagery to create meaning. It is the dominant form of contemporary poetry.',
  ARRAY['No fixed meter or rhyme scheme', 'Line breaks create rhythm and emphasis', 'May use internal rhyme, assonance, or alliteration', 'Structure serves the content', 'Can vary line length for effect', 'Relies on imagery and voice'],
  NULL, NULL, NULL,
  '[{"title":"The Red Wheelbarrow","author":"William Carlos Williams","text":"so much depends\nupon\n\na red wheel\nbarrow\n\nglazed with rain\nwater\n\nbeside the white\nchickens."},{"title":"Fog","author":"Carl Sandburg","text":"The fog comes\non little cat feet.\n\nIt sits looking\nover harbor and city\non silent haunches\nand then moves on."}]'::jsonb),

('acrostic', 'Acrostic', 'Ancient Greece, 3rd century BCE', 'A poem where the first letter of each line spells out a word or message when read vertically. This hidden message adds a layer of meaning and makes the form popular for dedications and wordplay.',
  ARRAY['First letters of each line spell a word or phrase', 'The hidden word is usually the subject or dedicatee', 'No fixed meter, rhyme, or line count', 'Can be combined with other forms', 'Double acrostics use first and last letters', 'Telestich variant uses last letters only'],
  NULL, NULL, NULL,
  '[{"title":"Elizabeth","author":"Edgar Allan Poe","text":"Elizabeth it is in vain you say\nLove not — thou sayest it in so sweet a way:\nIn vain those words from thee or L.E.L.\nZantippe''s talents had enforced so well:\nAh! if that language from thy heart arise,\nBreath it less gently forth — and veil thine eyes.\nEndymion, recollect, when Luna tried\nTo cure his love — was cured of all beside —\nHis folly — pride — and passion — for he died."}]'::jsonb),

('ballad', 'Ballad', 'Europe, Medieval period', 'A narrative poem traditionally meant to be sung. Ballads tell stories of love, adventure, or tragedy through simple, rhythmic quatrains with a memorable refrain.',
  ARRAY['Written in quatrains (4-line stanzas)', 'Alternating 4-stress and 3-stress lines (ballad meter)', 'Rhyme scheme: ABAB or ABCB', 'Tells a story, often dramatic or tragic', 'Uses simple, direct language', 'May include a refrain or chorus', 'Dialogue is common'],
  'ABCB', NULL, ARRAY[8,6,8,6],
  '[{"title":"Annabel Lee","author":"Edgar Allan Poe","text":"It was many and many a year ago,\nIn a kingdom by the sea,\nThat a maiden there lived whom you may know\nBy the name of Annabel Lee;\nAnd this maiden she lived with no other thought\nThan to love and be loved by me."}]'::jsonb),

('ode', 'Ode', 'Ancient Greece, 5th century BCE', 'A formal lyric poem that celebrates or meditates deeply on a subject. Odes are characterized by their elevated language, serious tone, and elaborate structure.',
  ARRAY['Addresses a specific subject directly (apostrophe)', 'Elevated, formal language', 'Variable stanza length and structure', 'Three types: Pindaric (triadic), Horatian (uniform stanzas), Irregular', 'Often uses iambic pentameter', 'Explores the subject from multiple angles', 'Typically 3-10 stanzas'],
  NULL, NULL, NULL,
  '[{"title":"Ode on a Grecian Urn (excerpt)","author":"John Keats","text":"Thou still unravish''d bride of quietness,\nThou foster-child of silence and slow time,\nSylvan historian, who canst thus express\nA flowery tale more sweetly than our rhyme:\nWhat leaf-fringed legend haunts about thy shape\nOf deities or mortals, or of both,\nIn Tempe or the dales of Arcady?\nWhat men or gods are these? What maidens loth?\nWhat mad pursuit? What struggle to escape?\nWhat pipes and timbrels? What wild ecstasy?"}]'::jsonb),

('elegy', 'Elegy', 'Ancient Greece, 7th century BCE', 'A poem of mourning and reflection on death or loss. Elegies move through grief toward consolation, often honoring a specific person or lamenting the passage of time.',
  ARRAY['Reflective, mournful tone', 'Often written in memory of someone who has died', 'Three traditional movements: lament, praise, consolation', 'No fixed meter or rhyme (modern elegies)', 'Classical elegies used elegiac couplets (hexameter + pentameter)', 'May address the deceased directly', 'Can mourn abstract losses (youth, innocence, an era)'],
  NULL, NULL, NULL,
  '[{"title":"O Captain! My Captain! (excerpt)","author":"Walt Whitman","text":"O Captain! my Captain! our fearful trip is done,\nThe ship has weather''d every rack, the prize we sought is won,\nThe port is near, the bells I hear, the people all exulting,\nWhile follow eyes the steady keel, the vessel grim and daring;\nBut O heart! heart! heart!\nO the bleeding drops of red,\nWhere on the deck my Captain lies,\nFallen cold and dead."}]'::jsonb),

('couplet', 'Couplet', 'Ancient world, various origins', 'Two consecutive lines of poetry that rhyme and form a complete thought. Couplets can stand alone as epigrammatic poems or serve as building blocks within larger works.',
  ARRAY['Two lines that rhyme (AA)', 'Lines are usually the same length', 'Each couplet is a complete thought', 'Heroic couplets use iambic pentameter', 'Can be open (enjambed) or closed (end-stopped)', 'Often witty, epigrammatic, or conclusive'],
  'AA', 2, ARRAY[10,10],
  '[{"title":"from An Essay on Criticism","author":"Alexander Pope","text":"True ease in writing comes from art, not chance,\nAs those move easiest who have learned to dance."},{"title":"from An Essay on Man","author":"Alexander Pope","text":"Know then thyself, presume not God to scan;\nThe proper study of mankind is man."}]'::jsonb);


---------------------------------------------------------------------------
-- 2. WRITING PROMPTS (210 rows, ~35 per category)
---------------------------------------------------------------------------

-- EMOTION prompts
INSERT INTO writing_prompts (text, category) VALUES
('Write about a joy so intense it frightens you.', 'emotion'),
('Describe anger without ever naming the emotion.', 'emotion'),
('Write a poem to the version of yourself that existed five years ago.', 'emotion'),
('Capture the moment right before tears fall.', 'emotion'),
('Write about a happiness that arrived uninvited.', 'emotion'),
('Describe the physical sensation of loneliness.', 'emotion'),
('Write about a love that changed shape over time.', 'emotion'),
('Capture the feeling of relief after a long struggle.', 'emotion'),
('Write about jealousy as if it were a living creature.', 'emotion'),
('Describe the weight of an unspoken apology.', 'emotion'),
('Write about the first time you felt truly brave.', 'emotion'),
('Capture homesickness for a place that no longer exists.', 'emotion'),
('Write about tenderness shown through small gestures.', 'emotion'),
('Describe hope as something you can hold in your hands.', 'emotion'),
('Write about the grief that lives inside laughter.', 'emotion'),
('Capture the exact moment trust is broken.', 'emotion'),
('Write about pride swallowed to make room for forgiveness.', 'emotion'),
('Describe contentment without using the word "happy."', 'emotion'),
('Write about guilt that visits you in the quiet hours.', 'emotion'),
('Capture the ache of missing someone who is still alive.', 'emotion'),
('Write about an emotion you have no word for.', 'emotion'),
('Describe shame dissolving in the light of understanding.', 'emotion'),
('Write about the fear of losing something you haven''t lost yet.', 'emotion'),
('Capture the warmth of being truly seen by another person.', 'emotion'),
('Write about rage transformed into something beautiful.', 'emotion'),
('Describe the peace that follows acceptance.', 'emotion'),
('Write about love expressed through silence.', 'emotion'),
('Capture the vertigo of sudden, unexpected change.', 'emotion'),
('Write about gratitude for something you once resented.', 'emotion'),
('Describe the bittersweet taste of a completed chapter.', 'emotion'),
('Write about an emotion you inherited from a parent.', 'emotion'),
('Capture the fragile euphoria of a new beginning.', 'emotion'),
('Write about the sting of a compliment that feels like criticism.', 'emotion'),
('Describe vulnerability as a form of strength.', 'emotion'),
('Write about the quiet devastation of indifference.', 'emotion');

-- NATURE prompts
INSERT INTO writing_prompts (text, category) VALUES
('Write about a tree you have known your whole life.', 'nature'),
('Describe rain from the perspective of the earth receiving it.', 'nature'),
('Write about the hour just before dawn.', 'nature'),
('Capture the personality of a specific wind.', 'nature'),
('Write about an animal you saw only once but never forgot.', 'nature'),
('Describe moonlight as if explaining it to someone blind from birth.', 'nature'),
('Write about the ocean at a time of day no one visits.', 'nature'),
('Capture the silence between two birdsongs.', 'nature'),
('Write about a flower growing in an impossible place.', 'nature'),
('Describe a storm as a conversation between sky and ground.', 'nature'),
('Write about the first snow of the year.', 'nature'),
('Capture the smell of earth after rain (petrichor) in verse.', 'nature'),
('Write about a river and what it carries.', 'nature'),
('Describe autumn as a form of letting go.', 'nature'),
('Write about fire as both destroyer and creator.', 'nature'),
('Capture the moment a seed breaks open underground.', 'nature'),
('Write about the stars as ancestors watching.', 'nature'),
('Describe a landscape that mirrors your inner state.', 'nature'),
('Write about the patience of stones.', 'nature'),
('Capture the last light of a summer evening.', 'nature'),
('Write about fog as a metaphor for uncertainty.', 'nature'),
('Describe the root system of a forest as a community.', 'nature'),
('Write about a body of water that holds a secret.', 'nature'),
('Capture the sound of leaves in different seasons.', 'nature'),
('Write about a garden that has been abandoned.', 'nature'),
('Describe ice forming on a window as art.', 'nature'),
('Write about the migration of birds as a poem of departure.', 'nature'),
('Capture the wildness of an untamed meadow.', 'nature'),
('Write about moss and its slow conquest.', 'nature'),
('Describe the desert as a place of revelation.', 'nature'),
('Write about a mountain at different times of day.', 'nature'),
('Capture the way sunlight moves through water.', 'nature'),
('Write about the tide as a metaphor for grief.', 'nature'),
('Describe a thunderstorm from inside a small shelter.', 'nature'),
('Write about the oldest living thing you have ever seen.', 'nature');

-- MEMORY prompts
INSERT INTO writing_prompts (text, category) VALUES
('Write about a meal that tasted like childhood.', 'memory'),
('Describe a room you will never enter again.', 'memory'),
('Write about a sound that transports you to another time.', 'memory'),
('Capture a memory that has changed each time you''ve retold it.', 'memory'),
('Write about a photograph you wish existed.', 'memory'),
('Describe the last time you saw someone for the last time.', 'memory'),
('Write about a scent that unlocks a forgotten moment.', 'memory'),
('Capture your earliest memory, however fragmented.', 'memory'),
('Write about a place that exists only in your memory now.', 'memory'),
('Describe a conversation you replay in your mind.', 'memory'),
('Write about a toy or object from childhood and where it is now.', 'memory'),
('Capture the memory of learning to read or write.', 'memory'),
('Write about a holiday tradition that has been lost.', 'memory'),
('Describe a scar and the story behind it.', 'memory'),
('Write about a promise someone made to you long ago.', 'memory'),
('Capture the memory of a thunderstorm from childhood.', 'memory'),
('Write about a friendship that ended without explanation.', 'memory'),
('Describe the home you lived in at age ten.', 'memory'),
('Write about a journey that changed your perspective.', 'memory'),
('Capture the feeling of returning to a place after many years.', 'memory'),
('Write about a song that belongs to a specific period of your life.', 'memory'),
('Describe a lesson learned from a stranger.', 'memory'),
('Write about the last day of a particular era in your life.', 'memory'),
('Capture a memory of hands — your own or someone else''s.', 'memory'),
('Write about a birthday that stands apart from all others.', 'memory'),
('Describe a dream you had as a child that you still remember.', 'memory'),
('Write about an heirloom and the lives it has passed through.', 'memory'),
('Capture the memory of the first time you felt grown up.', 'memory'),
('Write about a voice you can still hear though the person is gone.', 'memory'),
('Describe a summer that felt like it lasted a lifetime.', 'memory'),
('Write about a book that changed who you were becoming.', 'memory'),
('Capture the moment you realized your parents were human.', 'memory'),
('Write about a secret you kept as a child.', 'memory'),
('Describe your hands as a map of your history.', 'memory'),
('Write about a goodbye that felt like a door closing forever.', 'memory');

-- ABSTRACT prompts
INSERT INTO writing_prompts (text, category) VALUES
('Write about time as a substance you can touch.', 'abstract'),
('Describe the color of silence.', 'abstract'),
('Write about the space between two heartbeats.', 'abstract'),
('Capture infinity in a single domestic image.', 'abstract'),
('Write about nothing — literally, the concept of nothingness.', 'abstract'),
('Describe what gravity feels like to the soul.', 'abstract'),
('Write about a door that opens to everywhere and nowhere.', 'abstract'),
('Capture the texture of a thought before it becomes a word.', 'abstract'),
('Write about the boundary between sleeping and waking.', 'abstract'),
('Describe the sound of growing older.', 'abstract'),
('Write about the weight of a name.', 'abstract'),
('Capture the shape of an echo.', 'abstract'),
('Write about distance as an emotional measurement.', 'abstract'),
('Describe the architecture of a daydream.', 'abstract'),
('Write about the temperature of forgiveness.', 'abstract'),
('Capture the taste of a word you love.', 'abstract'),
('Write about the edge where language fails.', 'abstract'),
('Describe what exists in the pause of a conversation.', 'abstract'),
('Write about the color of your name.', 'abstract'),
('Capture the moment between choosing and acting.', 'abstract'),
('Write about the opposite of a mirror.', 'abstract'),
('Describe a number as if it had a personality.', 'abstract'),
('Write about the weight of possibility.', 'abstract'),
('Capture the shadow cast by an idea.', 'abstract'),
('Write about the sound of a color.', 'abstract'),
('Describe the geography of loneliness.', 'abstract'),
('Write about what happens to words after they are spoken.', 'abstract'),
('Capture the feeling of being both here and somewhere else.', 'abstract'),
('Write about the space a person leaves when they exit a room.', 'abstract'),
('Describe truth as a physical object.', 'abstract'),
('Write about the speed of understanding.', 'abstract'),
('Capture the smell of nostalgia.', 'abstract'),
('Write about what the darkness sees.', 'abstract'),
('Describe the texture of a secret.', 'abstract'),
('Write about the mathematics of love.', 'abstract');

-- STORY prompts
INSERT INTO writing_prompts (text, category) VALUES
('Write about a letter that arrives fifty years late.', 'story'),
('Tell the story of a bridge and two people who cross it in opposite directions.', 'story'),
('Write about the last person to leave a dying town.', 'story'),
('Capture the story of an object passed between strangers.', 'story'),
('Write about a musician who plays for an audience of one.', 'story'),
('Tell the tale of a door that should not have been opened.', 'story'),
('Write about two people who share an umbrella in a downpour.', 'story'),
('Capture the story of a lighthouse keeper''s loneliest night.', 'story'),
('Write about a traveler who arrives at the wrong destination.', 'story'),
('Tell the story of a garden planted in wartime.', 'story'),
('Write about a child who finds a message in a bottle.', 'story'),
('Capture the moment a stranger on a train says exactly what you needed to hear.', 'story'),
('Write about a baker who puts secrets into bread.', 'story'),
('Tell the story of the last bookshop in a digital world.', 'story'),
('Write about a painter who can only work during storms.', 'story'),
('Capture the story of a clock that runs backward.', 'story'),
('Write about a fisherman who catches something impossible.', 'story'),
('Tell the tale of a map that leads to a feeling, not a place.', 'story'),
('Write about a poet who loses the ability to read.', 'story'),
('Capture the story of a house that remembers its inhabitants.', 'story'),
('Write about a dance between two people who speak different languages.', 'story'),
('Tell the story of the oldest tree in a city.', 'story'),
('Write about a librarian who discovers a book with blank pages that fill themselves.', 'story'),
('Capture the moment a photograph is taken that changes everything.', 'story'),
('Write about a tailor who sews wishes into clothing.', 'story'),
('Tell the story of a feast held on the eve of something unknown.', 'story'),
('Write about a translator who cannot translate one particular word.', 'story'),
('Capture the story of a candle and all the conversations it has witnessed.', 'story'),
('Write about someone who collects lost things.', 'story'),
('Tell the tale of a ferry crossing on the last day of an era.', 'story'),
('Write about a song that can only be heard once.', 'story'),
('Capture the story of a well and what was wished into it.', 'story'),
('Write about a healer whose remedy is poetry.', 'story'),
('Tell the story of a window and everything it has framed.', 'story'),
('Write about two strangers who recognize each other from a dream.', 'story');

-- OBSERVATION prompts
INSERT INTO writing_prompts (text, category) VALUES
('Describe exactly what you see from where you are sitting right now.', 'observation'),
('Write about the way a specific person walks.', 'observation'),
('Capture the sounds of your neighborhood at midnight.', 'observation'),
('Write about the contents of your pockets or bag as a self-portrait.', 'observation'),
('Describe the light in the room you are in at this exact moment.', 'observation'),
('Write about a crack in a wall and what it might mean.', 'observation'),
('Capture the body language of people waiting in line.', 'observation'),
('Write about the oldest thing in your kitchen.', 'observation'),
('Describe the view from a window you look through every day.', 'observation'),
('Write about the way shadows move across a familiar room.', 'observation'),
('Capture the sounds of a city from a rooftop.', 'observation'),
('Write about the hands of someone you see often but don''t know.', 'observation'),
('Describe the difference between two shades of the same color.', 'observation'),
('Write about what people leave behind on public transport.', 'observation'),
('Capture the way food looks before it is eaten.', 'observation'),
('Write about the architecture of your street as a poem.', 'observation'),
('Describe the face of a clock as if seeing one for the first time.', 'observation'),
('Write about the particular blue of today''s sky.', 'observation'),
('Capture the choreography of a busy intersection.', 'observation'),
('Write about the way a door sounds when it closes.', 'observation'),
('Describe the texture of an everyday object as if it were extraordinary.', 'observation'),
('Write about the graffiti or signs you pass on your daily route.', 'observation'),
('Capture the way steam rises from a cup of something hot.', 'observation'),
('Write about the shoes lined up by someone''s front door.', 'observation'),
('Describe a tree you pass every day as if meeting it for the first time.', 'observation'),
('Write about the way dust gathers in forgotten corners.', 'observation'),
('Capture the sounds that fill a room when everyone has left.', 'observation'),
('Write about an object on your desk and its secret life.', 'observation'),
('Describe the way a candle flame responds to breath.', 'observation'),
('Write about the marks and wear on a well-used tool.', 'observation'),
('Capture the precise shade of light at golden hour.', 'observation'),
('Write about the patterns in peeling paint or weathered wood.', 'observation'),
('Describe the geometry of a staircase.', 'observation'),
('Write about what you notice in the first ten seconds of entering a new space.', 'observation'),
('Capture the way a familiar street looks in unfamiliar weather.', 'observation');


---------------------------------------------------------------------------
-- 3. BUNDLED POEMS (55 classic public-domain poems)
---------------------------------------------------------------------------

INSERT INTO bundled_poems (title, author, lines, line_count) VALUES

('The Road Not Taken', 'Robert Frost',
  ARRAY['Two roads diverged in a yellow wood,','And sorry I could not travel both','And be one traveler, long I stood','And looked down one as far as I could','To where it bent in the undergrowth;','','Then took the other, as just as fair,','And having perhaps the better claim,','Because it was grassy and wanted wear;','Though as for that the passing there','Had worn them really about the same,','','And both that morning equally lay','In leaves no step had trodden black.','Oh, I kept the first for another day!','Yet knowing how way leads on to way,','I doubted if I should ever come back.','','I shall be telling this with a sigh','Somewhere ages and ages hence:','Two roads diverged in a wood, and I—','I took the one less traveled by,','And that has made all the difference.'], 23),

('Stopping by Woods on a Snowy Evening', 'Robert Frost',
  ARRAY['Whose woods these are I think I know.','His house is in the village though;','He will not see me stopping here','To watch his woods fill up with snow.','','My little horse must think it queer','To stop without a farmhouse near','Between the woods and frozen lake','The darkest evening of the year.','','He gives his harness bells a shake','To ask if there is some mistake.','The only other sound''s the sweep','Of easy wind and downy flake.','','The woods are lovely, dark and deep,','But I have promises to keep,','And miles to go before I sleep,','And miles to go before I sleep.'], 17),

('Hope is the thing with feathers', 'Emily Dickinson',
  ARRAY['"Hope" is the thing with feathers —','That perches in the soul —','And sings the tune without the words —','And never stops — at all —','','And sweetest — in the Gale — is heard —','And sore must be the storm —','That could abash the little Bird','That kept so many warm —','','I''ve heard it in the chillest land —','And on the strangest Sea —','Yet — never — in Extremity,','It asked a crumb — of me.'], 13),

('Because I could not stop for Death', 'Emily Dickinson',
  ARRAY['Because I could not stop for Death —','He kindly stopped for me —','The Carriage held but just Ourselves —','And Immortality.','','We slowly drove — He knew no haste','And I had put away','My labor and my leisure too,','For His Civility —','','We passed the School, where Children strove','At Recess — in the Ring —','We passed the Fields of Gazing Grain —','We passed the Setting Sun —','','Or rather — He passed Us —','The Dews drew quivering and Chill —','For only Gossamer, my Gown —','My Tippet — only Tulle —','','We paused before a House that seemed','A Swelling of the Ground —','The Roof was scarcely visible —','The Cornice — in the Ground —','','Since then — ''tis Centuries — and yet','Feels shorter than the Day','I first surmised the Horses'' Heads','Were toward Eternity —'], 25),

('I Wandered Lonely as a Cloud', 'William Wordsworth',
  ARRAY['I wandered lonely as a cloud','That floats on high o''er vales and hills,','When all at once I saw a crowd,','A host, of golden daffodils;','Beside the lake, beneath the trees,','Fluttering and dancing in the breeze.','','Continuous as the stars that shine','And twinkle on the milky way,','They stretched in never-ending line','Along the margin of a bay:','Ten thousand saw I at a glance,','Tossing their heads in sprightly dance.','','The waves beside them danced; but they','Out-did the sparkling waves in glee:','A poet could not but be gay,','In such a jocund company:','I gazed — and gazed — but little thought','What wealth the show to me had brought:','','For oft, when on my couch I lie','In vacant or in pensive mood,','They flash upon that inward eye','Which is the bliss of solitude;','And then my heart with pleasure fills,','And dances with the daffodils.'], 25),

('Sonnet 18', 'William Shakespeare',
  ARRAY['Shall I compare thee to a summer''s day?','Thou art more lovely and more temperate:','Rough winds do shake the darling buds of May,','And summer''s lease hath all too short a date:','Sometime too hot the eye of heaven shines,','And often is his gold complexion dimm''d;','And every fair from fair sometime declines,','By chance, or nature''s changing course untrimm''d;','But thy eternal summer shall not fade','Nor lose possession of that fair thou ow''st;','Nor shall death brag thou wander''st in his shade,','When in eternal lines to time thou grow''st:','  So long as men can breathe, or eyes can see,','  So long lives this, and this gives life to thee.'], 14),

('Ozymandias', 'Percy Bysshe Shelley',
  ARRAY['I met a traveller from an antique land','Who said: Two vast and trunkless legs of stone','Stand in the desert. Near them, on the sand,','Half sunk, a shattered visage lies, whose frown,','And wrinkled lip, and sneer of cold command,','Tell that its sculptor well those passions read','Which yet survive, stamped on these lifeless things,','The hand that mocked them and the heart that fed:','And on the pedestal these words appear:','"My name is Ozymandias, king of kings:','Look on my works, ye Mighty, and despair!"','Nothing beside remains. Round the decay','Of that colossal wreck, boundless and bare','The lone and level sands stretch far away.'], 14),

('The Tyger', 'William Blake',
  ARRAY['Tyger Tyger, burning bright,','In the forests of the night;','What immortal hand or eye,','Could frame thy fearful symmetry?','','In what distant deeps or skies,','Burnt the fire of thine eyes?','On what wings dare he aspire?','What the hand, dare seize the fire?','','And what shoulder, & what art,','Could twist the sinews of thy heart?','And when thy heart began to beat,','What dread hand? & what dread feet?','','What the hammer? what the chain,','In what furnace was thy brain?','What the anvil? what dread grasp,','Dare its deadly terrors clasp!','','When the stars threw down their spears','And water''d heaven with their tears:','Did he smile his work to see?','Did he who made the Lamb make thee?','','Tyger Tyger, burning bright,','In the forests of the night:','What immortal hand or eye,','Dare frame thy fearful symmetry?'], 25),

('Invictus', 'William Ernest Henley',
  ARRAY['Out of the night that covers me,','Black as the pit from pole to pole,','I thank whatever gods may be','For my unconquerable soul.','','In the fell clutch of circumstance','I have not winced nor cried aloud.','Under the bludgeonings of chance','My head is bloody, but unbowed.','','Beyond this place of wrath and tears','Looms but the Horror of the shade,','And yet the menace of the years','Finds and shall find me unafraid.','','It matters not how strait the gate,','How charged with punishments the scroll,','I am the master of my fate,','I am the captain of my soul.'], 17),

('If—', 'Rudyard Kipling',
  ARRAY['If you can keep your head when all about you','Are losing theirs and blaming it on you,','If you can trust yourself when all men doubt you,','But make allowance for their doubting too;','If you can wait and not be tired by waiting,','Or being lied about, don''t deal in lies,','Or being hated, don''t give way to hating,','And yet don''t look too good, nor talk too wise:','','If you can dream — and not make dreams your master;','If you can think — and not make thoughts your aim;','If you can meet with Triumph and Disaster','And treat those two impostors just the same;','If you can bear to hear the truth you''ve spoken','Twisted by knaves to make a trap for fools,','Or watch the things you gave your life to, broken,','And stoop and build ''em up with worn-out tools:','','If you can make one heap of all your winnings','And risk it on one turn of pitch-and-toss,','And lose, and start again at your beginnings','And never breathe a word about your loss;','If you can force your heart and nerve and sinew','To serve your turn long after they are gone,','And so hold on when there is nothing in you','Except the Will which says to them: "Hold on!"','','If you can talk with crowds and keep your virtue,','Or walk with Kings — nor lose the common touch,','If neither foes nor loving friends can hurt you,','If all men count with you, but none too much;','If you can fill the unforgiving minute','With sixty seconds'' worth of distance run,','Yours is the Earth and everything that''s in it,','And — which is more — you''ll be a Man, my son!'], 33),

('O Captain! My Captain!', 'Walt Whitman',
  ARRAY['O Captain! my Captain! our fearful trip is done,','The ship has weather''d every rack, the prize we sought is won,','The port is near, the bells I hear, the people all exulting,','While follow eyes the steady keel, the vessel grim and daring;','But O heart! heart! heart!','O the bleeding drops of red,','Where on the deck my Captain lies,','Fallen cold and dead.','','O Captain! my Captain! rise up and hear the bells;','Rise up — for you the flag is flung — for you the bugle trills,','For you bouquets and ribbon''d wreaths — for you the shores a-crowding,','For you they call, the swaying mass, their eager faces turning;','Here Captain! dear father!','This arm beneath your head!','It is some dream that on the deck,','You''ve fallen cold and dead.','','My Captain does not answer, his lips are pale and still,','My father does not feel my arm, he has no pulse nor will,','The ship is anchor''d safe and sound, its voyage closed and done,','From fearful trip the victor ship comes in with object won;','Exult O shores, and ring O bells!','But I with mournful tread,','Walk the deck my Captain lies,','Fallen cold and dead.'], 25),

('Song of Myself (1)', 'Walt Whitman',
  ARRAY['I celebrate myself, and sing myself,','And what I assume you shall assume,','For every atom belonging to me as good belongs to you.','','I loafe and invite my soul,','I lean and loafe at my ease observing a spear of summer grass.','','My tongue, every atom of my blood, form''d from this soil, this air,','Born here of parents born here from parents the same, and their parents the same,','I, now thirty-seven years old in perfect health begin,','Hoping to cease not till death.','','Creeds and schools in abeyance,','Retiring back a while sufficed at what they are, but never forgotten,','I harbor for good or bad, I permit to speak at every hazard,','Nature without check with original energy.'], 15),

('Do Not Go Gentle into That Good Night', 'Dylan Thomas',
  ARRAY['Do not go gentle into that good night,','Old age should burn and rave at close of day;','Rage, rage against the dying of the light.','','Though wise men at their end know dark is right,','Because their words had forked no lightning they','Do not go gentle into that good night.','','Good men, the last wave by, crying how bright','Their frail deeds might have danced in a green bay,','Rage, rage against the dying of the light.','','Wild men who caught and sang the sun in flight,','And learn, too late, they grieved it on its way,','Do not go gentle into that good night.','','Grave men, near death, who see with blinding sight','Blind eyes could blaze like meteors and be gay,','Rage, rage against the dying of the light.','','And you, my father, there on the sad height,','Curse, bless, me now with your fierce tears, I pray.','Do not go gentle into that good night.','Rage, rage against the dying of the light.'], 23),

('The Raven (excerpt)', 'Edgar Allan Poe',
  ARRAY['Once upon a midnight dreary, while I pondered, weak and weary,','Over many a quaint and curious volume of forgotten lore —','While I nodded, nearly napping, suddenly there came a tapping,','As of some one gently rapping, rapping at my chamber door.','  "''Tis some visitor," I muttered, "tapping at my chamber door —','            Only this and nothing more."','','Ah, distinctly I remember it was in the bleak December;','And each separate dying ember wrought its ghost upon the floor.','Eagerly I wished the morrow; — vainly I had sought to borrow','From my books surcease of sorrow — sorrow for the lost Lenore —','For the rare and radiant maiden whom the angels name Lenore —','            Nameless here for evermore.'], 13),

('Annabel Lee', 'Edgar Allan Poe',
  ARRAY['It was many and many a year ago,','In a kingdom by the sea,','That a maiden there lived whom you may know','By the name of Annabel Lee;','And this maiden she lived with no other thought','Than to love and be loved by me.','','I was a child and she was a child,','In this kingdom by the sea:','But we loved with a love that was more than love —','I and my Annabel Lee;','With a love that the winged seraphs of heaven','Coveted her and me.','','And this was the reason that, long ago,','In this kingdom by the sea,','A wind blew out of a cloud, chilling','My beautiful Annabel Lee;','So that her highborn kinsman came','And bore her away from me,','To shut her up in a sepulchre','In this kingdom by the sea.'], 21),

('Ode on a Grecian Urn', 'John Keats',
  ARRAY['Thou still unravish''d bride of quietness,','Thou foster-child of silence and slow time,','Sylvan historian, who canst thus express','A flowery tale more sweetly than our rhyme:','What leaf-fring''d legend haunts about thy shape','Of deities or mortals, or of both,','In Tempe or the dales of Arcady?','What men or gods are these? What maidens loth?','What mad pursuit? What struggle to escape?','What pipes and timbrels? What wild ecstasy?'], 10),

('To Autumn', 'John Keats',
  ARRAY['Season of mists and mellow fruitfulness,','Close bosom-friend of the maturing sun;','Conspiring with him how to load and bless','With fruit the vines that round the thatch-eves run;','To bend with apples the moss''d cottage-trees,','And fill all fruit with ripeness to the core;','To swell the gourd, and plump the hazel shells','With a sweet kernel; to set budding more,','And still more, later flowers for the bees,','Until they think warm days will never cease,','For Summer has o''er-brimm''d their clammy cells.'], 11),

('She Walks in Beauty', 'Lord Byron',
  ARRAY['She walks in beauty, like the night','Of cloudless climes and starry skies;','And all that''s best of dark and bright','Meet in her aspect and her eyes;','Thus mellowed to that tender light','Which heaven to gaudy day denies.','','One shade the more, one ray the less,','Had half impaired the nameless grace','Which waves in every raven tress,','Or softly lightens o''er her face;','Where thoughts serenely sweet express,','How pure, how dear their dwelling-place.','','And on that cheek, and o''er that brow,','So soft, so calm, yet eloquent,','The smiles that win, the tints that glow,','But tell of days in goodness spent,','A mind at peace with all below,','A heart whose love is innocent!'], 19),

('The New Colossus', 'Emma Lazarus',
  ARRAY['Not like the brazen giant of Greek fame,','With conquering limbs astride from land to land;','Here at our sea-washed, sunset gates shall stand','A mighty woman with a torch, whose flame','Is the imprisoned lightning, and her name','Mother of Exiles. From her beacon-hand','Glows world-wide welcome; her mild eyes command','The air-bridged harbor that twin cities frame.','  "Keep, ancient lands, your storied pomp!" cries she','With silent lips. "Give me your tired, your poor,','Your huddled masses yearning to breathe free,','The wretched refuse of your teeming shore.','Send these, the homeless, tempest-tost to me,','I lift my lamp beside the golden door!"'], 14),

('Daffodils', 'William Wordsworth',
  ARRAY['I wandered lonely as a cloud','That floats on high o''er vales and hills,','When all at once I saw a crowd,','A host, of golden daffodils;','Beside the lake, beneath the trees,','Fluttering and dancing in the breeze.'], 6),

('Still I Rise', 'Maya Angelou',
  ARRAY['You may write me down in history','With your bitter, twisted lies,','You may tread me in the very dirt','But still, like dust, I''ll rise.','','Does my sassiness upset you?','Why are you beset with gloom?','  ''Cause I walk like I''ve got oil wells','Pumping in my living room.','','Just like moons and like suns,','With the certainty of tides,','Just like hopes springing high,','Still I''ll rise.','','Did you want to see me broken?','Bowed head and lowered eyes?','Shoulders falling down like teardrops.','Weakened by my soulful cries.','','Does my haughtiness offend you?','Don''t you take it awful hard','  ''Cause I laugh like I''ve got gold mines','Diggin'' in my own back yard.','','You may shoot me with your words,','You may cut me with your eyes,','You may kill me with your hatefulness,','But still, like air, I''ll rise.'], 26),

('Phenomenal Woman', 'Maya Angelou',
  ARRAY['Pretty women wonder where my secret lies.','I''m not cute or built to suit a fashion model''s size','But when I start to tell them,','They think I''m telling lies.','I say,','It''s in the reach of my arms','The span of my hips,','The stride of my step,','The curl of my lips.','I''m a woman','Phenomenally.','Phenomenal woman,','That''s me.'], 13),

('A Dream Within a Dream', 'Edgar Allan Poe',
  ARRAY['Take this kiss upon the brow!','And, in parting from you now,','Thus much let me avow —','You are not wrong, who deem','That my days have been a dream;','Yet if hope has flown away','In a night, or in a day,','In a vision, or in none,','Is it therefore the less gone?','All that we see or seem','Is but a dream within a dream.','','I stand amid the roar','Of a surf-tormented shore,','And I hold within my hand','Grains of the golden sand —','How few! yet how they creep','Through my fingers to the deep,','While I weep — while I weep!','O God! can I not grasp','Them with a tighter clasp?','O God! can I not save','One from the pitiless wave?','Is all that we see or seem','But a dream within a dream?'], 25),

('The Waste Land (opening)', 'T.S. Eliot',
  ARRAY['April is the cruellest month, breeding','Lilacs out of the dead land, mixing','Memory and desire, stirring','Dull roots with spring rain.','Winter kept us warm, covering','Earth in forgetful snow, feeding','A little life with dried tubers.','Summer surprised us, coming over the Starnbergersee','With a shower of rain; we stopped in the colonnade,','And went on in sunlight, into the Hofgarten,','And drank coffee, and talked for an hour.','Bin gar keine Russin, stamm'' aus Litauen, echt deutsch.','And when we were children, staying at the archduke''s,','My cousin''s, he took me out on a sled,','And I was frightened. He said, Marie,','Marie, hold on tight. And down we went.','In the mountains, there you feel free.','I read, much of the night, and go south in the winter.'], 18),

('The Love Song of J. Alfred Prufrock (opening)', 'T.S. Eliot',
  ARRAY['Let us go then, you and I,','When the evening is spread out against the sky','Like a patient etherized upon a table;','Let us go, through certain half-deserted streets,','The muttering retreats','Of restless nights in one-night cheap hotels','And sawdust restaurants with oyster-shells:','Streets that follow like a tedious argument','Of insidious intent','To lead you to an overwhelming question ...','Oh, do not ask, "What is it?"','Let us go and make our visit.','','In the room the women come and go','Talking of Michelangelo.'], 15),

('Howl (opening)', 'Allen Ginsberg',
  ARRAY['I saw the best minds of my generation destroyed by madness, starving hysterical naked,','dragging themselves through the negro streets at dawn looking for an angry fix,','angelheaded hipsters burning for the ancient heavenly connection to the starry dynamo in the machinery of night,','who poverty and tatters and hollow-eyed and high sat up smoking in the supernatural darkness of cold-water flats floating across the tops of cities contemplating jazz,'], 4),

('The Red Wheelbarrow', 'William Carlos Williams',
  ARRAY['so much depends','upon','','a red wheel','barrow','','glazed with rain','water','','beside the white','chickens.'], 11),

('This Is Just to Say', 'William Carlos Williams',
  ARRAY['I have eaten','the plums','that were in','the icebox','','and which','you were probably','saving','for breakfast','','Forgive me','they were delicious','so sweet','and so cold'], 14),

('We Real Cool', 'Gwendolyn Brooks',
  ARRAY['THE POOL PLAYERS.','SEVEN AT THE GOLDEN SHOVEL.','','We real cool. We','Left school. We','','Lurk late. We','Strike straight. We','','Sing sin. We','Thin gin. We','','Jazz June. We','Die soon.'], 14),

('Harlem', 'Langston Hughes',
  ARRAY['What happens to a dream deferred?','','Does it dry up','like a raisin in the sun?','Or fester like a sore —','And then run?','Does it stink like rotten meat?','Or crust and sugar over —','like a syrupy sweet?','','Maybe it just sags','like a heavy load.','','Or does it explode?'], 14),

('The Negro Speaks of Rivers', 'Langston Hughes',
  ARRAY['I''ve known rivers:','I''ve known rivers ancient as the world and older than the','     flow of human blood in human veins.','','My soul has grown deep like the rivers.','','I bathed in the Euphrates when dawns were young.','I built my hut near the Congo and it lulled me to sleep.','I looked upon the Nile and raised the pyramids above it.','I heard the singing of the Mississippi when Abe Lincoln','     went down to New Orleans, and I''ve seen its muddy','     bosom turn all golden in the sunset.','','I''ve known rivers:','Ancient, dusky rivers.','','My soul has grown deep like the rivers.'], 17),

('Fire and Ice', 'Robert Frost',
  ARRAY['Some say the world will end in fire,','Some say in ice.','From what I''ve tasted of desire','I hold with those who favor fire.','But if it had to perish twice,','I think I know enough of hate','To say that for destruction ice','Is also great','And would suffice.'], 9),

('Nothing Gold Can Stay', 'Robert Frost',
  ARRAY['Nature''s first green is gold,','Her hardest hue to hold.','Her early leaf''s a flower;','But only so an hour.','Then leaf subsides to leaf.','So Eden sank to grief,','So dawn goes down to day.','Nothing gold can stay.'], 8),

('Kubla Khan', 'Samuel Taylor Coleridge',
  ARRAY['In Xanadu did Kubla Khan','A stately pleasure-dome decree:','Where Alph, the sacred river, ran','Through caverns measureless to man','Down to a sunless sea.','So twice five miles of fertile ground','With walls and towers were girdled round;','And there were gardens bright with sinuous rills,','Where blossomed many an incense-bearing tree;','And here were forests ancient as the hills,','Enfolding sunny spots of greenery.'], 11),

('I Hear America Singing', 'Walt Whitman',
  ARRAY['I hear America singing, the varied carols I hear,','Those of mechanics, each one singing his as it should be blithe and strong,','The carpenter singing his as he measures his plank or beam,','The mason singing his as he makes ready for work, or leaves off work,','The boatman singing what belongs to him in his boat, the deckhand singing on the steamboat deck,','The shoemaker singing as he sits on his bench, the hatter singing as he stands,','The wood-cutter''s song, the ploughboy''s on his way in the morning, or at noon intermission or at sundown,','The delicious singing of the mother, or of the young wife at work, or of the girl sewing or washing,','Each singing what belongs to him or her and to none else,','The day what belongs to the day — at night the party of young fellows, robust, friendly,','Singing with open mouths their strong melodious songs.'], 11),

('Ode to a Nightingale (stanza 1)', 'John Keats',
  ARRAY['My heart aches, and a drowsy numbness pains','My sense, as though of hemlock I had drunk,','Or emptied some dull opiate to the drains','One minute past, and Lethe-wards had sunk:','  ''Tis not through envy of thy happy lot,','But being too happy in thine happiness, —','That thou, light-winged Dryad of the trees,','In some melodious plot','Of beechen green, and shadows numberless,','Singest of summer in full-throated ease.'], 10),

('Crossing the Bar', 'Alfred, Lord Tennyson',
  ARRAY['Sunset and evening star,','And one clear call for me!','And may there be no moaning of the bar,','When I put out to sea,','','But such a tide as moving seems asleep,','Too full for sound and foam,','When that which drew from out the boundless deep','Turns again home.','','Twilight and evening bell,','And after that the dark!','And may there be no sadness of farewell,','When I embark;','','For tho'' from out our bourne of Time and Place','The flood may bear me far,','I hope to see my Pilot face to face','When I have crost the bar.'], 18),

('The Charge of the Light Brigade', 'Alfred, Lord Tennyson',
  ARRAY['Half a league, half a league,','Half a league onward,','All in the valley of Death','Rode the six hundred.','  "Forward, the Light Brigade!','Charge for the guns!" he said:','Into the valley of Death','Rode the six hundred.','','  "Forward, the Light Brigade!"','Was there a man dismay''d?','Not tho'' the soldier knew','Someone had blunder''d:','Theirs not to make reply,','Theirs not to reason why,','Theirs but to do and die:','Into the valley of Death','Rode the six hundred.'], 18),

('When I Heard the Learn''d Astronomer', 'Walt Whitman',
  ARRAY['When I heard the learn''d astronomer,','When the proofs, the figures, were ranged in columns before me,','When I was shown the charts and diagrams, to add, divide, and measure them,','When I sitting heard the astronomer where he lectured with much applause in the lecture-room,','How soon unaccountable I became tired and sick,','Till rising and gliding out I wander''d off by myself,','In the mystical moist night-air, and from time to time,','Look''d up in perfect silence at the stars.'], 8),

('Jabberwocky', 'Lewis Carroll',
  ARRAY['''Twas brillig, and the slithy toves','Did gyre and gimble in the wabe:','All mimsy were the borogoves,','And the mome raths outgrabe.','','  "Beware the Jabberwock, my son!','The jaws that bite, the claws that catch!','Beware the Jubjub bird, and shun','The frumious Bandersnatch!"','','He took his vorpal sword in hand;','Long time the manxome foe he sought —','So rested he by the Tumtum tree','And stood awhile in thought.','','And, as in uffish thought he stood,','The Jabberwock, with eyes of flame,','Came whiffling through the tulgey wood,','And burbled as it came!','','One, two! One, two! And through and through','The vorpal blade went snicker-snack!','He left it dead, and with its head','He went galumphing back.','','  "And hast thou slain the Jabberwock?','Come to my arms, my beamish boy!','O frabjous day! Callooh! Callay!"','He chortled in his joy.','','  ''Twas brillig, and the slithy toves','Did gyre and gimble in the wabe:','All mimsy were the borogoves,','And the mome raths outgrabe.'], 30),

('Sonnet 116', 'William Shakespeare',
  ARRAY['Let me not to the marriage of true minds','Admit impediments. Love is not love','Which alters when it alteration finds,','Or bends with the remover to remove:','O no! it is an ever-fixed mark','That looks on tempests and is never shaken;','It is the star to every wandering bark,','Whose worth''s unknown, although his height be taken.','Love''s not Time''s fool, though rosy lips and cheeks','Within his bending sickle''s compass come:','Love alters not with his brief hours and weeks,','But bears it out even to the edge of doom.','  If this be error and upon me proved,','  I never writ, nor no man ever loved.'], 14),

('Sonnet 130', 'William Shakespeare',
  ARRAY['My mistress'' eyes are nothing like the sun;','Coral is far more red than her lips'' red;','If snow be white, why then her breasts are dun;','If hairs be wires, black wires grow on her head.','I have seen roses damask''d, red and white,','But no such roses see I in her cheeks;','And in some perfumes is there more delight','Than in the breath that from my mistress reeks.','I love to hear her speak, yet well I know','That music hath a far more pleasing sound;','I grant I never saw a goddess go;','My mistress, when she walks, treads on the ground:','  And yet, by heaven, I think my love as rare','  As any she belied with false compare.'], 14),

('Dover Beach', 'Matthew Arnold',
  ARRAY['The sea is calm tonight.','The tide is full, the moon lies fair','Upon the straits; on the French coast the light','Gleams and is gone; the cliffs of England stand,','Glimmering and vast, out in the tranquil bay.','Come to the window, sweet is the night-air!','Only, from the long line of spray','Where the sea meets the moon-blanched land,','Listen! you hear the grating roar','Of pebbles which the waves draw back, and fling,','At their return, up the high strand,','Begin, and cease, and then again begin,','With tremulous cadence slow, and bring','The eternal note of sadness in.'], 14),

('The Lamb', 'William Blake',
  ARRAY['Little Lamb who made thee','Dost thou know who made thee','Gave thee life & bid thee feed.','By the stream & o''er the mead;','Gave thee clothing of delight,','Softest clothing wooly bright;','Gave thee such a tender voice,','Making all the vales rejoice!','Little Lamb who made thee','Dost thou know who made thee','','Little Lamb I''ll tell thee,','Little Lamb I''ll tell thee!','He is called by thy name,','For he calls himself a Lamb:','He is meek & he is mild,','He became a little child:','I a child & thou a lamb,','We are called by his name.','Little Lamb God bless thee.','Little Lamb God bless thee.'], 21),

('Ithaka', 'C.P. Cavafy',
  ARRAY['As you set out for Ithaka','hope the voyage is a long one,','full of adventure, full of discovery.','Laistrygonians and Cyclops,','angry Poseidon — don''t be afraid of them:','you''ll never find things like that on your way','as long as you keep your thoughts raised high,','as long as a rare excitement','stirs your spirit and your body.','Laistrygonians and Cyclops,','wild Poseidon — you won''t encounter them','unless you bring them along inside your soul,','unless your soul sets them up in front of you.'], 13),

('The Second Coming', 'William Butler Yeats',
  ARRAY['Turning and turning in the widening gyre','The falcon cannot hear the falconer;','Things fall apart; the centre cannot hold;','Mere anarchy is loosed upon the world,','The blood-dimmed tide is loosed, and everywhere','The ceremony of innocence is drowned;','The best lack all conviction, while the worst','Are full of passionate intensity.','','Surely some revelation is at hand;','Surely the Second Coming is at hand.','The Second Coming! Hardly are those words out','When a vast image out of Spiritus Mundi','Troubles my sight: somewhere in sands of the desert','A shape with lion body and the head of a man,','A gaze blank and pitiless as the sun,','Is moving its slow thighs, while all about it','Reel shadows of the indignant desert birds.','The darkness drops again; but now I know','That twenty centuries of stony sleep','Were vexed to nightmare by a rocking cradle,','And what rough beast, its hour come round at last,','Slouches towards Bethlehem to be born?'], 23),

('The Lake Isle of Innisfree', 'William Butler Yeats',
  ARRAY['I will arise and go now, and go to Innisfree,','And a small cabin build there, of clay and wattles made:','Nine bean-rows will I have there, a hive for the honey-bee;','And live alone in the bee-loud glade.','','And I shall have some peace there, for peace comes dropping slow,','Dropping from the veils of the morning to where the cricket sings;','There midnight''s all a glimmer, and noon a purple glow,','And evening full of the linnet''s wings.','','I will arise and go now, for always night and day','I hear lake water lapping with low sounds by the shore;','While I stand on the roadway, or on the pavements grey,','I hear it in the deep heart''s core.'], 13),

('Dulce et Decorum Est', 'Wilfred Owen',
  ARRAY['Bent double, like old beggars under sacks,','Knock-kneed, coughing like hags, we cursed through sludge,','Till on the haunting flares we turned our backs','And towards our distant rest began to trudge.','Men marched asleep. Many had lost their boots','But limped on, blood-shod. All went lame; all blind;','Drunk with fatigue; deaf even to the hoots','Of tired, outstripped Five-Nines that dropped behind.','','Gas! Gas! Quick, boys! — An ecstasy of fumbling,','Fitting the clumsy helmets just in time;','But someone still was yelling out and stumbling,','And flound''ring like a man in fire or lime...','Dim, through the misty panes and thick green light,','As under a green sea, I saw him drowning.','','In all my dreams, before my helpless sight,','He plunges at me, guttering, choking, drowning.'], 18),

('Leisure', 'W.H. Davies',
  ARRAY['What is this life if, full of care,','We have no time to stand and stare.','','No time to stand beneath the boughs','And stare as long as sheep or cows.','','No time to see, when woods we pass,','Where squirrels hide their nuts in grass.','','No time to see, in broad daylight,','Streams full of stars, like skies at night.','','No time to turn at Beauty''s glance,','And watch her feet, how they can dance.','','No time to wait till her mouth can','Enrich that smile her eyes began.','','A poor life this if, full of care,','We have no time to stand and stare.'], 17),

('Caged Bird', 'Maya Angelou',
  ARRAY['A free bird leaps','on the back of the wind','and floats downstream','till the current ends','and dips his wing','in the orange sun rays','and dares to claim the sky.','','But a bird that stalks','down his narrow cage','can seldom see through','his bars of rage','his wings are clipped and','his feet are tied','so he opens his throat to sing.','','The caged bird sings','with a fearful trill','of things unknown','but longed for still','and his tune is heard','on the distant hill','for the caged bird','sings of freedom.'], 24),

('On the Pulse of Morning (excerpt)', 'Maya Angelou',
  ARRAY['A Rock, A River, A Tree','Hosts to species long since departed,','Marked the mastodon,','The survey of the survey,','The survey of the survey,','The survey of the survey.','','Lift up your faces, you have a piercing need','For this bright morning dawning for you.','History, despite its wrenching pain','Cannot be unlived, but if faced','With courage, need not be lived again.','','Lift up your eyes','Upon this day breaking for you.','Give birth again','To the dream.'], 17),

('Dream Variations', 'Langston Hughes',
  ARRAY['To fling my arms wide','In some place of the sun,','To whirl and to dance','Till the white day is done.','Then rest at cool evening','Beneath a tall tree','While night comes on gently,','Dark like me —','That is my dream!','','To fling my arms wide','In the face of the sun,','Dance! Whirl! Whirl!','Till the quick day is done.','Rest at pale evening...','A tall, slim tree...','Night coming tenderly','Black like me.'], 18),

('Mother to Son', 'Langston Hughes',
  ARRAY['Well, son, I''ll tell you:','Life for me ain''t been no crystal stair.','It''s had tacks in it,','And splinters,','And boards torn up,','And places with no carpet on the floor —','Bare.','But all the time','I''se been a-climbin'' on,','And reachin'' landin''s,','And turnin'' corners,','And sometimes goin'' in the dark','Where there ain''t been no light.','So boy, don''t you turn back.','Don''t you set down on the steps','  ''Cause you finds it''s kinder hard.','Don''t you fall now —','For I''se still goin'', honey,','I''se still climbin'',','And life for me ain''t been no crystal stair.'], 20),

('Funeral Blues', 'W.H. Auden',
  ARRAY['Stop all the clocks, cut off the telephone,','Prevent the dog from barking with a juicy bone,','Silence the pianos and with muffled drum','Bring out the coffin, let the mourners come.','','Let aeroplanes circle moaning overhead','Scribbling on the sky the message He Is Dead,','Put crepe bows round the white necks of the public doves,','Let the traffic policemen wear black cotton gloves.','','He was my North, my South, my East and West,','My working week and my Sunday rest,','My noon, my midnight, my talk, my song;','I thought that love would last for ever: I was wrong.','','The stars are not wanted now: put out every one;','Pack up the moon and dismantle the sun;','Pour away the ocean and sweep up the wood.','For nothing now can ever come to any good.'], 17),

('Musée des Beaux Arts', 'W.H. Auden',
  ARRAY['About suffering they were never wrong,','The Old Masters: how well they understood','Its human position; how it takes place','While someone else is eating or opening a window or just walking dully along;','How, when the aged are reverently, passionately waiting','For the miraculous birth, there always must be','Children who did not specially want it to happen, skating','On a pond at the edge of the wood:','They never forgot','That even the dreadful martyrdom must run its course','Anyhow in a corner, some untidy spot','Where the dogs go on with their doggy life and the torturer''s horse','Scratches its innocent behind on a tree.'], 13),

('The Hollow Men (opening)', 'T.S. Eliot',
  ARRAY['We are the hollow men','We are the stuffed men','Leaning together','Headpiece filled with straw. Alas!','Our dried voices, when','We whisper together','Are quiet and meaningless','As wind in dry grass','Or rats'' feet over broken glass','In our dry cellar','','Shape without form, shade without colour,','Paralysed force, gesture without motion;'], 13),

('somewhere i have never travelled,gladly beyond', 'E.E. Cummings',
  ARRAY['somewhere i have never travelled,gladly beyond','any experience,your eyes have their silence:','in your most frail gesture are things which enclose me,','or which i cannot touch because they are too near','','your slightest look easily will unclose me','though i have closed myself as fingers,','you open always petal by petal myself as Spring opens','(touching skilfully,mysteriously)her first rose','','or if your wish be to close me,i and','my life will shut very beautifully,suddenly,','as when the heart of this flower imagines','the snow carefully everywhere descending;'], 12);

