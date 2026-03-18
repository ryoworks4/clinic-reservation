var nameInput = document.getElementById('name-input');
var ageInput = document.getElementById('age-input');
var symptomInput = document.getElementById('symptom-input');
var dateInput = document.getElementById('date-input');
var charCount = document.getElementById('char-count');
var generateBtn = document.getElementById('generate-btn');
var resultArea = document.getElementById('result-area');
var copyBtn = document.getElementById('copy-btn');
var genderButtons = document.querySelectorAll('.gender-btn');
var timeButtons = document.querySelectorAll('.time-btn');
var exampleTags = document.querySelectorAll('.example-tag');

var selectedGender = 'male';
var selectedTime = 'morning';

// 希望日のデフォルトを明日に設定
var tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
dateInput.value = tomorrow.toISOString().split('T')[0];
dateInput.min = tomorrow.toISOString().split('T')[0];

// 文字数カウント
symptomInput.addEventListener('input', function () {
    charCount.textContent = this.value.length;
});

// 性別切替
genderButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        genderButtons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        selectedGender = this.dataset.gender;
    });
});

// 時間帯切替
timeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        timeButtons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        selectedTime = this.dataset.time;
    });
});

// サンプルタグクリック
exampleTags.forEach(function (tag) {
    tag.addEventListener('click', function () {
        symptomInput.value = this.textContent;
        charCount.textContent = this.textContent.length;
        symptomInput.focus();
    });
});

// 生成実行
generateBtn.addEventListener('click', async function () {
    var name = nameInput.value.trim();
    var age = ageInput.value;
    var symptom = symptomInput.value.trim();
    var date = dateInput.value;

    if (!name) {
        resultArea.innerHTML = '<p class="error-text">お名前を入力してください</p>';
        return;
    }

    if (!symptom) {
        resultArea.innerHTML = '<p class="error-text">症状を入力してください</p>';
        return;
    }

    if (symptom.length > 500) {
        resultArea.innerHTML = '<p class="error-text">症状は500文字以内で入力してください</p>';
        return;
    }

    // ローディング表示
    generateBtn.disabled = true;
    generateBtn.textContent = '生成中...';
    copyBtn.style.display = 'none';
    resultArea.innerHTML = '<div class="loading"><span></span><span></span><span></span></div>';

    var genderLabel = { male: '男性', female: '女性', other: 'その他' };
    var timeLabel = { morning: '午前', afternoon: '午後', any: 'どちらでも' };

    try {
        var response = await fetch('/api/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                age: age || '未記入',
                gender: genderLabel[selectedGender],
                symptom: symptom,
                date: date,
                time: timeLabel[selectedTime]
            })
        });

        var responseText = await response.text();

        if (!response.ok) {
            var errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                errorData = { error: '通信エラーが発生しました' };
            }
            resultArea.innerHTML = '<p class="error-text">' + escapeHtml(errorData.error) + '</p>';
            return;
        }

        var data = JSON.parse(responseText);
        resultArea.innerHTML = '<div class="result-content">' +
            '<div class="result-header">' +
            '<span class="result-label">AI予約サマリー</span>' +
            '<span class="result-badge">AI提案</span>' +
            '</div>' +
            '<div class="result-text">' + escapeHtml(data.result) + '...</div>' +
            '<p class="demo-note">※ デモ版のため実際の予約は行われません</p>' +
            '</div>';
        copyBtn.style.display = 'block';
    } catch (error) {
        resultArea.innerHTML = '<p class="error-text">通信エラーが発生しました。もう一度お試しください。</p>';
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'AIで予約内容を整理する';
    }
});

// コピー
copyBtn.addEventListener('click', function () {
    var resultText = document.querySelector('.result-text');
    if (resultText) {
        navigator.clipboard.writeText(resultText.textContent).then(function () {
            copyBtn.textContent = 'コピーしました！';
            setTimeout(function () {
                copyBtn.textContent = 'コピー';
            }, 2000);
        });
    }
});

// HTMLエスケープ
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
