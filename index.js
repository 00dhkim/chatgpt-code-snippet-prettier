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
  // 모든 pre > code 요소에 대해 처리
  document.querySelectorAll("pre > code").forEach((codeBlock) => {
    const preElement = codeBlock.parentElement;

    // 이미 감싸진 경우를 피하기 위해 wrapper 클래스 확인
    if (!preElement.parentElement.classList.contains("code-block-wrapper")) {
      // 새 wrapper div 생성 및 클래스 추가
      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper";
      // preElement를 감싸도록 wrapper 삽입
      preElement.parentElement.insertBefore(wrapper, preElement);
      wrapper.appendChild(preElement);
    }

    const wrapper = preElement.parentElement;

    // 이미 버튼이 추가되어 있으면 건너뜀
    if (wrapper.querySelector(".code-toggle-btn") == null) {
      // 코드 블록 초기 상태 설정
      preElement.classList.add("user-block");
      codeBlock.classList.add("user-block", "collapsed");

      // 토글 버튼 생성
      const toggleButton = document.createElement("button");
      toggleButton.textContent = "Load More";
      toggleButton.className = "code-toggle-btn";

      // 버튼 클릭 시 코드 접기/피기 기능
      toggleButton.addEventListener("click", () => {
        if (codeBlock.classList.contains("collapsed")) {
          // 코드 확장 시: "Show Less" 버튼으로 변경
          codeBlock.classList.remove("collapsed");
          toggleButton.textContent = "Show Less";
          toggleButton.classList.add("sticky-toggle");
        } else {
          // 코드 접힘 시: "Load More" 버튼으로 변경
          codeBlock.classList.add("collapsed");
          toggleButton.textContent = "Load More";
          toggleButton.classList.remove("sticky-toggle");
          codeBlock.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });

      // wrapper 안에서 preElement의 바로 다음에 버튼 삽입
      preElement.insertAdjacentElement("afterend", toggleButton);
    }
  });
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
