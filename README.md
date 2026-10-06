# GitHub Image Lightbox

A Firefox extension that opens GitHub image attachments in a fullscreen overlay
on top of the page, instead of navigating away to the raw image.

Clicking a screenshot in an issue, pull request, discussion or comment normally
replaces the GitHub page with the bare image. With this extension the image
opens in a lightbox and GitHub stays right where you left it.

![Image attachment opened in the lightbox over a GitHub issue](screenshots/lightbox.jpg)

Arrow keys move between all attachments on the page, so screenshots from
different comments can be compared without leaving the thread.

![Carousel showing the first of eight attachments](screenshots/carousel.jpg)

## Features

- Click an attachment to open it fullscreen. Click the image to toggle between
  fit-to-screen and 100% size.
- Left/Right arrow keys, or the on-screen arrows, move between all image
  attachments on the page (description and every comment, in page order). This
  makes it easy to compare screenshots posted in different comments. A counter
  shows the position.
- Esc, the Close button, or a click on the dark backdrop closes the overlay.
- "Open original" opens the raw image in a new tab, like GitHub does by default.
- Cmd/Ctrl/Shift/middle clicks are left untouched, so the browser's own
  open-in-new-tab behaviour still works.
- No permissions, no network requests, no tracking. It is a single content
  script that runs on `github.com`.

## Install

### From a release (recommended)

1. Download the latest `.xpi` from the
   [Releases](https://github.com/PauloSankovic/github-image-lightbox/releases) page.
2. Open the downloaded file in Firefox (drag it into a Firefox window or open it
   via `File > Open File`).
3. Confirm the "Add" prompt.

### Temporary, from source

Useful for trying it out or for development. The extension is removed when
Firefox restarts.

1. Clone this repository.
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Click "Load Temporary Add-on..." and select the `manifest.json` file.

Requires Firefox 140 or newer.

## Development

```sh
npx web-ext lint
npx web-ext run --start-url https://github.com/microsoft/vscode/issues/339363
npx web-ext build
```

`web-ext run` launches a separate Firefox profile with the extension loaded and
reloads it whenever a file changes.

## License

[MIT](LICENSE)
