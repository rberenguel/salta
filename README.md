# Salta

> saltar

> to jump

---

A Chrome extension to visually jump across tabs. I wanted to see if I could do it with my current Chrome extension knowledge.

## What does it do?

When invoking the extension (keyboard shortcut, internal Chrome extension messaging, or pressing the extension button) a new tab with images of all your tabs will open.

- Clicking any of the images takes you to that tab.
- Pressing `Ctrl` or `Tab` will enable/disable zoom-on-hover on the screenshots.
- Typing anything in the page will filter pages containing that text in the title or URL.
  - Matching tabs are highlighted (highlighted border, hypersaturated).
  - If zoom-on-hover is enabled, only highlighted tabs will get it.
  - If only one tab matches, pressing enter opens it.
  - Press `Escape` to cancel, or delete to remove text.

## Demo video

Click the image to open the video (youtube). If you don't want to do that, you can find the video in `media/salta-demo-v01.mov`.

[![](https://raw.githubusercontent.com/rberenguel/salta/refs/heads/gh-pages/media/salta-v0.1.jpg)](https://youtu.be/Y5DxPO1nzjE&mode=theatre)

## Caveats

- For now this is assuming one window (I think, I haven't bothered checking what happens with multiple windows… yet)
- This requires the "all-sites" permission, which is pretty large, I know.
- There is a slight delay required when switching tabs before an active tab screenshot can be taken. This means that sometimes
  tabs have no valid screenshot. I go around this by picking _any_ of the screenshots seen so far and blurring it heavily, so
  it acts as a placeholder.
- Although this _can_ be invoked from other extensions (I tried that with [nt](https://www.github.com/rberenguel/nt)), `activeTab` is
  an annoying permission and will complain about not having been "properly" invoked. So, the page with tabs shows kind of empty, and you
  need to press `Cmd-R` (or whatever you have as "refresh") to get it to show.
- I have added a small delay after loading all screenshots and before I run a size normalization across all of them. This is hacky.

## TODO

- [x] Clean up a bit the code
- [ ] Clean up a bit the code (needs more passes)
- [ ] Can I test anything easily?
- [x] Add an `X` so I can cross tabs from this view.
  - [x] This requires a refactor of all the internal grid construction logic.
- [x] I may need pagination if there are _way_ too many tabs open.
  - [ ] Pagination-hover highlighting should not trigger when there are no more pages.
- [ ] Handle multiple (as in separate) windows.
- [ ] Add some proper event listener instead of the hacky timeout to resize.

## Credits

- Icon: Gemini via Imagen 3.
- Gemini helped fight with Chrome permissions, but I ended up having to read (again) too much of its documentation. Yes, this is verbatim from [Goita](https://www.github.com/rberenguel/goita). Again.
- Added the following open source fonts:
  - [Roboto Mono](https://fonts.google.com/specimen/Roboto+Mono)
  - [Reforma 1969](https://pampatype.com/reforma) (or from [FontSquirrel](https://www.fontsquirrel.com/fonts/reforma) to see the license)
  - [Inter](https://rsms.me/inter/)
  - [Monoid](https://larsenwork.com/monoid/)
