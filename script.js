// Data Video & Foto Publik Global yang bisa di-scroll oleh semua user
let MOCK_VIDEOS = [
  {
    id: 'post_paleleh_1',
    username: '@pengguna_tatap',
    caption: 'Video Desa Paleleh dari Ketinggian 🚁 #Buol #Paleleh #SulawesiTengah',
    music: 'Suara Asli - @pengguna_tatap',
    type: 'video',
    media_url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
    likes_count: 1,
    comments_count: 0,
    comments: []
  },
  {
    id: 'post_kreator_2',
    username: '@kreator_tatap',
    caption: 'Pemandangan alam indah di wilayah Buol ✨ #TATAP',
    music: 'Musik Hits - TATAP Studio',
    type: 'video',
    media_url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beach-with-waves-41537-large.mp4',
    likes_count: 1240,
    comments_count: 2,
    comments: [
      { username: '@budi_santoso', text: 'Keren banget pemandangannya!' },
      { username: '@siti_aminah', text: 'Mantap daerah Paleleh.' }
    ]
  }
];

let authMode = 'register';
let currentUser = null;
let activeVideoId = null;
let mediaRecorder;
let recordedChunks = [];
let localCameraStream = null;

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 700);
    }
  }, 2000);

  try { if (window.lucide) lucide.createIcons(); } catch (e) {}

  // Memuat postingan publik & mewajibkan daftar
  renderFeed();
  openAuthModal('register');
});

// Switch Tab Beranda, Temukan, Kotak Masuk, Profil
function switchTab(tab) {
  if (!currentUser) {
    alert('Silakan mendaftar atau masuk terlebih dahulu untuk menggunakan fitur ini!');
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

// Render Feed Publik: Mendukung Foto, Video, & Siaran Langsung (Bisa di-scroll semua orang)
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
    } else {
      // Menambahkan muted & playsinline agar video tidak blank hitam karena browser autoplay policy
      mediaElement = `
        <video class="w-full h-full object-cover cursor-pointer" loop playsinline muted src="${itemData.media_url}"></video>
        <div class="play-overlay absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 transition-opacity">
          <div class="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
            <i data-lucide="play" class="w-8 h-8 text-white fill-white ml-1"></i>
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      ${mediaElement}
      
      <div class="absolute bottom-14 left-4 right-16 z-20 space-y-2 pointer-events-none">
        <h4 class="font-bold text-base drop-shadow">${itemData.username}</h4>
        <p class="text-xs text-slate-200 line-clamp-2 drop-shadow">${itemData.caption}</p>
        <div class="flex items-center space-x-2 text-xs text-slate-300">
          <i data-lucide="music" class="w-3.5 h-3.5 animate-spin-slow"></i>
          <span>${itemData.music}</span>
        </div>
      </div>

      <div class="absolute right-3 bottom-16 z-20 flex flex-col items-center space-y-5">
        <button onclick="toggleLike(this)" class="flex flex-col items-center text-white hover:scale-110 transition">
          <i data-lucide="heart" class="w-7 h-7"></i>
          <span class="text-xs mt-1 font-semibold">${itemData.likes_count}</span>
        </button>
        <button onclick="openCommentModal('${itemData.id}')" class="flex flex-col items-center text-white hover:scale-110 transition">
          <i data-lucide="message-circle" class="w-7 h-7"></i>
          <span class="text-xs mt-1 font-semibold comment-count-${itemData.id}">${itemData.comments.length}</span>
        </button>
        <button onclick="openShareModal('${itemData.id}')" class="flex flex-col items-center text-white hover:scale-110 transition">
          <i data-lucide="share-2" class="w-7 h-7"></i>
          <span class="text-xs mt-1 font-semibold">Bagi</span>
        </button>
      </div>
    `;

    // Kontrol klik untuk play/pause video secara instan
    if (itemData.type !== 'image') {
      const v = card.querySelector('video');
      card.addEventListener('click', () => { 
        if (v.paused) {
          v.muted = false; // Aktifkan suara saat diklik oleh user
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }

    feed.appendChild(card);
  });

  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
  setupAutoplayObserver();
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

// ----------------- MENAMBAH KONTEN BARU (FOTO / VIDEO / LIVE) -----------------
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
    
    // Tambahkan video baru ke daftar publik
    const newPost = {
      id: Date.now().toString(),
      username: currentUser.username,
      caption: 'Rekaman kamera langsung 🎥 #TATAP #LiveRecord',
      music: `Suara Asli - ${currentUser.username}`,
      type: 'video',
      media_url: videoUrl,
      likes_count: 0,
      comments_count: 0,
      comments: []
    };

    MOCK_VIDEOS.unshift(newPost);
    renderFeed();
    closeRecordModal();
    switchTab('feed');
    alert('Video rekaman berhasil dipublikasikan untuk semua pengguna!');
  };

  mediaRecorder.start();
  document.getElementById('record-status').classList.remove('hidden');
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
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('live-video-stream').srcObject = stream;
  } catch (e) {
    alert('Gagal memulai Kamera Live: ' + e.message);
    stopLiveStream();
  }
}

