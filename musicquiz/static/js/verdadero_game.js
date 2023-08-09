var canvas;
var soundFile;
var currentItem;
var currentItemIndex = 0;

class ItemMCQ {
  constructor(goodAnswer, badAnswers) {
    this.goodAnswer = goodAnswer;
    this.badAnswers = badAnswers;
    this.rendered = false;
    this.div = createDiv();
  }

  get_choices() {
    return [this.goodAnswer, ...this.badAnswers].sort(
      () => Math.random() - 0.5
    );
  }

  submit(title) {
    if (title == this.goodAnswer.title) {
      // TODO: confetti explosion animation ?
    } else {
      // TODO: sad rain animation ?
    }
    // TODO: go next question
    getNextItem();
  }

  render() {
    var form = createElement("form");
    var choices = this.get_choices();

    for (var i = 0; i < choices.length; i++) {
      let choice = choices[i];
      let radio = createRadio("choices");
      radio.option(choice.title);
      radio.changed(() => this.submit(choices.title));
      form.child(radio);
    }

    soundFile = loadSound(this.goodAnswer.preview_url, () => {
      soundFile.play();
    });
    soundFile.setVolume(0.2);

    this.div.child(form);

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

  // debug
  getAudioContext().suspend();

  getNextItem();
}

function draw() {
  clear();
  stroke(255);

  // debug
  background(220);
  textAlign(CENTER, CENTER);
  text(getAudioContext().state, width / 2, height / 2);

  if (!currentItem.rendered) {
    currentItem.render();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  userStartAudio();
}
