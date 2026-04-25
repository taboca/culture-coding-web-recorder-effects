const screenPreview = document.querySelector('#screenPreview');
const screenEmpty = document.querySelector('#screenEmpty');
const desktopFrame = document.querySelector('.desktop-frame');
const cameraPreview = document.querySelector('#cameraPreview');
const cameraVideo = document.querySelector('#cameraVideo');
const controlPanel = document.querySelector('#controlPanel');
const hidePanelButton = document.querySelector('#hidePanelButton');
const screenButton = document.querySelector('#screenButton');
const cameraButton = document.querySelector('#cameraButton');
const subjectSourceToggle = document.querySelector('#subjectSourceToggle');
const subjectAudioToggle = document.querySelector('#subjectAudioToggle');
const subjectSourceButton = document.querySelector('#subjectSourceButton');
const screenLabel = document.querySelector('#screenLabel');
const cameraLabel = document.querySelector('#cameraLabel');
const subjectLabel = document.querySelector('#subjectLabel');
const audioLabel = document.querySelector('#audioLabel');
const statusText = document.querySelector('#statusText');
const recordButton = document.querySelector('#recordButton');
const pauseButton = document.querySelector('#pauseButton');
const stopButton = document.querySelector('#stopButton');
const playButton = document.querySelector('#playButton');
const playback = document.querySelector('#playback');
const centerCross = document.querySelector('#centerCross');
const centerCrossToggle = document.querySelector('#centerCrossToggle');
const subjectPanelPreview = document.querySelector('#subjectPanelPreview');
const recordingIndicator = document.querySelector('#recordingIndicator');
const lightningStrike = document.querySelector('#lightningStrike');
const tiltXInput = document.querySelector('#tiltXInput');
const tiltYInput = document.querySelector('#tiltYInput');
const tiltZInput = document.querySelector('#tiltZInput');

let screenStream;
let cameraStream;
let subjectStream;
let micStream;
let recorder;
let chunks = [];
let recordingUrl;
let screenPanX = 0;
let screenPanY = 0;
let screenZoom = 1;
let screenTargetActive = false;
let cameraPanX = 0;
let cameraPanY = 0;
let cameraDrag;
let shakeTimer;
let rotateTimer;
let lightningTimer;

function setStatus(message) {
  statusText.textContent = message;
}

function togglePanel(force) {
  const shouldShow = typeof force === 'boolean' ? force : controlPanel.hidden;
  controlPanel.hidden = !shouldShow;
}

function isPanelToggleShortcut(event) {
  const key = event.key?.toLowerCase();
  return event.shiftKey && (key === 'p' || event.code === 'KeyP');
}

function isRotateShortcut(event) {
  const key = event.key?.toLowerCase();
  return event.shiftKey && (key === 'r' || event.code === 'KeyR');
}

function isShakeShortcut(event) {
  const key = event.key?.toLowerCase();
  return event.shiftKey && (key === 's' || event.code === 'KeyS');
}

function isLightningShortcut(event) {
  const key = event.key?.toLowerCase();
  return event.shiftKey && (key === 'l' || event.code === 'KeyL');
}

function randomTilt(maxDegrees = 5) {
  return `${Math.random() * maxDegrees * 2 - maxDegrees}deg`;
}

function setTilt(x, y, z) {
  desktopFrame.style.setProperty('--tilt-x', `${x}deg`);
  desktopFrame.style.setProperty('--tilt-y', `${y}deg`);
  desktopFrame.style.setProperty('--tilt-z', `${z}deg`);
}

function syncTiltInputs(x, y, z) {
  tiltXInput.value = x.toFixed(1).replace(/\.0$/, '');
  tiltYInput.value = y.toFixed(1).replace(/\.0$/, '');
  tiltZInput.value = z.toFixed(1).replace(/\.0$/, '');
}

function applyTiltInputs() {
  setTilt(
    Number.parseFloat(tiltXInput.value) || 0,
    Number.parseFloat(tiltYInput.value) || 0,
    Number.parseFloat(tiltZInput.value) || 0
  );
}

