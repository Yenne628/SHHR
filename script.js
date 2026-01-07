const PROFILE_IMAGE_URL = "https://cdn.discordapp.com/attachments/1454043761205186602/1458521421356601600/E142D088-C78C-4B51-825E-9B060493CF55.png?ex=695ff16c&is=695e9fec&hm=76a24d4d2716b40fe1bef0ecfbe590f6aec62bad5c6b43b5ca4ecc4b24e3bafd&"; 
const ADMIN_PIN = "242628";

let currentViewDate = new Date();
let selectedDate = null;
let isLoggedIn = localStorage.getItem('calendarLogin') === 'true';

document.addEventListener('DOMContentLoaded', () => {
    const profileImg = document.getElementById('profileDisplay');
    if (PROFILE_IMAGE_URL) profileImg.style.backgroundImage = `url('${PROFILE_IMAGE_URL}')`;
    updateUI();
});

function updateUI() {
    document.getElementById('loginInputArea').style.display = isLoggedIn ? 'none' : 'flex';
    document.getElementById('loginSuccessArea').style.display = isLoggedIn ? 'flex' : 'none';
    renderCalendar();
}

function checkLogin() {
    const pin = document.getElementById('adminPin').value;
    if (pin === ADMIN_PIN) {
        isLoggedIn = true;
        localStorage.setItem('calendarLogin', 'true');
        updateUI();
    } else { alert("비밀번호를 확인해주세요."); }
}

function handleLogout() {
    if(confirm("로그아웃 하시겠습니까?")) {
        isLoggedIn = false;
        localStorage.removeItem('calendarLogin');
        updateUI();
    }
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    document.getElementById('monthDisplay').innerText = `${year}년 ${month + 1}월`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendar.appendChild(document.createElement('div'));
    }

    for (let i = 1; i <= lastDate; i++) {
        const dateKey = `${year}-${month + 1}-${i}`;
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.innerHTML = `<span class="day-number">${i}</span>`;
        
        const saved = JSON.parse(localStorage.getItem(dateKey));
        if (saved && saved.imgs && saved.imgs[0]) {
            cell.style.backgroundImage = `url(${saved.imgs[0]})`;
        }
        cell.onclick = () => openModal(dateKey);
        calendar.appendChild(cell);
    }
}

function openModal(date) {
    selectedDate = date;
    const saved = JSON.parse(localStorage.getItem(date));
    document.getElementById('viewDate').innerText = date;
    const imgContainer = document.getElementById('imageContainer');
    imgContainer.innerHTML = '';
    
    if (saved && saved.imgs) {
        saved.imgs.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            imgContainer.appendChild(img);
        });
    }
    document.getElementById('viewText').innerText = saved ? saved.text : "기록이 없습니다.";
    document.getElementById('adminButtons').style.display = isLoggedIn ? 'inline-flex' : 'none';
    toggleEditMode(false);
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function handleOverlayClick(e) {
    if (e.target.id === 'modal') closeModal();
}

async function saveData() {
    const fileInput = document.getElementById('imageInput');
    const text = document.getElementById('textInput').value;
    const btn = document.getElementById('saveBtn');
    
    btn.innerText = "저장 중...";
    btn.disabled = true;

    let imgArray = [];
    const files = Array.from(fileInput.files);

    if (files.length > 0) {
        const readFiles = files.map(file => new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        }));
        imgArray = await Promise.all(readFiles);
    } else {
        const saved = JSON.parse(localStorage.getItem(selectedDate));
        imgArray = saved ? saved.imgs : [];
    }

    try {
        localStorage.setItem(selectedDate, JSON.stringify({ imgs: imgArray, text: text }));
        renderCalendar();
        closeModal();
    } catch (e) {
        alert("저장 용량이 초과되었습니다. 사진 수를 줄여주세요!");
    } finally {
        btn.innerText = "저장하기";
        btn.disabled = false;
    }
}

function deleteData() {
    if (confirm("기록을 삭제할까요?")) {
        localStorage.removeItem(selectedDate);
        renderCalendar();
        closeModal();
    }
}

function changeMonth(diff) {
    currentViewDate.setMonth(currentViewDate.getMonth() + diff);
    renderCalendar();
}

function toggleEditMode(isEdit) {
    document.getElementById('viewMode').style.display = isEdit ? 'none' : 'block';
    document.getElementById('editMode').style.display = isEdit ? 'block' : 'none';
    if(isEdit) {
        const saved = JSON.parse(localStorage.getItem(selectedDate));
        document.getElementById('textInput').value = saved ? saved.text : "";
        document.getElementById('editDateDisplay').innerText = selectedDate + " 기록";
    }
}
