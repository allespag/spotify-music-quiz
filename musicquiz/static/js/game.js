var fft;
var canvas;
var soundFile;
var currentItem;
var score;
var currentItemIndex = 0;

class Score {
  constructor() {
    this.value = 0;
    this.element = createP("Score: " + this.value);

    this.element.position(windowWidth - 200, 50);
    this.element.class("unselectable");
  }

  shake() {
    const intensity = 5; // Adjust the intensity of the shake
    const duration = 500; // Duration of the shake in milliseconds
    const startTime = Date.now();
    var element = this.element;

    function updatePosition() {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const xOffset = Math.random() * intensity - intensity / 2;
        const yOffset = Math.random() * intensity - intensity / 2;
        element.style("transform", `translate(${xOffset}px, ${yOffset}px`);
        requestAnimationFrame(updatePosition);
      } else {
        element.style("transform", "translate(0, 0)");
      }
    }

    updatePosition();
  }

  updateAnimation(points) {
    if (points == 0) {
      return;
    }
    this.value += 1;
    this.element.html("Score: " + this.value);
    setTimeout(() => {
      this.updateAnimation(points - 1);
    }, 1);
  }

  update(points) {
    points = Math.floor(points * 10);
    this.updateAnimation(points);
  }
}

function renderUserMustClick() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Click to start!", width / 2, height / 2);
}

function renderWave() {
  strokeWeight(3);
  noFill();
  translate(width / 2, height / 1.8);

  var wave = fft.waveform();

  for (var t = -1; t <= 1; t += 2) {
    beginShape();
    for (var i = 0; i <= 180; i += 1) {
      var index = floor(map(i, 0, 180, 0, wave.length - 1));

      var r = map(wave[index], -1, 1, windowWidth / 2.5, windowHeight / 2.5);

      var x = r * sin(i) * t;
      var y = r * cos(i);
      vertex(x, y);
    }
    endShape();
  }
}

function renderProgressBar() {
  let weight = 10;
  strokeWeight(weight);

  let progressBarX = map(
    soundFile.currentTime(),
    0,
    soundFile.duration(),
    0,
    width
  );
  let progressBarY = windowHeight - weight / 2;
  line(0, progressBarY, progressBarX, progressBarY);
}

class ItemMCQ {
  constructor(goodAnswer, badAnswers) {
    this.goodAnswer = goodAnswer;
    this.badAnswers = badAnswers;
    this.rendered = false;
    this.div = createDiv();

    this.div.id("choices");
    this.div.class("center unselectable");
  }

  getChoices() {
    return [this.goodAnswer, ...this.badAnswers].sort(
      () => Math.random() - 0.5
    );
  }

  submit(title) {
    if (title == this.goodAnswer.title) {
      score.update(soundFile.duration() - soundFile.currentTime());
    } else {
      score.shake();
    }
    getNextItem();
  }

  renderForm() {
    var form = createElement("form");
    var choices = this.getChoices();

    for (var i = 0; i < choices.length; i++) {
      let choice = choices[i];
      let radio = createRadio("choices");
      radio.option(choice.title);
      radio.changed(() => {
        this.submit(choice.title);
      });
      form.child(radio);
    }

    this.div.child(form);
  }

  renderSound() {
    soundFile = loadSound(this.goodAnswer.preview_url, () => {
      soundFile.play();
    });
    soundFile.setVolume(0.2);
  }

  render() {
    this.renderSound();
    this.renderForm();
    this.rendered = true;
  }

  clear() {
    this.div.html("");
    soundFile.pause();
    this.rendered = false;
  }
}

function getNextItem() {
  if (currentItem !== undefined) {
    currentItem.clear();
  }
  if (currentItemIndex < items.length) {
    currentItem = new ItemMCQ(
      items[currentItemIndex].answer,
      items[currentItemIndex].choices
    );
    currentItemIndex++;
  } else {
    currentItem = undefined;
  }
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style("z-index", "-1");
  angleMode(DEGREES);

  fft = new p5.FFT();
  getAudioContext().suspend();

  score = new Score();

  // get the first item in the series
  getNextItem();
}

function draw() {
  clear();
  background(0);
  stroke(255);
  strokeWeight(1);

  if (getAudioContext().state === "suspended") {
    renderUserMustClick();
  } else if (currentItem !== undefined) {
    if (!currentItem.rendered) {
      currentItem.render();
    }
    renderProgressBar();
  }
  renderWave();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  userStartAudio();
}
