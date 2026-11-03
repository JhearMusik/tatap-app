// Data Video Utama
let MOCK_VIDEOS = [
  {
    id: '1',
    username: '@tatap_official',
    caption: 'Selamat datang di TATAP! Platform video pendek modern. 🚀 #TATAP',
    music: 'Musik Asli - TATAP Studio',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    likes_count: 1240,
    comments_count: 89
  },
  {
    id: '2',
    username: '@nature_vibes',
    caption: 'Pemandangan alam yang memukau untuk menemani harimu. 🌿✨ #nature',
    music: 'Acoustic Relaxing - Studio sound',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    likes_count: 852,
    comments_count: 34
  }
];

let authMode = 'login';
let currentUser = {
  username: '@kreator_tatap',
  name: 'Pengguna TATAP',
  age: 24,
  job: 'Konten Kreator',
  hobby: 'Traveling & Videografi',
  status: 'Selalu melihat hal positif ✨'
};

document.addEventListener('DOMContentLoaded', () => {
  // Splash screen durasi 2 detik
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 700);
    }
  }, 2000);

  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
  renderFeed();
  updateProfileDisplay();
});

// Switch Tab Beranda, Temukan, Kotak Masuk, Profil
function switchTab(tab) {
  const feed = document.getElementById('video-feed');
  const explore = document.getElementById('explore-view');
  const inbox = document.getElementById('inbox-view');
  const profile = document.getElementById('profile-view');

  feed.classList.add('hidden');
  explore.classList.add('hidden');
  inbox.classList.add('hidden');
  profile.classList.add('hidden');

  // Reset warna ikon navigasi
  ['feed', 'explore', 'inbox', 'profile'].forEach(t => {
    const btn = document.getElementById(`nav-btn-${t}`);
    if (btn) {
      btn.className = 'flex flex-col items-center text-slate-400 hover:text-white transition';
    }
  });

  // Tampilkan tab aktif
  if (tab === 'explore') {
    explore.classList.remove('hidden');
    renderExploreGrid();
    document.getElementById('nav-btn-explore').className = 'flex flex-col items-center text-amber-400 font-medium';
  } else if (tab === 'inbox') {
    inbox.classList.remove('hidden');
    document.getElementById('nav-btn-inbox').className = 'flex flex-col items-center text-amber-400 font-medium';
  } else if (tab === 'profile') {
    profile.classList.remove('hidden');
    document.getElementById('nav-btn-profile').className = 'flex flex-col items-center text-amber-400 font-medium';
  } else {
    feed.classList.remove('hidden');
    document.getElementById('nav-btn-feed').className = 'flex flex-col items-center text-amber-400 font-medium';
  }

  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
}

// Render Feed Video
function renderFeed() {
  const feed = document.getElementById('video-feed');
  if (!feed) return;
  feed.innerHTML = '';

  MOCK_VIDEOS.forEach((video) => {
    const item = document.createElement('div');
    item.className = 'snap-start relative w-full h-full flex items-center justify-center bg-black';
    item.innerHTML = `
      <video class="w-full h-full object-cover cursor-pointer" loop playsinline src="${video.video_url}"></video>
      
      <div class="absolute bottom-4 left-4 right-16 z-20 space-y-2 pointer-events-none">
        <h4 class="font-bold text-base drop-shadow">${video.username}</h4>
        <p class="text-xs text-slate-200 line-clamp-2 drop-shadow">${video.caption}</p>
        <div class="flex items-center space-x-2 text-xs text-slate-300">
          <i data-lucide="music" class="w-3.5 h-3.5 animate-spin-slow"></i>
          <span>${video.music}</span>
        </div>
      </div>

      <div class="absolute right-3 bottom-8 z-20 flex flex-col items-center space-y-5">
        <button onclick="toggleLike(this)" class="flex flex-col items-center text-white hover:scale-110 transition">
          <i data-lucide="heart" class="w-7 h-7"></i>
          <span class="text-xs mt-1 font-semibold">${video.likes_count}</span>
        </button>
        <button onclick="openAuthModal('login')" class="flex flex-col items-center text-white hover:scale-110 transition">
          <i data-lucide="message-circle" class="w-7 h-7"></i>
          <span class="text-xs mt-1 font-semibold">${video.comments_count}</span>
        </button>
        <button class="flex flex-col items-center text-white hover:scale-110 transition">
          <i data-lucide="share-2" class="w-7 h-7"></i>
          <span class="text-xs mt-1 font-semibold">Bagi</span>
        </button>
      </div>
    `;

    const v = item.querySelector('video');
    v.addEventListener('click', () => { if (v.paused) v.play(); else v.pause(); });
    feed.appendChild(item);
  });

  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
}

