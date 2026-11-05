// Data Konten Publik (Video, Foto, dan Siaran Live yang dapat di-scroll bersamaan)
let MOCK_VIDEOS = [
  {
    id: 'post_1',
    username: '@agus123',
    caption: 'Video sambutan dari @agus123 #TATAP #Buol',
    music: 'Suara Asli - @agus123',
    type: 'video',
    media_url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    likes_count: 15,
    comments: [
      { username: '@kreator_tatap', text: 'Halo @agus123, selamat bergabung!' }
    ]
  },
  {
    id: 'post_2',
    username: '@kreator_tatap',
    caption: 'Pemandangan pantai yang indah di wilayah Buol ✨ #TATAP',
    music: 'Musik Hits - TATAP Studio',
    type: 'video',
    media_url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beach-with-waves-41537-large.mp4',
    likes_count: 1240,
    comments: [
      { username: '@budi_santoso', text: 'Keren banget pemandangannya!' }
    ]
  }
];

let ACTIVE_LIVES = [];
let authMode = 'register';
let currentUser = null;
let activeVideoId = null;
let mediaRecorder;
let recordedChunks = [];
let localCameraStream = null;
let liveGuestsStreams = [];

// Eksekusi utama saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
  const splashVideo = document.getElementById('splash-video');
  let splashHandled = false;

  const triggerOpenAuth = () => {
    if (splashHandled) return;
    splashHandled = true;
    hideSplashAndOpenAuth();
  };

  if (splashVideo) {
    // Ketika video splash screen selesai berputar
    splashVideo.onended = triggerOpenAuth;
    
    // Paksa putar video untuk mengatasi kebijakan browser modern
    splashVideo.play().catch(() => {
      setTimeout(triggerOpenAuth, 1000);
    });
  }

  // Fallback pengaman (maksimal 4 detik jika video tidak terdeteksi onended)
  setTimeout(triggerOpenAuth, 4000);

  try { if (window.lucide) lucide.createIcons(); } catch (e) {}

  renderFeed();
  renderActiveLives();
  renderExploreGrid();

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase().trim();
      renderExploreGrid(keyword);
    });
  }
});

// Menghilangkan Splash Screen secara mulus DAHULU, baru memunculkan Form Auth
function hideSplashAndOpenAuth() {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.remove();
      // Tampilkan form pendaftaran/masuk HANYA SETELAH splash screen hilang
      if (!currentUser) {
        openAuthModal('register');
      }
    }, 700);
  } else {
    if (!currentUser) {
      openAuthModal('register');
    }
  }
}

// Fungsi Berpindah Tab
function switchTab(tab) {
  if (!currentUser) {
    alert('Silakan mendaftar atau masuk terlebih dahulu!');
    openAuthModal('register');
    return;
  }

  const feed = document.getElementById('video-feed');
  const explore = document.getElementById('explore-view');
  const inbox = document.getElementById('inbox-view');
  const profile = document.getElementById('profile-view');
  const liveRoom = document.getElementById('live-room-view');

  feed.classList.add('hidden');
  explore.classList.add('hidden');
  inbox.classList.add('hidden');
  profile.classList.add('hidden');
  liveRoom.classList.add('hidden');

  ['feed', 'explore', 'inbox', 'profile'].forEach(t => {
    const btn = document.getElementById(`nav-btn-${t}`);
    if (btn) btn.className = 'flex flex-col items-center text-slate-400 hover:text-white transition';
  });

  if (tab === 'explore') {
    explore.classList.remove('hidden');
    renderExploreGrid();
    renderActiveLives();
    document.getElementById('nav-btn-explore').className = 'flex flex-col items-center text-amber-400 font-medium';
    pauseAllVideos();
  } else if (tab === 'inbox') {
    inbox.classList.remove('hidden');
    document.getElementById('nav-btn-inbox').className = 'flex flex-col items-center text-amber-400 font-medium';
    pauseAllVideos();
  } else if (tab === 'profile') {
    profile.classList.remove('hidden');
    document.getElementById('nav-btn-profile').className = 'flex flex-col items-center text-amber-400 font-medium';
    pauseAllVideos();
  } else {
    feed.classList.remove('hidden');
    document.getElementById('nav-btn-feed').className = 'flex flex-col items-center text-amber-400 font-medium';
    playVisibleVideo();
  }

  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
}

