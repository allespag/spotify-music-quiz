var fft;
var canvas;
var soundFile;
var currentItem;
var currentItemIndex = 0;

function renderUserMustClick() {
  textAlign(CENTER, CENTER);
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

class ItemMCQ {
  constructor(goodAnswer, badAnswers) {
    this.goodAnswer = goodAnswer;
    this.badAnswers = badAnswers;
    this.rendered = false;
    this.div = createDiv();
  }

  getChoices() {
    return [this.goodAnswer, ...this.badAnswers].sort(
      () => Math.random() - 0.5
    );
  }

  submit(title) {
    if (title == this.goodAnswer.title) {
      // TODO: conffetti explosion animation ?
    } else {
      // TODO: sad rain animation ?
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
      radio.changed(() => this.submit(choices.title));
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
  currentItem = new ItemMCQ(
    items[currentItemIndex].answer,
    items[currentItemIndex].choices
  );
  currentItemIndex++;
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style("z-index", "-1");
  angleMode(DEGREES);

  //
  fft = new p5.FFT();

  //
  getAudioContext().suspend();

  // get the first item in the series
  getNextItem();
}

function draw() {
  clear();
  background(0);
  stroke(255);

  if (getAudioContext().state === "suspended") {
    renderUserMustClick();
  } else {
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
