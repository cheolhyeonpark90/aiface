// src/main.js

// --- 1. DOM 요소 가져오기 ---
const imageUpload = document.getElementById('imageUpload');
const uploadContainer = document.getElementById('upload-container');
const uploadLabel = document.getElementById('upload-label');
const uploadText = document.getElementById('upload-text');
const imagePreview = document.getElementById('imagePreview');
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const resultContainer = document.getElementById('result-container');
const resultImage = document.getElementById('resultImage'); // ✅ 결과 이미지 요소 추가
const estimatedAgeEl = document.getElementById('estimatedAge');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const retryBtn = document.getElementById('retryBtn');

let estimatedAge = null;

// --- 2. AI 모델 로딩 ---
async function loadModels() {
  console.log('AI 모델 로딩 시작...');
  const MODEL_URL = '/models';
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
    ]);
    console.log('AI 모델 로딩 완료!');
    uploadText.textContent = '사진을 드래그, 붙여넣기, 클릭하여 업로드하세요.';
  } catch (error) {
    console.error('모델 로딩에 실패했습니다:', error);
    uploadText.textContent = '모델 로딩 실패! 새로고침 해주세요.';
    alert('AI 모델을 불러오는 데 문제가 발생했습니다. 페이지를 새로고침 해보세요.');
  }
}

// --- 3. 얼굴 분석 실행 ---
async function analyzeFace() {
  // 1. 이전 결과 지우고 로딩 화면 표시
  resetResultUI();
  showLoader();
  console.log('얼굴 분석을 시작합니다...');
  
  // 2. AI를 사용해 얼굴 분석 실행 (완료될 때까지 기다림)
  const detections = await faceapi.detectSingleFace(imagePreview).withAgeAndGender();
  
  // 3. 0.5초 딜레이를 주어 로딩 화면이 사라진 후 결과를 표시
  setTimeout(() => {
    // 3-1. 로딩 화면 숨기기
    loader.classList.add('hidden'); 

    // 3-2. 분석 결과에 따라 화면 처리
    if (detections) {
      // 얼굴 분석에 성공한 경우
      console.log('분석 결과:', detections);
      estimatedAge = Math.round(detections.age);
      
      // 결과 화면에 이미지와 나이 표시
      resultImage.src = imagePreview.src; 
      estimatedAgeEl.textContent = estimatedAge;

      // 업로드 창은 숨기고 결과 창을 보여줌
      uploadContainer.classList.add('hidden');
      resultContainer.classList.remove('hidden');
      
      // 버튼 활성화 및 결과 카드 생성
      downloadBtn.disabled = false;
      shareBtn.disabled = false;
      drawMemeCard();
    } else {
      // 얼굴 분석에 실패한 경우
      console.log('얼굴을 찾지 못했습니다.');
      alert('얼굴을 인식할 수 없습니다. 더 선명한 정면 사진으로 다시 시도해주세요.');
      resetUploadUI();
    }
  }, 500); // 0.5초(500ms) 지연
}

// --- 4. 파일 처리 및 UI 제어 ---
function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드할 수 있습니다.');
    return;
  }
  resetResultUI();
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    imagePreview.onload = () => analyzeFace();
  };
  reader.readAsDataURL(file);
}

function resetUploadUI() {
  resultContainer.classList.add('hidden');
  loader.classList.add('hidden');
  uploadContainer.classList.remove('hidden');
  uploadContainer.style.backgroundImage = '';
  uploadLabel.classList.remove('hidden');

  const previewContainer = document.getElementById('meme-card-preview');
  previewContainer.innerHTML = '<p class="text-gray-400 text-sm p-4 text-center">결과가 여기에 표시됩니다</p>';
  
  resetResultUI();
}

function resetResultUI() {
  resultImage.src = '#'; // ✅ 결과 이미지 초기화
  estimatedAge = null;
  downloadBtn.disabled = true;
  shareBtn.disabled = true;
}

function showLoader() {
  uploadContainer.classList.add('hidden');
  loader.classList.remove('hidden');
  progressBar.style.width = '0%';
  setTimeout(() => { progressBar.style.width = '100%'; }, 100); 
}

function hideLoader() {
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 500);
}

// --- 5. 밈 카드 생성 및 공유 기능 ---
async function drawMemeCard() {
    const previewContainer = document.getElementById('meme-card-preview');
    previewContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const userImage = document.getElementById('imagePreview');
    const imgRatio = userImage.naturalWidth / userImage.naturalHeight;
    const canvasRatio = canvas.width / (canvas.height - 180);
    let drawWidth, drawHeight, offsetX, offsetY;
    if (imgRatio > canvasRatio) {
        drawHeight = canvas.height - 180;
        drawWidth = drawHeight * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 90;
    } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - 180 - drawHeight) / 2 + 90;
    }
    ctx.drawImage(userImage, offsetX, offsetY, drawWidth, drawHeight);
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(0, 0, canvas.width, 180);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = 'bold 80px sans-serif';
    ctx.fillText(`AI 분석결과 ${estimatedAge}세`, canvas.width / 2, 115);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '30px sans-serif';
    ctx.fillText('aiface.pages.dev', canvas.width / 2, canvas.height - 50);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.objectFit = 'contain';
    previewContainer.appendChild(canvas);
}

function downloadCanvasImage() {
    const canvas = document.querySelector('#meme-card-preview canvas');
    if (!canvas) {
        alert('다운로드할 이미지가 없습니다.');
        return;
    }
    const link = document.createElement('a');
    link.download = `aiface-test-result.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// --- 6. 이벤트 리스너 설정 ---
window.addEventListener('load', loadModels);
uploadContainer.addEventListener('click', () => imageUpload.click());
imageUpload.addEventListener('change', (event) => handleFile(event.target.files[0]));
uploadContainer.addEventListener('dragover', (event) => {
  event.preventDefault();
  uploadContainer.classList.add('border-orange-500', 'bg-orange-50');
});
uploadContainer.addEventListener('dragleave', () => {
  uploadContainer.classList.remove('border-orange-500', 'bg-orange-50');
});
uploadContainer.addEventListener('drop', (event) => {
  event.preventDefault();
  uploadContainer.classList.remove('border-orange-500', 'bg-orange-50');
  handleFile(event.dataTransfer.files[0]);
});
window.addEventListener('paste', (event) => {
    const items = event.clipboardData.items;
    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            handleFile(file);
            break;
        }
    }
});
downloadBtn.addEventListener('click', downloadCanvasImage);
shareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('링크가 복사되었어요! 친구에게 공유해보세요.');
    }).catch(err => {
        console.error('링크 복사 실패:', err);
        alert('링크 복사에 실패했어요.');
    });
});
retryBtn.addEventListener('click', resetUploadUI);