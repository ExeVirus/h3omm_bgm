const pwaHelper = {
  async exportFile(filename, content, mimeType) {
    const file = new File([content], filename, { type: mimeType });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] });
    } else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
      a.download = filename;
      a.click();
    }
  },

  async startCamera(videoElementId) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = document.getElementById(videoElementId);
    video.srcObject = stream;
    video.style.display = 'block';
  },

  async startGyro(callback) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      await DeviceOrientationEvent.requestPermission();
    }
    window.addEventListener('deviceorientation', (e) => {
      callback({ alpha: e.alpha.toFixed(2), beta: e.beta.toFixed(2), gamma: e.gamma.toFixed(2) });
    });
  }
};