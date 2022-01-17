/*function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId());
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}*/
var canvas = document.getElementById("timeline");
var scene = canvas.getContext("2d");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
var sceneW = canvas.width;
var sceneH = canvas.height;
var sceneD = Math.sqrt(sceneW ** 2 + sceneH ** 2);
var translate = canvas.clientHeight % 2 ? 0 : .5;
function setSize() {
  // console.log(window.innerWidth, window.innerHeight)
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  translateY = canvas.clientHeight % 2 ? 0 : .5;
  translateX = canvas.clientWidth % 2 ? 0 : .5;
  scene.translate(translateX, translateY);
  sceneW = canvas.width;
  sceneH = canvas.height;
  sceneD = Math.sqrt(sceneW ** 2 + sceneH ** 2);
  scene.scale(window.devicePixelRatio, window.devicePixelRatio);
}
setSize()
window.onresize = setSize;
var main = document.getElementById("main")
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openSide() {
  document.getElementById("sidebar").style.width = "30%";
  main.style.marginRight = "30%";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeSide() {
  document.getElementById("sidebar").style.width = "0";
  main.style.marginRight = "0";
}
main.addEventListener("transitionend", setSize)
class Period {
  constructor(title, firstYear, lastYear, description = false) {
    this.elem = canvas.parentNode.appendChild(document.createElement("p"))
    this.elem.className = "timePeriod"
    this.elem.onclick = () => this.elem.classList.contains("editing") ? closePeriod(this) : periodEdit(this)
    this.elem.style.fontSize = "10px"
    this.title = title;
    [this.firstYear, this.lastYear] = firstYear < lastYear ? [firstYear, lastYear] : [lastYear, firstYear]
    this.description = description
    this.y = 0
    this.drawn = false
  }
  draw(x, pty) {
    this.drawn = true
    this.x = x
    this.elem.innerHTML = "<b>" + this.title + "</b>" + (this.description ? "<br>" + this.description : "")
    this.elem.style.top = this.y + "px"
    this.elem.style.left = this.x + "px"
    this.width = (this.lastYear-this.firstYear)*pty
    this.elem.style.width = this.width + "px"
    this.elem.style.textIndent = scene.measureText(this.title).width>this.width || scene.measureText(this.description).width>this.width?this.width+"px each-line":"0"
    function checkCollision(period1, period2) {
      if ((period1 != period2 && period2.drawn && period1.y==period2.y) && (((period2.elem.offsetLeft >= x) && (period2.elem.offsetLeft <= x + period1.elem.scrollWidth)) || ((period2.elem.offsetLeft + period2.elem.scrollWidth <= x + period1.elem.scrollWidth) && (period2.elem.offsetLeft + period2.elem.scrollWidth >= x)))) {
        period1.y+=period2.elem.scrollHeight
      }
    }
    dateRange.periods.forEach(e => checkCollision(this, e))
  }
  kill() {
    dateRange.periods.splice(dateRange.periods.indexOf(this), 1)
    this.elem.remove()
  }
}
class DateRange {
  constructor(firstYear, lastYear, periods = [], marksNum = 11, step = (lastYear - firstYear) / (marksNum - 1)) {
    this.firstYear = firstYear;
    this.lastYear = lastYear;
    this.marksNum = marksNum;
    this.step = step;
    this.periods = periods
    return new Proxy(this, {
      set: function (obj, prop, value) {
        console.log(obj)
        obj[prop] = value
        console.log(obj)
        switch (prop) {
          case "firstYear":
          case "lastYear":
          case "marksNum":
            obj.step = (obj.lastYear - obj.firstYear) / (obj.marksNum - 1)
            break;
          case "step":
            obj.marksNum = (obj.lastYear - obj.firstYear) / (obj.step)
            break;
          default:
            break;
        }
      }
    })
  }
  draw() {
    scene.save();
    scene.strokeStyle = "#000";
    scene.textAlign = "center";
    scene.font = (20 - this.marksNum) + "px Verdana"
    scene.beginPath(); // draws timeline
    scene.moveTo(0, sceneH / 2);
    let lineMargin = (sceneW / this.marksNum) / 2
    for (let i = 0; i < this.marksNum; i++) {
      scene.lineTo(i * (sceneW / this.marksNum) + lineMargin, sceneH / 2)
      scene.lineTo(i * (sceneW / this.marksNum) + lineMargin, sceneH / 2 - 5)
      scene.lineTo(i * (sceneW / this.marksNum) + lineMargin, sceneH / 2 + 5)
      scene.fillText(this.firstYear + Math.round(i * this.step), i * (sceneW / this.marksNum) + lineMargin, sceneH / 2 + 15)
      scene.moveTo(i * (sceneW / this.marksNum) + lineMargin, sceneH / 2)
    }
    scene.lineTo(sceneW, sceneH / 2);
    scene.closePath();
    scene.stroke();
    if (this.periods != []) { //Draw periods
      let pixelToYear = (((this.marksNum - 1) * sceneW) / this.marksNum) / (this.lastYear - this.firstYear);
      this.periods.forEach((element, index) => element.draw((element.firstYear - this.firstYear) * pixelToYear + lineMargin, pixelToYear))
    }
    scene.restore();
  }
  createPeriod(title = "A Time Period", firstYear = Math.floor(Math.random() * (this.lastYear - this.firstYear)) + this.firstYear, lastYear = Math.floor(Math.random() * (this.lastYear - this.firstYear)) + this.firstYear, description = "An example of a time period.") {
    this.periods.push(new Period(title, firstYear, lastYear, description));
    return this.periods
  }
}
var dateRange = new DateRange(1850, 1950)
dateRange.createPeriod()
function animate() {
  scene.clearRect(0, 0, sceneW, sceneH)
  dateRange.draw()
  window.requestAnimationFrame(animate)
}
animate()
function periodEdit(currentPeriod = dateRange.createPeriod()[dateRange.periods.length - 1]) {
  dateRange.periods.forEach((e) => e.elem.classList.remove("editing"))
  currentPeriod.elem.classList.add("editing")
  form = document.getElementById("periodEditForm")
  form.style.display = "initial"
  openSide()
  // console.log(currentPeriod);
  form["title"].value = currentPeriod.title;
  form["firstYear"].value = currentPeriod.firstYear;
  form["lastYear"].value = currentPeriod.lastYear;
  form["description"].value = currentPeriod.description;
  form["title"].oninput = (e) => { currentPeriod.title = e.target.value }
  function editYears() {
    [form["firstYear"].value, form["lastYear"].value] = form["firstYear"].value > form["lastYear"].value ? [form["lastYear"].value, form["firstYear"].value] : [form["firstYear"].value, form["lastYear"].value];
    [currentPeriod.firstYear, currentPeriod.lastYear] = [form["firstYear"].value, form["lastYear"].value];
  }
  form["firstYear"].oninput = editYears
  form["lastYear"].oninput = editYears
  form["description"].oninput = (e) => { currentPeriod.description = e.target.value }
  form["doneButton"].onclick = () => closePeriod(currentPeriod);
  form["deleteButton"].onclick = () => { closePeriod(currentPeriod); currentPeriod.kill() }
}
function closePeriod(period) {
  closeSide();
  form = document.getElementById("periodEditForm")
  form.reset();
  form.style.display = "none";
  period.elem.classList.remove("editing");
}