// Render Beranda Utama (Feed Publik dengan Fitur Live Interaktif)
function renderFeed() {
  const feed = document.getElementById('video-feed');
  if (!feed) return;
  feed.innerHTML = '';

  MOCK_VIDEOS.forEach((itemData) => {
    const card = document.createElement('div');
    card.className = 'snap-start relative w-full h-full flex items-center justify-center bg-black video-card';

    let mediaElement = '';
    if (itemData.type === 'image') {
      mediaElement = `<img src="${itemData.media_url}" class="w-full h-full object-cover">`;
    } else if (itemData.type === 'live') {
      mediaElement = `
        <div class="relative w-full h-full bg-slate-950 flex flex-col justify-between p-4 pt-14 pb-20">
          <div class="absolute inset-0 z-0">
            <video id="feed-live-video-${itemData.id}" class="w-full h-full object-cover" autoplay playsinline muted></video>
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
          </div>
          
          <div class="relative z-10 flex justify-between items-center">
            <div class="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/40">
              <span class="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
              <span class="text-[11px] font-bold text-red-400">LIVE</span>
            </div>
            <div class="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs">
              <span class="text-amber-400 font-bold">❤️ 121</span>
              <span class="text-slate-300">👥 2.1K</span>
            </div>
          </div>

          <div class="relative z-10 my-auto space-y-3 pointer-events-none">
            <div class="bg-black/70 backdrop-blur-md border border-slate-700 p-2.5 rounded-2xl max-w-[240px] text-xs shadow-xl animate-bounce">
              <strong class="text-amber-400 block text-[10px]">senja_rerindou07</strong>
              <p class="text-white mt-0.5">gimana tuuh caranya</p>
            </div>
            <div class="flex flex-col items-center justify-center text-center space-y-1 bg-black/40 backdrop-blur-sm p-4 rounded-3xl border border-white/10">
              <div class="w-16 h-16 rounded-full border-2 border-amber-400 bg-slate-900 flex items-center justify-center font-bold text-xl text-amber-400 shadow-xl">
                ${itemData.username.charAt(1).toUpperCase()}
              </div>
              <h3 class="font-bold text-sm text-white">Host (${itemData.username})</h3>
              <p class="text-[11px] text-slate-300 line-clamp-1">${itemData.caption}</p>
            </div>
          </div>

          <div class="relative z-10 flex gap-2 justify-center">
            <button onclick="startLiveStream()" class="bg-amber-400 hover:bg-amber-300 text-black px-5 py-2 rounded-full text-xs font-bold shadow-lg transition">
              Gabung Live
            </button>
            <button onclick="openGiftModal()" class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg transition flex items-center gap-1">
              <i data-lucide="gift" class="w-4 h-4"></i> Kirim Hadiah
            </button>
          </div>
        </div>
      `;
    } else {
      mediaElement = `
        <video class="w-full h-full object-cover cursor-pointer" loop playsinline muted src="${itemData.media_url}"></video>
      `;
    }

    const commentsCount = itemData.comments ? itemData.comments.length : 0;

    card.innerHTML = `
      ${mediaElement}
      
      ${itemData.type !== 'live' ? `
      <div class="absolute bottom-14 left-4 right-16 z-20 space-y-2 pointer-events-none">
        <h4 class="font-bold text-base drop-shadow">${itemData.username}</h4>
        <p class="text-xs text-slate-200 line-clamp-2 drop-shadow">${itemData.caption}</p>
        <div class="flex items-center space-x-2 text-xs text-slate-300">
          <i data-lucide="music" class="w-3.5 h-3.5 animate-spin-slow"></i>
          <span>${itemData.music || 'Suara Asli'}</span>
        </div>
      </div>

      <div class="absolute right-3 bottom-16 z-20 flex flex-col items-center space-y-5">
        <button onclick="toggleLike(this)" class="flex flex-col items-center text-white hover:scale-110 transition">
          <i data-lucide="heart" class="w-7 h-7"></i>
          <span class="text-xs mt-1 font-semibold">${itemData.likes_count || 0}</span>
        </button>
        <button onclick="openCommentModal('${itemData.id}')" class="flex flex-col items-center text-white hover:scale-110 transition">
          <i data-lucide="message-circle" class="w-7 h-7"></i>
          <span class="text-xs mt-1 font-semibold comment-count-${itemData.id}">${commentsCount}</span>
        </button>
        <button onclick="openShareModal('${itemData.id}')" class="flex flex-col items-center text-white hover:scale-110 transition">
          <i data-lucide="share-2" class="w-7 h-7"></i>
          <span class="text-xs mt-1 font-semibold">Bagi</span>
        </button>
      </div>` : ''}
    `;

    if (itemData.type === 'video') {
      const v = card.querySelector('video');
      card.addEventListener('click', () => { 
        if (v.paused) {
          v.muted = false;
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    } else if (itemData.type === 'live' && localCameraStream) {
      setTimeout(() => {
        const liveVideoEl = document.getElementById(`feed-live-video-${itemData.id}`);
        if (liveVideoEl && !liveVideoEl.srcObject) {
          liveVideoEl.srcObject = localCameraStream;
        }
      }, 100);
    }

    feed.appendChild(card);
  });

  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
  setupAutoplayObserver();
}

// Render Badge Siaran Live Aktif di Menu Temukan
function renderActiveLives() {
  const container = document.getElementById('active-live-list');
  if (!container) return;

  if (ACTIVE_LIVES.length === 0) {
    container.innerHTML = `<p class="text-[11px] text-slate-400 italic">Belum ada siaran langsung aktif.</p>`;
    return;
  }

  container.innerHTML = '';
  ACTIVE_LIVES.forEach(live => {
    const badge = document.createElement('div');
    badge.className = 'flex flex-col items-center space-y-1 cursor-pointer shrink-0';
    badge.innerHTML = `
      <div class="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-red-600 to-amber-400 animate-pulse">
        <div class="w-full h-full bg-slate-900 rounded-full flex items-center justify-center font-bold text-xs text-amber-400">
          ${live.username.charAt(1).toUpperCase()}
        </div>
      </div>
      <span class="text-[10px] text-slate-200 truncate max-w-[60px]">${live.username}</span>
    `;
    badge.addEventListener('click', () => startLiveStream());
    container.appendChild(badge);
  });
}

function setupAutoplayObserver() {
  const options = { threshold: 0.6 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('video');
      if (video) {
        if (entry.isIntersecting && currentUser) {
          video.play().catch(() => {
            video.muted = true;
            video.play();
          });
        } else {
          video.pause();
        }
      }
    });
  }, options);

  document.querySelectorAll('.video-card').forEach(card => observer.observe(card));
}

