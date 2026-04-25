# Screencasting studio using WebRTC made with Codex and GPT 5.5 

Web Recorder Studio is a browser-based demonstration for recording a selected screen source with optional webcam and audio capture. It was built as a culture-coding session around memo-driven development, visual requirements, and interactive polish for an OpenAI Developers Gallery submission.

This project is also a demonstration of building with Codex and GPT-5.5. The companion memo, [README-memo-010.md](./README-memo-010.md), documents the work chapter by chapter so others can study how the app was shaped through prompts, observations, post-mortems, and implementation passes.

## Building process introduction

It started with a use case and a reference to the underlying browser support. The use case is the need for screencasting, and the underlying browser support is the WebRTC infrastructure. The development started with a Codex session, with the 5.5 GPT model through visual code in medium level. Interactions in the chat produced a memo document and many chapters served to log the evolution.

The app uses WebRTC browser APIs for screen, camera, and microphone capture, plus CSS/JavaScript effects for media panel translation, zoom, rotation, shake, and a lightning sweep.

## Demo video

https://www.youtube.com/watch?v=knGQcggyCo4

## Live page

https://taboca.github.io/culture-coding-web-recorder-effects/

## Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Controls

* `Shift+P` toggles the right control panel.
* `Shift+Click` on the media pane toggles target zoom, translation, and perspective rotation.
* `Shift+E` starts recording or toggles pause/resume.
* `Shift+S` shakes the media pane.
* `Shift+R` rotates the media pane in 3D.
* `Shift+L` triggers a lightning sweep effect.

## References

* WebRTC samples project: https://github.com/webrtc/samples
* Author site: https://mgalli.com

## License

This restored repository is available under the MIT License, copyright 2026 Marcio Galli.

```text
MIT License

Copyright (c) 2026 Marcio Galli

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