// Render Grid Temukan (Explore)
function renderExploreGrid() {
  const grid = document.getElementById('explore-grid');
  if (!grid) return;
  grid.innerHTML = '';

  MOCK_VIDEOS.forEach((video) => {
    const card = document.createElement('div');
    card.className = 'relative bg-slate-800 rounded-xl overflow-hidden aspect-[3/4] cursor-pointer border border-slate-700/50';
    card.innerHTML = `
      <video class="w-full h-full object-cover" src="${video.video_url}"></video>
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

// Modal Upload (Tombol +)
function openUploadModal() {
  document.getElementById('modal-upload').classList.remove('hidden');
}

function closeUploadModal() {
  document.getElementById('modal-upload').classList.add('hidden');
}

function previewVideoFile(e) {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    document.getElementById('upload-url').value = url;
  }
}

function handleUploadSubmit(e) {
  e.preventDefault();
  const caption = document.getElementById('upload-caption').value;
  const audioType = document.getElementById('upload-audio-type').value;
  const videoUrl = document.getElementById('upload-url').value || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  const newPost = {
    id: Date.now().toString(),
    username: currentUser.username || '@kreator_tatap',
    caption: caption,
    music: audioType === 'Suara Asli' ? `Suara Asli - ${currentUser.username}` : audioType,
    video_url: videoUrl,
    likes_count: 0,
    comments_count: 0
  };

  MOCK_VIDEOS.unshift(newPost);
  renderFeed();
  closeUploadModal();
  switchTab('feed');
  alert('Postingan video Anda berhasil dipublikasikan!');
}

// Modal Edit Profil
function openEditProfileModal() {
  document.getElementById('edit-name').value = currentUser.name || '';
  document.getElementById('edit-age').value = currentUser.age || '';
  document.getElementById('edit-job').value = currentUser.job || '';
  document.getElementById('edit-hobby').value = currentUser.hobby || '';
  document.getElementById('edit-status').value = currentUser.status || '';
  document.getElementById('modal-edit-profile').classList.remove('hidden');
}

function closeEditProfileModal() {
  document.getElementById('modal-edit-profile').classList.add('hidden');
}

function handleProfileSubmit(e) {
  e.preventDefault();
  currentUser.name = document.getElementById('edit-name').value;
  currentUser.username = '@' + currentUser.name.toLowerCase().replace(/\s+/g, '_');
  currentUser.age = document.getElementById('edit-age').value;
  currentUser.job = document.getElementById('edit-job').value;
  currentUser.hobby = document.getElementById('edit-hobby').value;
  currentUser.status = document.getElementById('edit-status').value;

  updateProfileDisplay();
  closeEditProfileModal();
  alert('Data diri berhasil diperbarui!');
}

function updateProfileDisplay() {
  document.getElementById('profile-display-name').innerText = currentUser.username;
  document.getElementById('profile-display-status').innerText = `"${currentUser.status}"`;
  document.getElementById('profile-display-age').innerText = currentUser.age ? `${currentUser.age} tahun` : '-';
  document.getElementById('profile-display-job').innerText = currentUser.job || '-';
  document.getElementById('profile-display-hobby').innerText = currentUser.hobby || '-';
  document.getElementById('profile-avatar-text').innerText = (currentUser.name || 'U').charAt(0).toUpperCase();
}

// Modal Auth & Login
function openAuthModal(mode = 'login') {
  setAuthMode(mode);
  document.getElementById('modal-auth').classList.remove('hidden');
}

function closeAuthModal() {
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
    tabLogin.className = 'flex-1 py-2 rounded-lg bg-amber-400 text-black transition';
    tabRegister.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition';
  } else {
    title.innerText = 'Daftar Akun TATAP';
    btnSubmit.innerText = 'Daftar';
    groupUsername.classList.remove('hidden');
    tabRegister.className = 'flex-1 py-2 rounded-lg bg-amber-400 text-black transition';
    tabLogin.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition';
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  closeAuthModal();
  alert('Berhasil masuk ke aplikasi TATAP!');
}

function loginWithFacebook() {
  alert('Fitur login dengan Facebook segera aktif!');
}

function loginWithTwitter() {
  alert('Fitur login dengan Twitter (X) segera aktif!');
}

function loginAsDemo() {
  closeAuthModal();
  alert('Masuk menggunakan Mode Demo.');
}

function toggleLike(btn) {
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