function pauseAllVideos() {
  document.querySelectorAll('video').forEach(v => v.pause());
}

function playVisibleVideo() {
  if (!currentUser) return;
  const firstVideo = document.querySelector('.video-card video');
  if (firstVideo) {
    firstVideo.play().catch(() => {
      firstVideo.muted = true;
      firstVideo.play();
    });
  }
}

// ----------------- KONTROL KONTEN PUBLIK (+) -----------------
function openCreateMenuModal() {
  if (!currentUser) {
    alert('Silakan daftar atau masuk terlebih dahulu!');
    openAuthModal('register');
    return;
  }
  document.getElementById('modal-create-menu').classList.remove('hidden');
  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
}

function closeCreateMenuModal() {
  document.getElementById('modal-create-menu').classList.add('hidden');
}

async function openRecordModal() {
  closeCreateMenuModal();
  document.getElementById('modal-record').classList.remove('hidden');
  try {
    localCameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('webcam-preview').srcObject = localCameraStream;
  } catch (err) {
    alert('Gagal mengakses kamera: ' + err.message);
    closeRecordModal();
  }
}

function closeRecordModal() {
  if (localCameraStream) {
    localCameraStream.getTracks().forEach(track => track.stop());
    localCameraStream = null;
  }
  document.getElementById('modal-record').classList.add('hidden');
  document.getElementById('record-status').classList.add('hidden');
  document.getElementById('btn-start-record').classList.remove('hidden');
  document.getElementById('btn-stop-record').classList.add('hidden');
}

function startCameraRecording() {
  recordedChunks = [];
  try {
    mediaRecorder = new MediaRecorder(localCameraStream, { mimeType: 'video/webm' });
  } catch (e) {
    mediaRecorder = new MediaRecorder(localCameraStream);
  }

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) recordedChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const videoUrl = URL.createObjectURL(blob);
    
    const newPost = {
      id: Date.now().toString(),
      username: currentUser.username,
      caption: `Video rekaman oleh ${currentUser.username} 🎥 #TATAP`,
      music: `Suara Asli - ${currentUser.username}`,
      type: 'video',
      media_url: videoUrl,
      likes_count: 0,
      comments: []
    };

    MOCK_VIDEOS.unshift(newPost);
    renderFeed();
    renderExploreGrid();
    closeRecordModal();
    switchTab('feed');
    alert('Video rekaman berhasil dibagikan untuk semua pengguna!');
  };

  mediaRecorder.start();
  document.getElementById('record-status').classList.add('hidden');
  document.getElementById('btn-start-record').classList.add('hidden');
  document.getElementById('btn-stop-record').classList.remove('hidden');
}

