-- Seed data extracted from data/site.json (2026-10-09).
-- The portrait asset is in storage/portrait.png; upload it to Supabase Storage,
-- then replace the empty `portrait` value below with its public URL.

insert into public.site_config (key, value) values
  ('heroName', 'YOMNA EHAB'),
  ('heroTitle', 'VIDEO EDITOR + MOTION DESIGNER'),
  ('heroIntro', 'Turning ideas into stories people feel.'),
  ('ctaPrimaryLabel', 'View My Work →'),
  ('showreelUrl', ''),
  ('aboutHeading', 'ABOUT ME'),
  ('aboutP1', 'I''m Yomna Ehab, a video editor and motion designer who loves turning ideas into visual stories. I enjoy mixing creativity with strategy to create content that not only looks good, but also connects with people.'),
  ('aboutP2', 'Whether it''s a brand film, a social media campaign, or a motion graphic, I always aim to make work that feels real, engaging, and memorable.'),
  ('aboutQuote', 'Stories move people ♡'),
  ('aboutCtaLabel', 'Let''s Work Together →'),
  ('eduQualification', 'Bachelor of Mass Communication'),
  ('eduInstitution', 'Cairo University'),
  ('eduProgram', 'Digital Media Program'),
  ('eduGpa', '3.9'),
  ('eduGraduation', 'July 2025'),
  ('ctaFinalHeading', 'LET''S MAKE SOMETHING GREAT TOGETHER'),
  ('ctaFinalSentence', 'Got a project in mind? I''d love to hear about it!'),
  ('ctaFinalButton', 'Let''s Work Together →'),
  ('contactIntro', 'I''m always excited to collaborate on new projects, creative ideas, or just talk about stories that inspire.'),
  ('contactEmail', 'yomnaehabtdf@gmail.com'),
  ('contactLocation', 'Cairo, Egypt — open to remote work worldwide'),
  ('linkedin', 'https://linkedin.com/'),
  ('instagram', 'https://instagram.com/yamnona.elkamona'),
  ('cvName', ''),
  ('portrait', ''),
  ('contactFormTitle', 'Send Me a Message'),
  ('contactFormSubtitle', 'Tell me about your project and I''ll get back to you soon!'),
  ('contactFormButton', '✈ Send Message'),
  ('contactFormPlaceholder', 'Tell me about your project, goals, or any ideas you have...')
on conflict (key) do update set value = excluded.value;

insert into public.skills (name, sort_order) values
  ('Directing skills', 1),
  ('VFX and SFX', 2),
  ('Storytelling', 3),
  ('Digital Marketing', 4),
  ('Computer Skills (Word, PowerPoint, Excel)', 5),
  ('SEO', 6),
  ('AI tools (Veo 3, Google Flow, Adobe Podcast, Leonardo AI, D-ID, Gemini, Higgsfield)', 7),
  ('Creative Thinking', 8),
  ('Team Collaboration', 9),
  ('Communication Skills', 10),
  ('Time Management', 11),
  ('Problem Solving', 12),
  ('Leadership', 13),
  ('Attention to Detail', 14)
on conflict (name) do update set sort_order = excluded.sort_order;

insert into public.software (name, sort_order) values
  ('After Effects', 1),
  ('Premiere Pro', 2),
  ('Audition', 3),
  ('Illustrator', 4),
  ('Photoshop', 5),
  ('CapCut', 6),
  ('DaVinci Resolve', 7),
  ('Blender', 8)
on conflict (name) do update set sort_order = excluded.sort_order;

insert into public.brands (name, sort_order) values
  ('ARQAM', 1),
  ('Bubblegum', 2),
  ('The Good News', 3),
  ('Meraki & Beyond', 4),
  ('Kijamii', 5),
  ('Heinz', 6)
on conflict (name) do update set sort_order = excluded.sort_order;

insert into public.contact_project_types (label, sort_order) values
  ('Video Editing', 1),
  ('Motion Design', 2),
  ('Social Media Content', 3),
  ('Campaign', 4),
  ('Event Visuals', 5),
  ('Other', 6)
on conflict (label) do update set sort_order = excluded.sort_order;

insert into public.contact_budget_options (label, sort_order) values
  ('Under $500', 1),
  ('$500 – $1,500', 2),
  ('$1,500 – $5,000', 3),
  ('$5,000+', 4),
  ('Not sure yet', 5)
on conflict (label) do update set sort_order = excluded.sort_order;

