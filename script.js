let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeRemaining;
let students = JSON.parse(localStorage.getItem("students")) || [];

function generateQuestions() {
  const courseName = document.getElementById("courseName").value;
  const courseCode = document.getElementById("courseCode").value;
  const numTFQuestions = document.getElementById("numTFQuestions").value;
  const numMCQQuestions = document.getElementById("numMCQQuestions").value;
  const examDuration = document.getElementById("examDuration").value;

  localStorage.setItem("courseName", JSON.stringify(courseName));
  localStorage.setItem("courseCode", JSON.stringify(courseCode));

  const questionsContainer = document.getElementById("questionsContainer");
  questionsContainer.innerHTML = "";

  for (let i = 0; i < numTFQuestions; i++) {
    questionsContainer.innerHTML += `
            <div>
                <label>سؤال ${i + 1} (صح/خطأ):</label>
                <input type="text" id="tfQuestion${i}" placeholder="نص السؤال">
                <label>الإجابة الصحيحة:</label>
                <select id="tfAnswer${i}">
                    <option value="true">صح</option>
                    <option value="false">خطأ</option>
                </select>
            </div>
        `;
  }

  for (let i = 0; i < numMCQQuestions; i++) {
    questionsContainer.innerHTML += `
            <div>
                <label>سؤال ${
                  i + 1 + parseInt(numTFQuestions)
                } (اختيار من متعدد):</label>
                <input type="text" id="mcqQuestion${i}" placeholder="نص السؤال">
                <label>اختيارات:</label>
                <input type="text" id="mcqOption${i}a" placeholder="اختيار أ">
                <input type="text" id="mcqOption${i}b" placeholder="اختيار ب">
                <input type="text" id="mcqOption${i}c" placeholder="اختيار ج">
                <input type="text" id="mcqOption${i}d" placeholder="اختيار د">
                <label>الإجابة الصحيحة:</label>
                <select id="mcqAnswer${i}">
                    <option value="a">أ</option>
                    <option value="b">ب</option>
                    <option value="c">ج</option>
                    <option value="d">د</option>
                </select>
            </div>
        `;
  }

  questionsContainer.innerHTML += `
        <button type="button" onclick="saveQuestions()">حفظ الأسئلة</button>
    `;
}

function saveQuestions() {
  const numTFQuestions = document.getElementById("numTFQuestions").value;
  const numMCQQuestions = document.getElementById("numMCQQuestions").value;
  const examDuration = document.getElementById("examDuration").value;

  questions = [];

  for (let i = 0; i < numTFQuestions; i++) {
    const question = document.getElementById(`tfQuestion${i}`).value;
    const answer = document.getElementById(`tfAnswer${i}`).value;
    questions.push({ type: "tf", question, answer });
  }

  for (let i = 0; i < numMCQQuestions; i++) {
    const question = document.getElementById(`mcqQuestion${i}`).value;
    const options = {
      a: document.getElementById(`mcqOption${i}a`).value,
      b: document.getElementById(`mcqOption${i}b`).value,
      c: document.getElementById(`mcqOption${i}c`).value,
      d: document.getElementById(`mcqOption${i}d`).value,
    };
    const answer = document.getElementById(`mcqAnswer${i}`).value;
    questions.push({ type: "mcq", question, options, answer });
  }

  localStorage.setItem("questions", JSON.stringify(questions));
  localStorage.setItem("examDuration", examDuration);

  alert("تم حفظ الأسئلة بنجاح!");
}

