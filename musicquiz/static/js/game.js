var currentQuestionIndex = 0;
var questionContainer = document.getElementById("questionContainer");
var nextButton = document.getElementById("nextButton");

function createMCQ(questionData) {
  var questionDiv = document.createElement("div");
  questionDiv.classList.add("question");

  // TODO: play a song
  var questionText = document.createElement("p");
  questionText.textContent = "Question: " + questionData.answer.text; // Replace with actual question text
  questionDiv.appendChild(questionText);

  var choices = [questionData.answer, ...questionData.choices].sort(
    () => Math.random() - 0.5
  );

  for (var i = 0; i < choices.length; i++) {
    var optionDiv = document.createElement("div");
    optionDiv.classList.add("option");

    var radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.name = "answer" + currentQuestionIndex;
    radioInput.value = choices[i];

    var label = document.createElement("label");
    label.appendChild(radioInput);
    label.appendChild(document.createTextNode(choices[i].title));

    optionDiv.appendChild(label);
    questionDiv.appendChild(optionDiv);
  }

  questionContainer.appendChild(questionDiv);
}

function clearQuestions() {
  questionContainer.innerHTML = "";
}

function showNextQuestion(items) {
  clearQuestions();
  if (currentQuestionIndex < items.length) {
    createMCQ(items[currentQuestionIndex]);
    currentQuestionIndex++;
  } else {
    questionContainer.textContent = "All questions completed!";
    nextButton.style.display = "none";
  }
}

function run(data) {
  items = data["items"];

  nextButton.addEventListener("click", function () {
    showNextQuestion(items);
  });

  // Load the first question on page load
  showNextQuestion(items);
}
