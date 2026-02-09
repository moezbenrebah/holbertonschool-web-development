const mainVideo = document.querySelector('#main-video');
const pipBtn = document.querySelector('#pip-btn');

mainVideo.addEventListener('loadedmetadata', () => {
    pipBtn.disabled = false;
});

if (mainVideo.readyState >= 1) {
    pipBtn.disabled = false;
}

pipBtn.addEventListener('click', async () => {
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else {
            await mainVideo.requestPictureInPicture();
        }
    } catch (error) {
        console.error('PiP error:', error);
    }
});

mainVideo.addEventListener('enterpictureinpicture', () => {
    pipBtn.textContent = 'Exit Picture-in-Picture';
    pipBtn.classList.add('active');
});

mainVideo.addEventListener('leavepictureinpicture', () => {
    pipBtn.textContent = 'Enable Picture-in-Picture';
    pipBtn.classList.remove('active');
});