function stopCameraRecording() {
  if (mediaRecorder) mediaRecorder.stop();
}

async function startLiveStream() {
  closeCreateMenuModal();
  document.getElementById('live-room-view').classList.remove('hidden');

  try {
    localCameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('live-video-stream').srcObject = localCameraStream;

    if (currentUser) {
      const liveId = 'live_' + currentUser.username;
      if (!ACTIVE_LIVES.some(l => l.username === currentUser.username)) {
        ACTIVE_LIVES.push({
          id: liveId,
          username: currentUser.username,
          caption: 'Sedang Siaran Langsung 🔴'
        });
      }
      if (!MOCK_VIDEOS.some(v => v.id === liveId)) {
        MOCK_VIDEOS.unshift({
          id: liveId,
          username: currentUser.username,
          caption: `Siaran langsung interaktif oleh ${currentUser.username}`,
          music: 'Live Audio',
          type: 'live',
          likes_count: 0,
          comments: []
        });
      }
    }

    renderFeed();
    renderActiveLives();
    updateLiveGuestsGrid();
  } catch (e) {
    alert('Gagal mengaktifkan kamera Live: ' + e.message);
    stopLiveStream();
  }
}

function stopLiveStream() {
  if (currentUser) {
    ACTIVE_LIVES = ACTIVE_LIVES.filter(l => l.username !== currentUser.username);
    MOCK_VIDEOS = MOCK_VIDEOS.filter(v => v.type !== 'live' || v.username !== currentUser.username);
  }
  liveGuestsStreams = [];
  document.getElementById('live-room-view').classList.add('hidden');
  switchTab('feed');
  renderFeed();
  renderActiveLives();
}

// Mengundang Tamu Co-host (Maksimal 11 Tamu, Total 12 Orang dengan Host)
async function inviteGuestToLive() {
  if (liveGuestsStreams.length >= 11) {
    alert('Kapasitas maksimal 12 orang (1 Host + 11 Tamu) sudah penuh!');
    return;
  }

  try {
    const guestStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    liveGuestsStreams.push(guestStream);
    updateLiveGuestsGrid();
    alert('Berhasil mengundang tamu co-host baru!');
  } catch (e) {
    alert('Gagal mengaktifkan kamera tamu: ' + e.message);
  }
}

// Memperbarui Tampilan Grid Tamu Live (Hingga 12 Slot)
function updateLiveGuestsGrid() {
  const gridContainer = document.getElementById('live-guests-grid');
  if (!gridContainer) return;

  gridContainer.innerHTML = `
    <div class="relative bg-slate-900/80 border-2 border-amber-400 rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center shadow-lg">
      <span class="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-400 z-10">Host (Anda)</span>
    </div>
  `;

  liveGuestsStreams.forEach((stream, index) => {
    const guestCard = document.createElement('div');
    guestCard.className = 'relative bg-slate-800/90 border border-slate-700 rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center shadow-md';
    
    const videoEl = document.createElement('video');
    videoEl.className = 'w-full h-full object-cover';
    videoEl.autoplay = true;
    videoEl.playsInline = true;
    videoEl.srcObject = stream;

    const label = document.createElement('span');
    label.className = 'absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-semibold text-sky-400 z-10';
    label.innerText = `Tamu ${index + 1}`;

    guestCard.appendChild(videoEl);
    guestCard.appendChild(label);
    gridContainer.appendChild(guestCard);
  });

  const guestCountEl = document.getElementById('guest-count');
  if (guestCountEl) guestCountEl.innerText = liveGuestsStreams.length;
}

function openGiftModal() { document.getElementById('modal-gift').classList.remove('hidden'); }
function closeGiftModal() { document.getElementById('modal-gift').classList.add('hidden'); }
function sendGift(giftName, coinValue) {
  alert(`🎁 Berhasil mengirim hadiah ${giftName} senilai ${coinValue} Koin!`);
  closeGiftModal();
}

