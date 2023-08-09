var currentQuestionIndex = 0;
var questionContainer = document.getElementById("questionContainer");
var nextButton = document.getElementById("nextButton");

function createMCQ(questionData) {
  var questionDiv = document.createElement("div");
  questionDiv.classList.add("question");

  soundFile = loadSound(items[currentQuestionIndex].answer.preview_url);
  soundFile.setVolume(0.2);

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

function showNextQuestion() {
  clearQuestions();
  if (currentQuestionIndex < items.length) {
    createMCQ(items[currentQuestionIndex]);
    currentQuestionIndex++;
  } else {
    questionContainer.textContent = "All questions completed!";
    nextButton.style.display = "none";
  }
}

var canvas;
var soundFile;

function renderWave() {
  strokeWeight(3);
  noFill();
  translate(width / 2, height / 1.8);

  var wave = fft.waveform();

  for (var t = -1; t <= 1; t += 2) {
    beginShape();
    for (var i = 0; i <= 180; i += 1) {
      var index = floor(map(i, 0, 180, 0, wave.length - 1));

      var r = map(wave[index], -1, 1, 300, 600);

      var x = r * sin(i) * t;
      var y = r * cos(i);
      vertex(x, y);
    }
    endShape();
  }
}

function renderProgressBar() {
  strokeWeight(10);

  let progressBarX = map(
    soundFile.currentTime(),
    0,
    soundFile.duration(),
    0,
    width
  );
  let progressBarY = height - 10;
  line(0, progressBarY, progressBarX, progressBarY);
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style("z-index", "-1");
  angleMode(DEGREES);

  // soundFile = loadSound(items[currentQuestionIndex].answer.preview_url);
  // soundFile.setVolume(0.2);

  nextButton.addEventListener("click", showNextQuestion);

  showNextQuestion();

  // Temporary button
  toggleMusicButton = createButton("toggle music");
  toggleMusicButton.mousePressed(() => {
    if (soundFile.isPlaying()) {
      soundFile.pause();
    } else {
      soundFile.play();
    }
  });
  toggleMusicButton.position(0, 0);

  fft = new p5.FFT();
}

function draw() {
  clear();
  stroke(255);
  renderProgressBar();
  renderWave();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  console.log(height, mouseY);
}