insert into public.career (dates, company, role, sort_order) values
  ('February 2026 – Present', 'Meraki & Beyond GCC, Egypt — Full-time', 'Motion Graphic Designer & Video Editor', 1),
  ('September 2025 – February 2026', 'Bubblegum Agency (Egypt) — Full-time', 'Video Editor', 2),
  ('January 2025 – Present', 'The Good News — Remote', 'Freelance Motion Graphic Designer & Video Editor', 3),
  ('August 2024 – September 2024', 'ARQAM Sports Agency (Egypt)', 'Video Editor Intern', 4),
  ('July 2022 – September 2022', 'Kijamii (Egypt)', 'Motion Graphic Designer & Video Editor Intern', 5)
on conflict (sort_order) do update set dates = excluded.dates, company = excluded.company, role = excluded.role;

insert into public.projects (id, title, client, main_category, type, description, role, software, thumb_color, video_url, original_link, views, featured, published, sort_order) values
  (1, 'ARQAM — Official Highlights', 'CAF / ARQAM', 'Video Editing', 'Promos', 'Collection of videos edited during internship, published on CAF''s official pages. The content gained strong reach and engagement.', 'Video editor — cut and paced highlight reels for official distribution.', array['Premiere Pro']::text[], '#123b34', '', '', '4.2M', true, true, 1),
  (2, 'ARQAM — Unofficial Edits', 'ARQAM Sports Agency', 'Video Editing', 'Promos', 'Unofficial edits including promos, match highlights and recap videos made during the internship.', 'Video editor.', array['Premiere Pro']::text[], '#1d6a5e', '', '', '', false, true, 2),
  (3, 'Dovbyk LaLiga Reel', 'TikTok', 'Video Editing', 'Reels', 'Short highlight reel of Dovbyk''s standout skills in La Liga, tailored for fast-paced mobile viewing.', 'Editor — paced for TikTok engagement.', array['Premiere Pro']::text[], '#2b4d8f', '', '', '', false, true, 3),
  (4, 'The Good News', 'by Mariam Solika', 'Video Editing', 'Social Media', 'Video editing for The Good News social content using Premiere Pro.', 'Video editor.', array['Premiere Pro']::text[], '#8a5a3b', '', '', '231k', false, true, 4),
  (5, 'Yopolis Creamy Creations', 'Yopolis', 'Video Editing', 'Campaigns', 'Playful brand video editing for Yopolis Creamy Creations using Premiere Pro.', 'Video editor.', array['Premiere Pro']::text[], '#ec6fa6', '', '', '419k', true, true, 5),
  (6, 'Heinz Arabia', 'Heinz', 'Motion Design', 'Campaigns', 'Motion design and editing for a Heinz Arabia campaign using Premiere Pro.', 'Motion designer & editor.', array['Premiere Pro', 'After Effects']::text[], '#c0392b', '', '', '', true, true, 6),
  (7, 'Red Bull', 'Hana Gouda', 'Video Editing', 'Promos', 'Video editing for Red Bull featuring Hana Gouda using Premiere Pro.', 'Video editor.', array['Premiere Pro']::text[], '#16325c', '', '', '344k', false, true, 7),
  (8, 'LIWAN — Event Pitch Reveal', 'LIWAN', 'Motion Design', 'Event Visuals', 'Event pitch reveal motion graphics for LIWAN.', 'Motion designer.', array['After Effects']::text[], '#7b3fb0', '', '', '', false, true, 8),
  (9, 'El Abd Patisserie', 'El Abd Patisserie', 'Video Editing', 'Campaigns', 'Video editing for El Abd Patisserie using Premiere Pro.', 'Video editor.', array['Premiere Pro']::text[], '#d8901f', '', '', '', false, true, 9),
  (10, 'Bonjorno Cafe', 'Bonjorno Cafe', 'Video Editing', 'Campaigns', 'Video editing for Bonjorno Cafe using Premiere Pro.', 'Video editor.', array['Premiere Pro']::text[], '#6b4a2b', '', '', '', false, true, 10),
  (11, 'Dreem Food Services', 'Dreem', 'Video Editing', 'Campaigns', 'Video editing for Dreem Food Services using Premiere Pro.', 'Video editor.', array['Premiere Pro']::text[], '#3c8f5c', '', '', '', false, true, 11),
  (12, 'Basem El Sherbiny', 'Basem El Sherbiny', 'Video Editing', 'Social Media', 'Video editing for Basem El Sherbiny using Premiere Pro.', 'Video editor.', array['Premiere Pro']::text[], '#1d6a5e', '', '', '', false, true, 12),
  (13, 'Bubblegum Factory', 'Bubblegum Factory', 'Video Editing', 'Campaigns', 'Video editing with Bubblegum Factory using Premiere Pro.', 'Video editor.', array['Premiere Pro']::text[], '#ec6fa6', '', '', '', false, true, 13),
  (14, 'Glade', 'Glade', 'Motion Design', 'Campaigns', 'Motion design for a Glade campaign using Premiere Pro.', 'Motion designer.', array['Premiere Pro', 'After Effects']::text[], '#2e7d32', '', '', '', false, true, 14),
  (15, 'TikTok Ads — Beko & Dettol', 'Beko & Dettol', 'Motion Design', 'Campaigns', 'Ad videos using AI tools, Premiere Pro and CapCut.', 'Editor & motion designer.', array['Premiere Pro', 'CapCut']::text[], '#123b34', '', '', '', false, true, 15),
  (16, 'TikTok Ads — Molfix & Familia', 'Molfix & Familia', 'Motion Design', 'Campaigns', 'Remix ad videos using AI tools, Premiere Pro and CapCut.', 'Editor & motion designer.', array['Premiere Pro', 'CapCut']::text[], '#d8901f', '', '', '', false, true, 16),
  (17, 'Hekayet Athar — Short Film', 'Hekayet Athar Competition', 'Video Editing', 'Other', 'Directed and edited a short film about a man revisiting his childhood memories in Old Cairo (Fatimid Cairo).', 'Director & editor — full film and trailer.', array['Premiere Pro']::text[], '#134f45', '', '', '', false, true, 17),
  (18, 'Umm Kulthum Museum', 'Umm Kulthum Museum', 'Video Editing', 'Other', 'Feature celebrating the legendary singer''s legacy, combining archival footage and personal items into a visual narrative.', 'Video editor — rhythm, transitions and emotional tone.', array['Premiere Pro']::text[], '#8a5a3b', '', '', '', false, true, 18),
  (19, 'El-Fawakher Village', 'El-Fawakher Village', 'Video Editing', 'Other', 'Documentary-style feature on a pottery village in Fustat, blending storytelling with emotional visuals.', 'Director & video editor.', array['Premiere Pro']::text[], '#6b4a2b', '', '', '', false, true, 19),
  (20, 'Gayer-Anderson Museum', 'Gayer-Anderson Museum', 'Motion Design', 'Other', 'Feature with green screen and custom VFX enhancing storytelling scenes, from concept to edit.', 'Director, editor & VFX.', array['Premiere Pro', 'After Effects']::text[], '#7b3fb0', '', '', '', false, true, 20),
  (21, 'Newstalgia — Flea Market Reel', 'Newstalgia', 'Video Editing', 'Reels', 'Real-world reel from the Newstalgia graduation project at Cairo Flea Market.', 'Video editor.', array['Premiere Pro']::text[], '#6b4a2b', '', '', '', true, true, 21),
  (22, 'Newstalgia — Hobbies Promo & Episode', 'Newstalgia', 'Video Editing', 'Promos', 'Directed and edited an episode exploring how hobbies differ across generations, part of the Newstalgia graduation project.', 'Director & editor.', array['Premiere Pro']::text[], '#123b34', '', '', '', false, true, 22),
  (23, 'Life of a Sailor', 'Nile Felucca Feature', 'Video Editing', 'Other', 'A feature capturing the daily life of a traditional Nile boatman sailing a felucca.', 'Video editor — emotional tone and pacing.', array['Premiere Pro']::text[], '#16325c', '', '', '', false, true, 23),
  (24, 'AI Tower Launch Event', 'Al Alaia Developments', 'Motion Design', 'Event Visuals', 'Kinetic screen versions created for an AI tower launch event.', 'Motion designer.', array['After Effects']::text[], '#16325c', '', '', '', false, true, 24)
on conflict (id) do update set title = excluded.title, client = excluded.client, main_category = excluded.main_category, type = excluded.type, description = excluded.description, role = excluded.role, software = excluded.software, thumb_color = excluded.thumb_color, video_url = excluded.video_url, original_link = excluded.original_link, views = excluded.views, featured = excluded.featured, published = excluded.published, sort_order = excluded.sort_order;

insert into public.inquiries (id, name, email, project_type, budget, message, submitted_at, is_read, is_archived) values
  ('e7d47073-bce9-4ed5-8c38-1d7ab2e1ec97', 'mohamed', 'saeed@gmail.com', 'Video Editing', 'Under $500', 'mmmmm', '2026-10-08T15:52:11.501Z'::timestamptz, false, false)
on conflict (id) do nothing;