function updateScreenPan() {
  desktopFrame.style.setProperty('--pan-x', `${screenPanX}px`);
  desktopFrame.style.setProperty('--pan-y', `${screenPanY}px`);
  desktopFrame.style.setProperty('--zoom', screenZoom.toString());
}

function resetScreenEffect() {
  screenPanX = 0;
  screenPanY = 0;
  screenZoom = 1;
  screenTargetActive = false;
  desktopFrame.style.setProperty('--origin-x', '50%');
  desktopFrame.style.setProperty('--origin-y', '50%');
  setTilt(0, 0, 0);
  syncTiltInputs(0, 0, 0);
  updateScreenPan();
}

function updateCameraPan() {
  cameraPreview.style.setProperty('--cam-x', `${cameraPanX}px`);
  cameraPreview.style.setProperty('--cam-y', `${cameraPanY}px`);
}

function getRenderedVideoRect() {
  const frameRect = desktopFrame.getBoundingClientRect();
  const videoWidth = screenPreview.videoWidth;
  const videoHeight = screenPreview.videoHeight;

  if (!videoWidth || !videoHeight) {
    return frameRect;
  }

  const frameRatio = frameRect.width / frameRect.height;
  const videoRatio = videoWidth / videoHeight;

  if (videoRatio > frameRatio) {
    const height = frameRect.width / videoRatio;
    return {
      left: frameRect.left,
      top: frameRect.top + (frameRect.height - height) / 2,
      width: frameRect.width,
      height
    };
  }

  const width = frameRect.height * videoRatio;
  return {
    left: frameRect.left + (frameRect.width - width) / 2,
    top: frameRect.top,
    width,
    height: frameRect.height
  };
}

function centerMediaPoint(event) {
  if (!event.shiftKey) return;
  if (!screenStream) return;

  event.preventDefault();

  if (screenTargetActive) {
    resetScreenEffect();
    return;
  }

  const renderedRect = getRenderedVideoRect();
  const clickX = event.clientX - renderedRect.left;
  const clickY = event.clientY - renderedRect.top;

  desktopFrame.style.setProperty('--origin-x', `${clickX}px`);
  desktopFrame.style.setProperty('--origin-y', `${clickY}px`);
  screenPanX = renderedRect.width / 2 - clickX;
  screenPanY = renderedRect.height / 2 - clickY;
  screenZoom = 1.25;
  screenTargetActive = true;
  const tiltX = Number.parseFloat(randomTilt());
  const tiltY = Number.parseFloat(randomTilt());
  const tiltZ = Number.parseFloat(randomTilt());
  setTilt(tiltX, tiltY, tiltZ);
  syncTiltInputs(tiltX, tiltY, tiltZ);
  updateScreenPan();
}

function shakeMediaPane() {
  desktopFrame.classList.add('is-shaking');
  window.clearTimeout(shakeTimer);
  shakeTimer = window.setTimeout(() => {
    desktopFrame.classList.remove('is-shaking');
  }, 4000);
}

function rotateMediaPane() {
  desktopFrame.classList.remove('is-rotating');
  window.clearTimeout(rotateTimer);
  requestAnimationFrame(() => {
    desktopFrame.classList.add('is-rotating');
    rotateTimer = window.setTimeout(() => {
      desktopFrame.classList.remove('is-rotating');
    }, 1400);
  });
}

function triggerLightningStrike() {
  lightningStrike.classList.remove('is-active');
  window.clearTimeout(lightningTimer);
  requestAnimationFrame(() => {
    lightningStrike.classList.add('is-active');
    lightningTimer = window.setTimeout(() => {
      lightningStrike.classList.remove('is-active');
    }, 200);
  });
}

function startCameraDrag(event) {
  if (!cameraStream) return;

  event.preventDefault();
  cameraDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: cameraPanX,
    originY: cameraPanY
  };
  cameraPreview.classList.add('is-dragging');
  cameraPreview.setPointerCapture(event.pointerId);
}

function dragCamera(event) {
  if (!cameraDrag || event.pointerId !== cameraDrag.pointerId) return;

  cameraPanX = cameraDrag.originX + event.clientX - cameraDrag.startX;
  cameraPanY = cameraDrag.originY + event.clientY - cameraDrag.startY;
  updateCameraPan();
}

