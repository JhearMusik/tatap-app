// Data Video Mock / Bawaan
const MOCK_VIDEOS = [
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
let currentUser = null;

// Inisialisasi saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  // Hilangkan Splash Screen secara mulus setelah 2 detik
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 700);
    }
  }, 2000);

  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
  renderFeed();
});

// Fungsi Render Feed Video
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

// Fungsi Modal Auth
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

// Handler Submit Email/Password
function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  currentUser = { email, username: authMode === 'register' ? document.getElementById('auth-username').value : '@pengguna_tatap' };
  closeAuthModal();
  alert('Berhasil masuk ke aplikasi TATAP!');
}

// Login Sosial Media (Facebook & Twitter/X)
function loginWithFacebook() {
  alert('Fitur login dengan Facebook akan segera dihubungkan ke Supabase OAuth!');
}

function loginWithTwitter() {
  alert('Fitur login dengan Twitter (X) akan segera dihubungkan ke Supabase OAuth!');
}

function loginAsDemo() {
  currentUser = { username: '@tamu_tatap' };
  closeAuthModal();
  alert('Masuk menggunakan Mode Demo.');
}

// Interaksi Like Video
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