function openUploadModal() {
  closeCreateMenuModal();
  document.getElementById('modal-upload').classList.remove('hidden');
}

function closeUploadModal() {
  document.getElementById('modal-upload').classList.add('hidden');
}

function previewMediaFile(e) {
  const file = e.target.files[0];
  if (file) {
    document.getElementById('upload-url').value = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) {
      document.getElementById('upload-media-type').value = 'image';
    } else {
      document.getElementById('upload-media-type').value = 'video';
    }
  }
}

function handleUploadSubmit(e) {
  e.preventDefault();
  const mediaType = document.getElementById('upload-media-type').value;
  const caption = document.getElementById('upload-caption').value;
  const mediaUrl = document.getElementById('upload-url').value || 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4';

  const newPost = {
    id: Date.now().toString(),
    username: currentUser ? currentUser.username : '@pengguna_tatap',
    caption: caption,
    music: `Suara Asli - ${currentUser ? currentUser.username : '@pengguna_tatap'}`,
    type: mediaType,
    media_url: mediaUrl,
    likes_count: 0,
    comments: []
  };

  MOCK_VIDEOS.unshift(newPost);
  renderFeed();
  renderExploreGrid();
  closeUploadModal();
  switchTab('feed');
  alert('Konten berhasil dibagikan dan kini bisa dilihat di beranda publik!');
}

// ----------------- FITUR PENCARIAN & PENDUKUNG -----------------
function renderExploreGrid(filterKeyword = '') {
  const grid = document.getElementById('explore-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const filteredVideos = MOCK_VIDEOS.filter(video => {
    return video.username.toLowerCase().includes(filterKeyword) || 
           video.caption.toLowerCase().includes(filterKeyword);
  });

  if (filteredVideos.length === 0) {
    grid.innerHTML = `<p class="col-span-2 text-center text-xs text-slate-400 py-4">Pencarian tidak ditemukan.</p>`;
    return;
  }

  filteredVideos.forEach((video) => {
    const card = document.createElement('div');
    card.className = 'relative bg-slate-800 rounded-xl overflow-hidden aspect-[3/4] cursor-pointer border border-slate-700/50';
    
    let content = '';
    if (video.type === 'image') {
      content = `<img class="w-full h-full object-cover" src="${video.media_url}">`;
    } else if (video.type === 'live') {
      content = `<div class="w-full h-full bg-red-950 flex items-center justify-center font-bold text-red-400 text-xs">🔴 LIVE STREAM</div>`;
    } else {
      content = `<video class="w-full h-full object-cover" src="${video.media_url}"></video>`;
    }
      
    card.innerHTML = `
      ${content}
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-xs">
        <span class="font-bold text-amber-400 truncate">${video.username}</span>
        <span class="text-[10px] text-slate-300 truncate">${video.caption}</span>
      </div>
    `;
    card.addEventListener('click', () => switchTab('feed'));
    grid.appendChild(card);
  });
  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
}