function stopCameraDrag(event) {
  if (!cameraDrag || event.pointerId !== cameraDrag.pointerId) return;

  cameraPreview.classList.remove('is-dragging');
  cameraPreview.releasePointerCapture(event.pointerId);
  cameraDrag = null;
}

function stopStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

function setRecordingControls(state) {
  const isRecording = state === 'recording';
  const isPaused = state === 'paused';

  recordButton.disabled = isRecording || isPaused;
  pauseButton.disabled = !isRecording && !isPaused;
  stopButton.disabled = !isRecording && !isPaused;
  pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
  recordingIndicator.classList.toggle('is-recording', isRecording);
  recordingIndicator.classList.toggle('is-paused', isPaused);
  recordingIndicator.setAttribute(
    'aria-label',
    isPaused ? 'Recording paused' : isRecording ? 'Recording on' : 'Recording off'
  );
}

async function captureScreen() {
  stopStream(screenStream);
  screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'monitor'
    },
    audio: true
  });

  screenPreview.srcObject = screenStream;
  screenPreview.classList.add('is-active');
  resetScreenEffect();
  screenEmpty.hidden = true;
  screenLabel.textContent = 'Desktop source selected';

  screenStream.getVideoTracks()[0]?.addEventListener('ended', () => {
    screenPreview.srcObject = null;
    screenPreview.classList.remove('is-active');
    resetScreenEffect();
    screenEmpty.hidden = false;
    screenLabel.textContent = 'No source selected';
    screenStream = null;
  });
}

async function captureSubject() {
  stopStream(subjectStream);
  subjectStream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'browser'
    },
    audio: true
  });

  subjectPanelPreview.srcObject = subjectStream;
  subjectPanelPreview.hidden = false;
  subjectLabel.textContent = 'Recording subject selected';

  subjectStream.getVideoTracks()[0]?.addEventListener('ended', () => {
    subjectPanelPreview.srcObject = null;
    subjectPanelPreview.hidden = true;
    subjectLabel.textContent = 'No subject selected';
    subjectStream = null;
  });
}

async function toggleCamera() {
  if (cameraStream) {
    stopStream(cameraStream);
    cameraStream = null;
    cameraVideo.srcObject = null;
    cameraPreview.classList.remove('is-active');
    cameraPanX = 0;
    cameraPanY = 0;
    updateCameraPan();
    cameraButton.textContent = 'Start camera';
    cameraLabel.textContent = 'Camera off';
    return;
  }

  cameraStream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'user'
    },
    audio: false
  });

  cameraVideo.srcObject = cameraStream;
  cameraPreview.classList.add('is-active');
  cameraButton.textContent = 'Stop camera';
  cameraLabel.textContent = 'Camera on';
}

async function getMicStream() {
  if (!subjectAudioToggle.checked) {
    stopStream(micStream);
    micStream = null;
    audioLabel.textContent = 'Audio disabled';
    return null;
  }

  if (!micStream) {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  }

  audioLabel.textContent = 'Audio enabled';
  return micStream;
}

async function startRecording() {
  if (subjectSourceToggle.checked && !subjectStream) {
    await captureSubject();
  }

  const mic = await getMicStream();
  const tracks = [
    ...(subjectSourceToggle.checked && subjectStream ? subjectStream.getVideoTracks() : []),
    ...(subjectSourceToggle.checked && subjectStream ? subjectStream.getAudioTracks() : []),
    ...(mic ? mic.getAudioTracks() : [])
  ];

  if (tracks.length === 0) {
    throw new Error('Select at least one recording subject.');
  }

  const mixedStream = new MediaStream(tracks);
  const hasVideo = tracks.some((track) => track.kind === 'video');
  const mimeTypes = hasVideo
    ? ['video/webm;codecs=vp9,opus', 'video/webm']
    : ['audio/webm;codecs=opus', 'audio/webm'];
  const supportedMimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
  const recorderOptions = supportedMimeType ? { mimeType: supportedMimeType } : {};

  chunks = [];
  recorder = new MediaRecorder(mixedStream, recorderOptions);

  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  });

  recorder.addEventListener('stop', () => {
    const blob = new Blob(chunks, { type: recorder.mimeType });
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
    }
    recordingUrl = URL.createObjectURL(blob);
    playback.src = recordingUrl;
    playback.hidden = false;
    playButton.disabled = false;
    setRecordingControls('idle');
    setStatus('Recording ready');
  });

  recorder.start();
  togglePanel(false);
  setRecordingControls('recording');
  setStatus('Recording');
}