function stopLiveStream() {
  const liveVideo = document.getElementById('live-video-stream');
  if (liveVideo.srcObject) {
    liveVideo.srcObject.getTracks().forEach(track => track.stop());
    liveVideo.srcObject = null;
  }
  document.getElementById('guest-slot-1').classList.add('hidden');
  document.getElementById('live-room-view').classList.add('hidden');
  switchTab('feed');
}

async function inviteGuestToLive() {
  document.getElementById('guest-slot-1').classList.remove('hidden');
  try {
    const guestStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('guest-video-element').srcObject = guestStream;
    alert('Berhasil mengundang tamu kedalam siaran langsung!');
  } catch (e) {
    alert('Gagal mengundang tamu: ' + e.message);
  }
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

  // Menyimpan konten baru ke feed publik
  const newPost = {
    id: Date.now().toString(),
    username: currentUser ? currentUser.username : '@pengguna_tatap',
    caption: caption,
    music: `Suara Asli - ${currentUser ? currentUser.username : '@pengguna_tatap'}`,
    type: mediaType,
    media_url: mediaUrl,
    likes_count: 0,
    comments_count: 0,
    comments: []
  };

  MOCK_VIDEOS.unshift(newPost);
  renderFeed();
  closeUploadModal();
  switchTab('feed');
  alert('Konten berhasil dipublikasikan dan dapat di-scroll oleh seluruh pengguna TATAP!');
}

// ----------------- FITUR LAINNYA -----------------
function openCommentModal(videoId) {
  if (!currentUser) { alert('Silakan mendaftar terlebih dahulu!'); openAuthModal('register'); return; }
  activeVideoId = videoId;
  const video = MOCK_VIDEOS.find(v => v.id === videoId);
  if (!video) return;

  const listContainer = document.getElementById('comment-list');
  listContainer.innerHTML = '';
  if (video.comments.length === 0) {
    listContainer.innerHTML = '<p class="text-center text-slate-500 py-4">Belum ada komentar.</p>';
  } else {
    video.comments.forEach(c => {
      const div = document.createElement('div');
      div.className = 'flex items-start space-x-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800';
      div.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center shrink-0 text-xs">${c.username.charAt(1).toUpperCase()}</div>
        <div class="flex-1"><strong class="text-amber-400 block text-[11px]">${c.username}</strong><p class="text-slate-200 text-xs mt-0.5">${c.text}</p></div>
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
    video.comments.push({ username: currentUser.username, text: text });
    document.querySelectorAll(`.comment-count-${activeVideoId}`).forEach(cnt => cnt.innerText = video.comments.length);
    input.value = '';
    openCommentModal(activeVideoId);
  }
}

function openShareModal(videoId) { activeVideoId = videoId; document.getElementById('modal-share').classList.remove('hidden'); try { if (window.lucide) lucide.createIcons(); } catch (e) {} }
function closeShareModal() { document.getElementById('modal-share').classList.add('hidden'); activeVideoId = null; }
function shareToSocial(platform) { alert(`Berhasil membagikan ke ${platform}!`); closeShareModal(); }
function copyVideoLink() { navigator.clipboard.writeText(window.location.href).then(() => { alert('Link disalin!'); closeShareModal(); }); }

function renderExploreGrid() {
  const grid = document.getElementById('explore-grid');
  if (!grid) return;
  grid.innerHTML = '';

  MOCK_VIDEOS.forEach((video) => {
    const card = document.createElement('div');
    card.className = 'relative bg-slate-800 rounded-xl overflow-hidden aspect-[3/4] cursor-pointer border border-slate-700/50';
    
    let content = video.type === 'image' 
      ? `<img class="w-full h-full object-cover" src="${video.media_url}">` 
      : `<video class="w-full h-full object-cover" src="${video.media_url}"></video>`;
      
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

function openEditProfileModal() {
  document.getElementById('edit-name').value = currentUser.name || '';
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
      username: '@pengguna_tatap',
      name: email.split('@')[0],
      status: 'Senang bisa kembali ✨'
    };
    alert('Berhasil masuk ke aplikasi!');
  }

  updateProfileDisplay();
  renderFeed();
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
