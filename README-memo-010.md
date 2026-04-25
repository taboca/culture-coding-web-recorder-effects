# Setup for Web Recorder Studio Demonstration

* Author Marcio S Galli

## Introduction

* We are creating a demonstration to submit to the OpenAI Developers Gallery.
* The goal of this session is to develop the whole demonstration in one complete session while exercising practical app-building workflows.
* The session should explore practices such as sending image prompts as requirements using voice.
* The session should also explore developing through memos instead of direct chat interaction.
* We still want a demo that is meaningful to people; that is why we chose a screen recorder using WebRTC.

## Chapter 1, Context

### WebRTC Samples Reference Content

* We want to grab the content from the git clone https://github.com/webrtc/samples.git and keep that under a `DOCS` directory.

### What to learn from the Web RTC case?

* We want to extract the knowledge process for just recording the screencast media and the webcam.

## Chapter 2, Initial Implementation

### Initial user case

* The end user should see a page where the desktop is centered in the page view area, respecting the aspect ratio of the source.
* The webcam should be displayed as a circle with `50%` radius.
* The camera control panel should appear on the right with `SHIFT+P`, fixed on top.
* Pressing `SHIFT+P` again toggles the camera control panel off.
* Sub panels should remain uncluttered:

* Source
* Camera source
* Audio, if necessary
* Record, pause, stop, and play

### Visual layout

* Use a dark neutral page background around the main recording canvas.
* Center the desktop source inside the page with generous margins on all sides.
* Render the desktop source as a large rounded rectangle with a subtle shadow.
* Preserve the source aspect ratio and avoid stretching or cropping the desktop capture.
* The webcam overlay image should be a floating element, render the webcam as a large circle using `border-radius: 50%`, give the webcam circle a subtle shadow so it reads as an overlay above the desktop. Keep the webcam large enough for the speaker to be recognizable, but not so large that it hides the main source content.
* Allow for the control panel to be hidden (shift+p) 

### Web server

* Serve from a `./public` directory using Express.
* Use `package.json`.
* Use Node through `nvm`, version 20 or later.
* Use JavaScript modules.

## Chapter 3, Version 2

### Visual debugging element

* Over panel `P`, add a debugging element.
* Add a checkbox that enables a cross in the center of the page.
* The cross should sit aside from the media element, but it will likely coincide with the media center when the media capture area is vertically and horizontally centered.

### Refinements to the UI

* No dock bottom bar, straight source there.
* Panel on the right, takes full height, no shadow.
* `Shift+P` toggles panel visibility on and off.

## Chapter 4, Offscreen Recording and Recording Subject

### Question and answer

* Question: after the user picks a source, can we record without showing it onscreen?
* Answer: yes, the selected `MediaStream` can be recorded directly with `MediaRecorder`; the preview video is optional.
* The browser or operating system will still show its own screen-sharing indicator for privacy.

### Recording Subject

* Add a panel titled `Recording Subject`.
* Include `[x] source` to control whether the selected display source is part of the recording.
* Include `[x] audio` to control whether audio capture is part of the recording.
* After the user picks the source, show that source inline as a small media preview inside the panel.
* When the user taps record, hide the panel and start recording.
* Add a red circle on the right side to show whether recording is on or off.

## Chapter 5, Observations

### Post-mortem

* Marcio observed that we have one source, but actually that first row with the source is the one for the middle media area.
* So we need `Subject` to be the 3rd panel.
* As the user picks, the user will pick the whole page, so the point is that we are recording the whole page with the camera.
* There is no way for the code to know that ahead of time; the code depends on the user's choice.
* Keep the 1st panel as source for the media area in the middle.
* Keep the 2nd panel as webcam.
* Keep the 3rd panel as subject with audio and another media.
* That extra media is the visible preview in the sidebar.
* If recording is going on, assume that the hidden panel will not cause any problem.

## Chapter 6, Media Point Centering Effect

### Shift-click centering

* It should be possible to use `Shift+Click` on a pixel position inside the middle media area.
* The app can calculate the difference between the clicked point and the visual center point.
* Use `dx = centerX - clickX` and `dy = centerY - clickY`.
* Apply that delta as a CSS `translate()` effect to move the clicked media point toward the center cross.
* The transform should be cumulative so repeated `Shift+Click` actions can keep adjusting the media position.
* This effect is for visual alignment of the media in the stage.
* If the media uses `object-fit: contain`, the app may need to account for letterboxing to map the clicked point precisely to the rendered video rectangle.

## Chapter 6.10, Post-mortem on Media Point Centering

### Corrections

