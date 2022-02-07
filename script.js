/*function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId());
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}*/
window.addEventListener('beforeunload', (e) => { e.preventDefault(); e.returnValue = ''; });
var canvas = document.getElementById("timeline");
var scene = canvas.getContext("2d");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
var sceneW = canvas.width;
var sceneH = canvas.height;
var sceneD = Math.sqrt(sceneW ** 2 + sceneH ** 2);
var translate = canvas.clientHeight % 2 ? 0 : .5;
function setSize() {
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
function openSide() {
  document.getElementById("sidebar").style.width = "30%";
  main.style.marginRight = "30%";
}
function closeSide() {
  document.getElementById("sidebar").style.width = "0";
  main.style.marginRight = "0";
}
main.addEventListener("transitionend", setSize)
class Period {
  constructor(title, firstYear, lastYear, description = false) {
    this.elem = canvas.parentNode.appendChild(document.createElement("div"))
    this.elem.className = "timePeriod"
    this.elem.onclick = () => this.elem.classList.contains("editing") ? closePeriod(this) : periodEdit(this)
    this.elem.classList.add("hidden")
    this.title = title;
    [this.firstYear, this.lastYear] = firstYear < lastYear ? [firstYear, lastYear] : [lastYear, firstYear]
    this.description = description
    this.y = 0
  }
  checkCollision(period2) {
    if ((this != period2 && !period2.elem.classList.contains("hidden") && this.y == period2.y) && (((period2.elem.offsetLeft >= this.x) && (period2.elem.offsetLeft <= this.x + this.elem.scrollWidth)) || ((period2.elem.offsetLeft + period2.elem.scrollWidth <= this.x + this.elem.scrollWidth) && (period2.elem.offsetLeft + period2.elem.scrollWidth >= this.x)))) {
      this.y += period2.elem.offsetHeight
    }
  }
  draw(x, pty) {
    this.elem.classList.remove("hidden")
    this.x = x
    this.elem.innerHTML = "<b>" + this.title + "</b>" + (this.description ? "<br>" + this.description : "")
    this.elem.style.top = this.y + "px"
    this.elem.style.left = this.x + "px"
    this.width = (this.lastYear - this.firstYear) * pty
    this.elem.style.width = this.width + "px"
    scene.save()
    scene.font = window.getComputedStyle(this.elem).font;
    this.elem.style.textIndent = scene.measureText(this.title).width > this.width || scene.measureText(this.description).width > this.width ? this.width + "px each-line" : "0"
    scene.restore()
    dateRange.periods.forEach(e => this.checkCollision(e))
  }
  async kill() {
    await this.elem.remove()
    await dateRange.periods.splice(dateRange.periods.indexOf(this), 1)
  }
  toJSON() {
    return { title: this.title, firstYear: this.firstYear, lastYear: this.lastYear, description: this.description }
  }
  static deserialize(data) {
    return new Period(...Object.values(data))
  }
}
class DateRange {
  constructor(firstYear = 1850, lastYear = 1950, periods = [], marksNum = 11, step = (lastYear - firstYear) / (marksNum - 1)) {
    this.firstYear = firstYear;
    this.lastYear = lastYear;
    this.periods = periods
    this.marksNum = marksNum;
    this.step = step;
    return new Proxy(this, {
      set: function (obj, prop, value) {
        obj[prop] = value
        console.log(obj + " " + prop + " " + value)
        switch (prop) {
          case "firstYear":
          case "lastYear":
          case "marksNum":
            obj.step = (obj.lastYear - obj.firstYear) / (obj.marksNum - 1)
            break;
          case "step":
            obj.lastYear = obj.step * (obj.marksNum - 1) + obj.firstYear;
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
  toJSON() {
    var serialized = this
    serialized.periods.forEach(e => e = e.toJSON())
    return serialized
  }
  static deserialize(string) {
    var output = JSON.parse(string)
    output.periods = output.periods.map(e => e = Period.deserialize(e))
    return new DateRange(...Object.values(output))
  }
}
var dateRange = new DateRange()
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
  var form = document.getElementById("periodEditForm")
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
function getImage() {
  domtoimage.toPng(document.getElementById("timelineContainer")).then(function (dataUrl) {
    var link = document.createElement("a");
    link.download = "timeline"
    link.href = dataUrl;
    link.click();
  }).catch(function (error) {
    console.error('oops, something went wrong!', error);
  });
}
function popupTextSave() {
  for (i of document.querySelectorAll("#popup section")) { i.classList.remove("open") }
  document.getElementById("textSave").classList.add("open")
  document.getElementById("popup").classList.add("open")
  document.getElementById("textSaveText").innerHTML = JSON.stringify(dateRange)
}
function popupTextLoad() {
  for (i of document.querySelectorAll("#popup section")) {i.classList.remove("open")}
  document.getElementById("textLoad").classList.add("open")
  document.getElementById("popup").classList.add("open")
}
function copySaveText() {
  document.getElementById("copySaveTextButton").innerHTML = "Copying..."
  navigator.clipboard.writeText(JSON.stringify(dateRange)).then(() => document.getElementById("copySaveTextButton").innerHTML = "Copied to Clipboard")
}
function pasteLoadText() {
  if(!confirm("This will replace the current text. Are you sure you want to paste?")){return}
  document.getElementById("pasteLoadTextButton").innerHTML = "Pasting..."
  navigator.clipboard.readText(dateRange).then((e) => { document.getElementById("textLoadText").value = e; document.getElementById("pasteLoadTextButton").innerHTML = "Paste from Clipboard" })
}
function cancelUpload() {
  if (document.getElementById("textLoadText").value != JSON.stringify(dateRange) && !confirm("The current text is not the same as the current timeline. Are you sure you want to cancel?")
  ) {
    return
  }else{
    closeOptions()
  }
}
function downloadSaveText() {
  var link = document.createElement("a");
  link.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dateRange));
  link.download = "timeline.json"
  link.click();
}
function uploadLoadText(){
  if(!confirm("This will replace the current text. Are you sure you want to upload?")){document.getElementById("uploadLoadText").value="";return}
  document.getElementById("uploadLoadTextButton").innerHTML = "Uploading..."
  var file = document.getElementById("uploadLoadText").files[0]
  if(file.type=="application/json"){
    document.getElementById("uploadLoadText").files[0].text().then(e => document.getElementById("textLoadText").value=e)
  }else{
    alert("Please upload a JSON file")
  }
  document.getElementById("uploadLoadText").value=""
  document.getElementById("uploadLoadTextButton").innerHTML = "Upload JSON File"
}
async function loadRange(rangeString) {
  await dateRange.periods.filter(e => e.kill())
  dateRange = DateRange.deserialize(rangeString)
}
function loadTimeline() {
  if(!confirm("This will replace your current timeline. All unsaved data will be lost. Are you sure you want to load?")){return}
  loadRange(document.getElementById("textLoadText").value)  
}
function closePeriod(period) {
  closeSide();
  form = document.getElementById("periodEditForm");
  form.reset();
  form.style.display = "none";
  period.elem.classList.remove("editing");
  window.setTimeout(() => dateRange.periods.forEach(e => e.y = 0), 300)
}
function openOptions() {
  for (i of document.querySelectorAll("#popup section")) { i.classList.remove("open") }
  document.getElementById("options").classList.add("open")
  document.getElementById("popup").classList.add("open")
  document.getElementById("openOptions").onclick = closeOptions;
  var form = document.getElementById("optionsForm");
  form["firstYear"].value = dateRange.firstYear;
  form["lastYear"].value = dateRange.lastYear;
  form["step"].value = dateRange.step;
  // form["marksNum"].value = dateRange.marksNum;
  form["firstYear"].oninput = e => dateRange.firstYear = parseInt(e.target.value)
  form["lastYear"].oninput = () => editRange("lastYear")
  function editRange(item) {
    // var notItem = item=="step"?"marksNum":"step";
    // console.log(form)
    dateRange[item] = parseInt(form[item].value);
    form["lastYear"].value = dateRange.lastYear;
    form["step"].value = dateRange.step;
  }
  form["step"].oninput = () => editRange("step")
  // form["marksNum"].oninput = () => editRange("marksNum")
  form["doneButton"].onclick = closeOptions
}
function closeOptions() {
  document.getElementById("popup").classList.remove("open");
  for (i of document.querySelectorAll("#popup section")) { i.classList.remove("open") }
  document.getElementById("openOptions").onclick = openOptions;
}
function closeEverything(e) {
  if (document.getElementById("popup").classList.contains("open")) {
    closeOptions()
  }
  if (document.querySelector(".timePeriod.editing")) {
    closePeriod(dateRange.periods.find(e => e.elem.classList.contains("editing")))
  }
}
canvas.onclick = closeEverything
document.getElementById("title").onclick = closeEverything
document.onkeydown = function (event) {
  if (event.keyCode == 27) {
    closeEverything()
  }
}