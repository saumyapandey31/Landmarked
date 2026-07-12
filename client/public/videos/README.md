# Hero background video

Place your landing page background video here as `hero.mp4`
(and ideally a compressed `hero.webm` for smaller file size / broader support).

Recommended specs:
- 1920x1080 or larger, 10-20s loop, no audio needed (it will be muted + autoplayed)
- Keep it under ~8MB for fast load — compress with HandBrake or ffmpeg:
  `ffmpeg -i source.mov -vcodec libx264 -crf 28 -an hero.mp4`

Until you add your own file, the Hero component falls back to a static
travel photo so the page still looks complete.