* The first implementation moved the inner media element inside the target.
* The intended behavior is to move the whole target pane.
* The click position should be measured as `x` and `y` from the center of the media recorded pane.
* The movement should place the clicked point in the center of the page viewpoint.
* Example: if the pane is `320x240` and starts centered, clicking `0,0` should translate the pane right by `160` and down by `120`.
* The transform should be absolute from the clicked point, not cumulative from the previous transform.
* Example: after the `0,0` click moves the pane, clicking the source center should apply `-160,-120` relative to that visible state so the pane appears centered again.
* The corrected formula is `panX = paneWidth / 2 - clickX` and `panY = paneHeight / 2 - clickY`.

## Chapter 7, Polish

### Final details

* Make the webcam overlay draggable.

## Chapter 8, Post-mortem on Webcam Overlay Anomaly

### Observation

* Marcio observed an anomaly with the webcam overlay.
* The webcam circle shadow is visible as expected.
* A square projection of the camera also appears underneath the circular webcam.
* The square projection seems visible only when the webcam is positioned on top of the media area.
* The screenshot shows the circular webcam overlay, but also a rectangular camera area behind it.
* This suggests that the webcam video is visually clipped as a circle, while another rectangular rendering layer or projection is still visible in the overlap with the captured media.
* This should be investigated as a polish issue for the webcam overlay rendering.

## Chapter 9, Effects Zoom Into Point

### Shift-click zoom model

* Return to the click-to-translate effect.
* `Shift+Click` should also zoom into the clicked point.
* The zoom is about the panel media target, not only the inner media element.
* The clicked point becomes the transform origin for the zoom.
* The operation is a two-step calculation: first identify the clicked point, then translate that point toward the center of the page viewpoint while zooming into it.
* The implementation should feel like one smooth move "to that" target.
* The zoom and translation should be calculation-driven, not a separate visual guess.

## Chapter 10, Effects Rotate Media Pane

### Shift-R rotation

* Under effects, `Shift+R` should rotate the media panel.
* Rotate the media panel `360deg` on `x`, `y`, and `z`.
* Use CSS perspective of `500px`.
* The rotation effect should apply to the same media panel used by the translate, zoom, and shake effects.

## Chapter 11, Effects Post-mortem

### Final effect behavior

* The `Shift+Click` effect should behave as a two-state toggle.
* On the first `Shift+Click`, animate and zoom into the clicked target point.
* On the second `Shift+Click`, return the media panel to the prior centered normal condition.
* The user should be able to repeat that rhythm: target animate zoom, then back.
* The `Shift+R` effect rotates the same media panel in 3D.
* The rotation should use `360deg` on `x`, `y`, and `z` with `perspective(500px)`.

## Chapter 12, After polish for gallery

### Gallery submission

* Doc on gallery: https://openai.com/form/showcase-submission/
* The main page should not show scrollbars.
* For GitHub Pages, keep a static copy of the app at the repository root because Pages may not serve directly from `public/` in the intended setup.
* `Shift+Click` should animate the media panel with translate, zoom, and a small rotation effect.
* `Shift+Click` rotation should be calculated from the clicked point relative to center, with a maximum of `7deg` on `x` and `y`, and `0deg` on `z`.
* The temporary rotation debug fields should be removed from the sidebar after validating the heuristic.
* `Shift+L` should trigger a lightning strike effect: a quick diagonal gradient line passing from top-left to bottom-right and vanishing in about `0.2` seconds.

### Basic submission information

* The form is for submitting apps, demos, games, products, creative experiments, and open-source projects built with OpenAI models.
* The gallery aims to highlight projects that inspire developers and show what is possible with OpenAI APIs and models.
* About you: first name, last name, email, and optional website or social profile.
* About the project: project type, whether Codex was used, whether another coding agent was used, tech stack, use cases, showcased capability, OpenAI models and APIs used, other models or APIs used, and a short description of the building process.
* Project details: public GitHub repository or hosted URL, setup steps, project title, project tagline, project description, author display name, and public cover image URL.
* The setup steps field has a `500` character maximum.
* The title should be short, descriptive, and should not include tech stack details.
* The tagline should be short, around `1-2` sentences maximum.
* The project description can include more detail, around `1-3` paragraphs.
* The cover image should be a clear screenshot or visual representing the most important part of the project.
* Terms note: submitted showcase content remains the submitter's content, but OpenAI receives a license to use, test, store, copy, display, modify, distribute, and promote it for the program.
* Terms note: the submission must not imply OpenAI endorsement, certification, partnership, or support unless agreed in writing.
* Terms note: OpenAI may reject or remove showcase content at any time.
* The form requires attestation before submitting.