function togglePause() {
  if (!recorder) return;

  if (recorder.state === 'recording') {
    recorder.pause();
    setRecordingControls('paused');
    setStatus('Paused');
    return;
  }

  if (recorder.state === 'paused') {
    recorder.resume();
    setRecordingControls('recording');
    setStatus('Recording');
  }
}

function stopRecording() {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
    setStatus('Stopping');
  }
}

screenButton.addEventListener('click', async () => {
  try {
    await captureScreen();
    setStatus('Source selected');
  } catch (error) {
    setStatus('Source cancelled');
  }
});

subjectSourceButton.addEventListener('click', async () => {
  try {
    await captureSubject();
    setStatus('Subject selected');
  } catch (error) {
    setStatus('Subject cancelled');
  }
});

cameraButton.addEventListener('click', async () => {
  try {
    await toggleCamera();
  } catch (error) {
    cameraLabel.textContent = 'Camera unavailable';
  }
});

subjectAudioToggle.addEventListener('change', async () => {
  try {
    await getMicStream();
  } catch (error) {
    subjectAudioToggle.checked = false;
    audioLabel.textContent = 'Audio unavailable';
  }
});

recordButton.addEventListener('click', async () => {
  try {
    await startRecording();
  } catch (error) {
    setStatus('Recording unavailable');
    setRecordingControls('idle');
  }
});

pauseButton.addEventListener('click', togglePause);
stopButton.addEventListener('click', stopRecording);
playButton.addEventListener('click', () => playback.play());
hidePanelButton.addEventListener('click', () => togglePanel(false));
centerCrossToggle.addEventListener('change', () => {
  centerCross.hidden = !centerCrossToggle.checked;
});
tiltXInput.addEventListener('input', applyTiltInputs);
tiltYInput.addEventListener('input', applyTiltInputs);
tiltZInput.addEventListener('input', applyTiltInputs);
desktopFrame.addEventListener('click', centerMediaPoint);
cameraPreview.addEventListener('pointerdown', startCameraDrag);
cameraPreview.addEventListener('pointermove', dragCamera);
cameraPreview.addEventListener('pointerup', stopCameraDrag);
cameraPreview.addEventListener('pointercancel', stopCameraDrag);

document.addEventListener(
  'keydown',
  (event) => {
    if (isPanelToggleShortcut(event)) {
      event.preventDefault();
      event.stopPropagation();
      togglePanel();
    }
  },
  true
);

document.addEventListener(
  'keydown',
  (event) => {
    if (!isRotateShortcut(event)) return;

    event.preventDefault();
    event.stopPropagation();
    rotateMediaPane();
  },
  true
);

document.addEventListener(
  'keydown',
  (event) => {
    if (!isShakeShortcut(event)) return;

    event.preventDefault();
    event.stopPropagation();
    shakeMediaPane();
  },
  true
);

document.addEventListener(
  'keydown',
  (event) => {
    if (!isLightningShortcut(event)) return;

    event.preventDefault();
    event.stopPropagation();
    triggerLightningStrike();
  },
  true
);

document.addEventListener(
  'keyup',
  (event) => {
    if (isRotateShortcut(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  },
  true
);

document.addEventListener(
  'keyup',
  (event) => {
    if (isLightningShortcut(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  },
  true
);

document.addEventListener(
  'keyup',
  (event) => {
    if (isShakeShortcut(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  },
  true
);

document.addEventListener(
  'keyup',
  (event) => {
    if (isPanelToggleShortcut(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  },
  true
);

window.addEventListener('load', () => {
  document.body.tabIndex = -1;
  document.body.focus();
});

setRecordingControls('idle');