function openCommentModal(videoId) {
  if (!currentUser) { alert('Silakan mendaftar terlebih dahulu!'); openAuthModal('register'); return; }
  activeVideoId = videoId;
  const video = MOCK_VIDEOS.find(v => v.id === videoId);
  if (!video) return;

  const listContainer = document.getElementById('comment-list');
  listContainer.innerHTML = '';
  
  const comments = video.comments || [];
  if (comments.length === 0) {
    listContainer.innerHTML = '<p class="text-center text-slate-500 py-4">Belum ada komentar.</p>';
  } else {
    comments.forEach(c => {
      const div = document.createElement('div');
      div.className = 'flex items-start space-x-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800';
      div.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center shrink-0 text-xs">${c.username.charAt(1).toUpperCase()}</div>
        <div class="flex-1"><strong class="text-amber-400 block text-[11px]">${c.username}</strong><p class="text-slate-200 text-xs mt-0.5">${c.comment || c.text}</p></div>
      `;
      listContainer.appendChild(div);
    });
  }
  document.getElementById('modal-comments').classList.remove('hidden');
  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
}

function closeCommentModal() { document.getElementById('modal-comments').classList.add('hidden'); activeVideoId = null; }

function handleAddComment(e) {
  e.preventDefault();
  const input = document.getElementById('comment-input');
  const text = input.value.trim();
  if (!text || !activeVideoId) return;

  const video = MOCK_VIDEOS.find(v => v.id === activeVideoId);
  if (video) {
    if (!video.comments) video.comments = [];
    video.comments.push({ username: currentUser.username, comment: text });
    
    document.querySelectorAll(`.comment-count-${activeVideoId}`).forEach(cnt => cnt.innerText = video.comments.length);
    input.value = '';
    openCommentModal(activeVideoId);
  }
}

function openShareModal(videoId) { activeVideoId = videoId; document.getElementById('modal-share').classList.remove('hidden'); try { if (window.lucide) lucide.createIcons(); } catch (e) {} }
function closeShareModal() { document.getElementById('modal-share').classList.add('hidden'); activeVideoId = null; }
function shareToSocial(platform) { alert(`Berhasil membagikan tautan ke ${platform}!`); closeShareModal(); }
function copyVideoLink() { navigator.clipboard.writeText(window.location.href).then(() => { alert('Link berhasil disalin!'); closeShareModal(); }); }

function openEditProfileModal() {
  document.getElementById('edit-name').value = currentUser ? currentUser.name : '';
  document.getElementById('modal-edit-profile').classList.remove('hidden');
}
function closeEditProfileModal() { document.getElementById('modal-edit-profile').classList.add('hidden'); }
function handleProfileSubmit(e) {
  e.preventDefault();
  currentUser.name = document.getElementById('edit-name').value;
  currentUser.username = '@' + currentUser.name.toLowerCase().replace(/\s+/g, '_');
  updateProfileDisplay();
  closeEditProfileModal();
}

function updateProfileDisplay() {
  if (!currentUser) return;
  document.getElementById('profile-display-name').innerText = currentUser.username;
  document.getElementById('profile-display-status').innerText = `"${currentUser.status || 'Anggota TATAP'}"`;
  document.getElementById('profile-avatar-text').innerText = (currentUser.name || 'U').charAt(0).toUpperCase();
}

function openAuthModal(mode = 'register') { setAuthMode(mode); document.getElementById('modal-auth').classList.remove('hidden'); }
function closeAuthModal() {
  if (!currentUser) { alert('Anda harus mendaftar atau masuk terlebih dahulu!'); return; }
  document.getElementById('modal-auth').classList.add('hidden');
}

function setAuthMode(mode) {
  authMode = mode;
  const title = document.getElementById('auth-title');
  const btnSubmit = document.getElementById('btn-auth-submit');
  const groupUsername = document.getElementById('group-username');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');

  if (mode === 'login') {
    title.innerText = 'Masuk ke TATAP';
    btnSubmit.innerText = 'Masuk';
    groupUsername.classList.add('hidden');
    document.getElementById('auth-username').required = false;
    tabLogin.className = 'flex-1 py-2 rounded-lg bg-amber-400 text-black transition';
    tabRegister.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition';
  } else {
    title.innerText = 'Daftar Akun TATAP';
    btnSubmit.innerText = 'Daftar Akun';
    groupUsername.classList.remove('hidden');
    document.getElementById('auth-username').required = true;
    tabRegister.className = 'flex-1 py-2 rounded-lg bg-amber-400 text-black transition';
    tabLogin.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition';
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const usernameInput = document.getElementById('auth-username').value;

  if (authMode === 'register') {
    currentUser = {
      username: usernameInput.startsWith('@') ? usernameInput : '@' + usernameInput,
      name: usernameInput.replace('@', ''),
      status: 'Anggota baru TATAP ✨'
    };
    alert('Pendaftaran berhasil! Selamat datang di TATAP.');
  } else {
    currentUser = {
      username: '@' + email.split('@')[0],
      name: email.split('@')[0],
      status: 'Senang bisa kembali ✨'
    };
    alert('Berhasil masuk ke aplikasi!');
  }

  updateProfileDisplay();
  renderFeed();
  renderExploreGrid();
  document.getElementById('btn-close-auth').classList.remove('hidden');
  document.getElementById('modal-auth').classList.add('hidden');
}

function toggleLike(btn) {
  if (!currentUser) { alert('Silakan mendaftar terlebih dahulu!'); openAuthModal('register'); return; }
  const countSpan = btn.querySelector('span');
  let count = parseInt(countSpan.innerText);
  if (btn.classList.contains('text-red-500')) {
    btn.classList.remove('text-red-500');
    btn.classList.add('text-white');
    countSpan.innerText = count - 1;
  } else {
    btn.classList.remove('text-white');
    btn.classList.add('text-red-500');
    countSpan.innerText = count + 1;
  }
}
