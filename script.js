let currentViewDate = new Date();
let selectedDate = null;
const ADMIN_PIN = "242628"; // 기본 로그인 번호
let isLoggedIn = localStorage.getItem('calendarLogin') === 'true';

// 페이지 로드 즉시 실행
document.addEventListener('DOMContentLoaded', () => {
    const savedProfile = localStorage.getItem('profileImg');
    if(savedProfile) {
        document.getElementById('profileDisplay').style.backgroundImage = `url(${savedProfile})`;
    }
    updateUI();
});

// 프로필 사진 변경 로직
document.getElementById('profileDisplay').onclick = function() {
    if (isLoggedIn) {
        document.getElementById('profileUpload').click();
    } else {
        alert("먼저 인증을 완료해 주세요!");
    }
};

function changeProfile(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('profileDisplay').style.backgroundImage = `url(${e.target.result})`;
            localStorage.setItem('profileImg', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 로그인 및 UI 업데이트
function updateUI() {
    document.getElementById('loginInputArea').style.display = isLoggedIn ? 'none' : 'flex';
    document.getElementById('loginSuccessArea').style.display = isLoggedIn ? 'flex' : 'none';
    document.getElementById('profileDisplay').style.cursor = isLoggedIn ? 'pointer' : 'default';
    renderCalendar();
}

function checkLogin() {
    const inputVal = document.getElementById('adminPin').value;
    if (inputVal === ADMIN_PIN) {
        isLoggedIn = true;
        localStorage.setItem('calendarLogin', 'true');
        updateUI();
        alert("인증 성공! 이제 자유롭게 기록할 수 있습니다.");
    } else {
        alert("인증번호가 틀렸습니다.");
    }
}

function handleLogout() {
    isLoggedIn = false;
    localStorage.removeItem('calendarLogin');
    updateUI();
}

// 달력 생성 함수
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    if(!calendar) return; // 요소 안전 확인

    calendar.innerHTML = '';
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    document.getElementById('monthDisplay').innerText = `${year}년 ${month + 1}월`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // 시작 빈 칸
    for (let i = 0; i < firstDay; i++) {
        calendar.appendChild(document.createElement('div'));
    }

    // 날짜 칸 생성
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

// 모달 처리
function openModal(date) {
    selectedDate = date;
    const saved = JSON.parse(localStorage.getItem(date));
    document.getElementById('viewDate').innerText = date;
    document.getElementById('editDateDisplay').innerText = `${date} 편집`;
    
    const imgContainer = document.getElementById('imageContainer');
    imgContainer.innerHTML = '';

    if (saved && saved.imgs) {
        saved.imgs.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            imgContainer.appendChild(img);
        });
    }

    document.getElementById('viewText').innerText = saved ? saved.text : "아직 기록된 내용이 없어요.";
    document.getElementById('textInput').value = saved ? saved.text : "";
    document.getElementById('adminButtons').style.display = isLoggedIn ? 'block' : 'none';
    
    toggleEditMode(false);
    document.getElementById('modal').style.display = 'flex';
}

function toggleEditMode(isEdit) {
    document.getElementById('viewMode').style.display = isEdit ? 'none' : 'block';
    document.getElementById('editMode').style.display = isEdit ? 'block' : 'none';
}

// 데이터 저장 (다중 이미지 지원)
async function saveData() {
    const fileInput = document.getElementById('imageInput');
    const text = document.getElementById('textInput').value;
    const files = Array.from(fileInput.files);
    let imgArray = [];

    if (files.length > 0) {
        const readFiles = files.map(file => {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        });
        imgArray = await Promise.all(readFiles);
    } else {
        const saved = JSON.parse(localStorage.getItem(selectedDate));
        imgArray = saved ? saved.imgs : [];
    }

    localStorage.setItem(selectedDate, JSON.stringify({ imgs: imgArray, text: text }));
    renderCalendar(); 
    closeModal();
}

function deleteData() {
    if (confirm("이 날의 기록을 삭제하시겠습니까?")) {
        localStorage.removeItem(selectedDate);
        renderCalendar(); 
        closeModal();
    }
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }
function changeMonth(diff) { currentViewDate.setMonth(currentViewDate.getMonth() + diff); renderCalendar(); }