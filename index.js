//// 붙여넣기시 이벤트 적용
// 1. 코드 감지
// 2. 감싼 코드로 입력창 대체
// 2-1. 입력창에서 원래 코드 탐지
// 2-2. 앞뒤로 삼중 백틱 집어넣기

//코드 감지
const languagePatterns = [
  { name: "javascript", pattern: /\b(function|let|const|var|class|console\.log|=>|\{|\})\b/ },
  { name: "python", pattern: /\b(def|class|import|print)\b/ },
  { name: "java", pattern: /\b(class|public|private|static|void)\b/ },
  { name: "c", pattern: /\b(int|char|void|if|for|while)\b/ },
];

function detectCode(text) {
  for (let lang of languagePatterns) {
    if (lang.pattern.test(text)) return lang.name;
  }

  return null;
}

//배열 속 배열 찾기
function findIdxOfArray(srcArray, targetSequence) {
  for (let i = 0; i < srcArray.length; i++) {
    let isMatched = true;
    for (let j = 0; j < targetSequence.length; j++) {
      if (srcArray[i + j] == targetSequence[j]) continue;
      isMatched = false;
      break;
    }

    if (isMatched) return i;
  }
  return -1;
}

//이벤트 리스너 적용
function pasteEventListener(event) {
  const pastedText = event.clipboardData.getData("text");

  ////언어 탐지
  const detectedLanguage = detectCode(pastedText);
  if (!detectedLanguage) return;

  ////입력창에서의 위치 찾기
  const pastedCodeList = pastedText.split("\n");
  if (pastedCodeList[pastedCodeList.length - 1].length === 0) pastedCodeList.pop();

  const inputField = document.getElementById("prompt-textarea").getElementsByTagName("p");
  const inputList = Array.from(inputField).map((v) => v.textContent);

  const locAtInput = findIdxOfArray(inputList, pastedCodeList);
  console.log(locAtInput);
  if (locAtInput === -1) return;

  ////앞 뒤로 삼중 백틱 삽입
  //삽입할 노드 생성
  const upperNode = document.createElement("p");
  upperNode.textContent = `\`\`\`${detectedLanguage}`;
  const lowerNode = document.createElement("p");
  lowerNode.textContent = `\`\`\``;

  //삽입
  let parentNode = document.getElementById("prompt-textarea");
  parentNode.insertBefore(
    lowerNode,
    parentNode.getElementsByTagName("p")[locAtInput + pastedCodeList.length]
  );

  parentNode = document.getElementById("prompt-textarea");
  parentNode.insertBefore(upperNode, parentNode.getElementsByTagName("p")[locAtInput]);
}

function addPasteEventlistener() {
  const textArea = document.getElementById("prompt-textarea");

  if (textArea) textArea.addEventListener("paste", pasteEventListener);
  else setTimeout(addPasteEventlistener, 1000);
}

window.onload = () => {
  addPasteEventlistener();
};

////유저 코드 스타일링
//1. pre > code 요소에 코드 스니펫 스타일링
//2. 접기 / 피기 버튼 추가 및 길이 조정

//접기 / 피기 버튼 추가
function styleUserBlock() {
  // 코드 블록에 접기/피기 버튼을 추가하는 코드
  document.querySelectorAll("pre > code").forEach((codeBlock) => {
    // 이미 버튼이 추가되어 있다면 건너뜀
    if (codeBlock.parentElement.getElementsByTagName("button").length > 0) return;

    codeBlock.parentElement.classList.add("user-block");
    codeBlock.classList.add("user-block");
    codeBlock.classList.add("collapsed");

    const toggleButton = document.createElement("button");
    toggleButton.textContent = "Load More";
    toggleButton.className = "code-toggle-btn";

    // 버튼 클릭 시 코드 접기/피기 기능
    toggleButton.addEventListener("click", () => {
      if (codeBlock.classList.contains("collapsed")) {
        // 코드 확장 시: "Show Less" 버튼으로 변경
        codeBlock.classList.remove("collapsed");
        toggleButton.textContent = "Show Less";
        // 스크롤 감지해서 원래 위치가 보이지 않으면 하단에 고정되는 복제본 생성
        createFixedClone(toggleButton);
      } else {
        // 코드 접힘 시: "Load More" 버튼으로 변경
        codeBlock.classList.add("collapsed");
        toggleButton.textContent = "Load More";
        // 고정 복제본 제거
        removeFixedClone(toggleButton);
        // 스크롤을 코드 블록 시작 위치로 이동
        codeBlock.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    // 버튼을 코드 블록 컨테이너에 추가
    codeBlock.parentNode.append(toggleButton);
  });
}

// 원본 버튼의 복제본을 만들어 화면 하단에 고정시키는 함수
function createFixedClone(originalButton) {
  // 이미 복제본이 있으면 생성하지 않음
  if (originalButton.fixedClone) return;
  const fixedClone = originalButton.cloneNode(true);
  fixedClone.classList.add("fixed-toggle");
  // 복제본에도 클릭 이벤트 추가 (원본 버튼 클릭과 동일 동작)
  fixedClone.addEventListener("click", () => {
    originalButton.click();
  });
  document.body.appendChild(fixedClone);
  originalButton.fixedClone = fixedClone;

  // IntersectionObserver로 원본 버튼의 가시성을 감지
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // 원본 버튼이 전부 보이지 않으면 고정 복제본을 보이고,
      // 보이면 숨깁니다.
      if (!entry.isIntersecting) {
        fixedClone.style.display = "block";
      } else {
        fixedClone.style.display = "none";
      }
    });
  }, { threshold: 1.0 });
  observer.observe(originalButton);
  originalButton.fixedCloneObserver = observer;

  // 초기 상태는 숨김 처리
  fixedClone.style.display = "none";
}

// 고정 복제본을 제거하는 함수
function removeFixedClone(originalButton) {
  if (originalButton.fixedClone) {
    originalButton.fixedClone.remove();
    originalButton.fixedClone = null;
  }
  if (originalButton.fixedCloneObserver) {
    originalButton.fixedCloneObserver.disconnect();
    originalButton.fixedCloneObserver = null;
  }
}

// MutationObserver로 DOM 변경 감지 (기존 코드 유지)
const observer = new MutationObserver(() => {
  observer.disconnect();
  styleUserBlock();
  observer.observe(obserbeTargetNode, {
    childList: true, // 자식 요소의 추가/삭제 감지
    subtree: true, // 하위 노드에 대해서도 감지
  });
});

const obserbeTargetNode = document.getElementsByTagName("main")[0];
observer.observe(obserbeTargetNode, {
  childList: true, // 자식 요소의 추가/삭제 감지
  subtree: true, // 하위 노드에 대해서도 감지
});