function startExam() {
  const studentName = document.getElementById("studentName").value;
  const studentID = document.getElementById("studentID").value;

  if (
    studentName.replace(/\s/g, "") === "" &&
    studentID.replace(/\s/g, "") === ""
  ) {
    alert("يرجى إدخال الاسم والرقم الأكاديمي.");
    return;
  }

  if (studentName.replace(/\s/g, "") === "") {
    alert("يرجى إدخال الاسم .");
    return;
  }
  if (studentID.replace(/\s/g, "") === "") {
    alert("يرجى إدخال الرقم الأكاديمي.");
    return;
  }

  localStorage.setItem("studentName", JSON.stringify(studentName));

  document.getElementById("studentForm").style.display = "none";
  document.getElementById("examContainer").style.display = "block";

  const storedQuestions = localStorage.getItem("questions");
  const storedExamDuration = localStorage.getItem("examDuration");

  // check if there are questions
  if (!storedQuestions) {
    alert("لا يوجد إمتحان.");
    return;
  }

  if (storedQuestions) {
    questions = JSON.parse(storedQuestions);
  }
  questions = shuffleArray(questions);

  questions.forEach((question) => {
    if (question.type === "mcq") {
      question.options = shuffleOptions(question.options);
    }
  });

  currentQuestionIndex = 0;
  score = 0;
  timeRemaining = parseInt(storedExamDuration) * 60;
  showQuestion();

  timer = setInterval(updateTimer, 1000);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function shuffleOptions(options) {
  const keys = Object.keys(options);
  const shuffledKeys = shuffleArray(keys.slice());
  const shuffledOptions = {};
  shuffledKeys.forEach((key) => {
    shuffledOptions[key] = options[key];
  });
  return shuffledOptions;
}

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    showResult();
    return;
  }

  const examContainer = document.getElementById("examContainer");
  examContainer.innerHTML = "";

  const question = questions[currentQuestionIndex];

  if (question.type === "tf") {
    examContainer.innerHTML = `
            <div>
                <h3>سؤال ${currentQuestionIndex + 1}:</h3>
                <p>${question.question}</p>
                <label><input type="radio" name="answer" value="true"> صح</label>
                <label><input type="radio" name="answer" value="false"> خطأ</label>
            </div>
        `;
  } else if (question.type === "mcq") {
    examContainer.innerHTML = `
            <div>
                <h3>سؤال ${currentQuestionIndex + 1}:</h3>
                <p>${question.question}</p>
                <label><input type="radio" name="answer" value="a"> ${
                  question.options.a
                }</label><br>
                <label><input type="radio" name="answer" value="b"> ${
                  question.options.b
                }</label><br>
                <label><input type="radio" name="answer" value="c"> ${
                  question.options.c
                }</label><br>
                <label><input type="radio" name="answer" value="d"> ${
                  question.options.d
                }</label><br>
            </div>
        `;
  }

  examContainer.innerHTML += `
        <button type="button" onclick="submitAnswer()">التالي</button>
    `;
}

function submitAnswer() {
  const selectedAnswer = document.querySelector('input[name="answer"]:checked');
  if (!selectedAnswer) {
    alert("يرجى اختيار إجابة.");
    return;
  }

  const question = questions[currentQuestionIndex];
  if (selectedAnswer.value === question.answer) {
    score++;
  }

  currentQuestionIndex++;
  showQuestion();
}

function updateTimer() {
  const timerElement = document.getElementById("timer");
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerElement.textContent = `الوقت المتبقي: ${minutes}:${
    seconds < 10 ? "0" : ""
  }${seconds}`;

  if (timeRemaining === 60) {
    alert("تبقى دقيقة واحدة فقط!");
  }

  if (timeRemaining <= 0) {
    clearInterval(timer);
    showResult();
    return;
  }

  timeRemaining--;
}

function showResult() {
  clearInterval(timer); // Stop the timer

  const examContainer = document.getElementById("examContainer");

  examContainer.innerHTML = `
    <h3> نتيجة الطالب : ${localStorage
      .getItem("studentName")
      .replace(/"/g, "")} </h3>
    <h3>نتيجة مادة : ${localStorage
      .getItem("courseName")
      .replace(/"/g, "")} </h3>
    <p>لقد أجبت بشكل صحيح على ${score} من ${questions.length} سؤال.</p>
`;

  const studentName = document.getElementById("studentName").value;
  const studentID = document.getElementById("studentID").value;

  // Store student data
  students.push({ name: studentName, id: studentID, score });
  localStorage.setItem("students", JSON.stringify(students));
}

function exportToExcel() {
  if (students.length !== 0) {
    const headers = [
      "الدرجة",
      "كود المادة",
      "المادة",
      "الرقم الأكاديمي",
      "الاسم",
    ];
    const data = students.map((student) => [
      student.score,
      localStorage.getItem("courseCode").replace(/"/g, ""),
      localStorage.getItem("courseName").replace(/"/g, ""),
      student.id,
      student.name,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الطلاب");

    XLSX.writeFile(wb, "نتائج_الطلاب.xlsx");
  } else alert("لا يوجد نتائج للتصدير!");
}

// window.onbeforeunload = function () {
//   localStorage.clear();
// };

document.addEventListener("DOMContentLoaded", () => {
  const exportButton = document.getElementById("exportButton");
  if (exportButton) {
    exportButton.addEventListener("click", exportToExcel);
  }
});

function clearStorage() {
  localStorage.clear();
  students = [];
  alert("تم مسح التخزين بنجاح!");
}
