const uploadForm = document.getElementById('uploadForm');
const songList = document.getElementById('songList');
const statusLabel = document.getElementById('status');

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** index);
  return `${value.toFixed(1)} ${units[index]}`;
};

const loadSongs = async () => {
  songList.innerHTML = '<li>Loading songs...</li>';

  try {
    const response = await fetch('/api/songs');
    const songs = await response.json();

    if (!songs.length) {
      songList.innerHTML = '<li>No songs uploaded yet.</li>';
      return;
    }

    songList.innerHTML = songs.map((song) => {
      const uploaded = new Date(song.uploadedAt).toLocaleString();
      return `
        <li class="song-item">
          <strong>${song.filename}</strong>
          <div class="song-meta">${formatBytes(song.size)} • ${uploaded}</div>
          <audio controls src="${song.url}"></audio>
        </li>
      `;
    }).join('');
  } catch (error) {
    songList.innerHTML = '<li>Unable to load songs right now.</li>';
  }
};

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusLabel.textContent = 'Uploading...';

  const formData = new FormData(uploadForm);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      statusLabel.textContent = data.error || 'Upload failed.';
      return;
    }

    statusLabel.textContent = 'Upload complete!';
    uploadForm.reset();
    await loadSongs();
  } catch (error) {
    statusLabel.textContent = 'Network error while uploading.';
  }
});

loadSongs();
