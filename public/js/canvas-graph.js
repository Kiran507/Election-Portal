const canvas = document.getElementById("canvas");
ctx = canvas.getContext('2d');

// declaring variables
var showResult = document.getElementById('showResult');
var canvasGraphDiv = document.getElementById('canvasGraphDiv');
var noOfVotes = document.getElementsByClassName('noOfVotes');
var noOfCandidates = document.getElementsByClassName('noOfCandidates');

// declaring default variables
var colorArray = ['#7FC8A9', '#D5EEBB', '#F6A9A9', '#FFBF86', '#28FFBF', '#FFF47D', '#FFE6E6', '#64C9CF'];
var allVoteCounts = [];
var totalVotes = 0;
var axisMargin = 25;

// event listeners
showResult.addEventListener('click', () => {
    if (showResult.innerHTML == 'Show Results') {
        canvasGraphDiv.classList.remove('hide')
        showResult.innerHTML = "Hide Results"
    } else if (showResult.innerHTML == 'Hide Results') {
        canvasGraphDiv.classList.add('hide')
        showResult.innerHTML = "Show Results"
    }
})

// total votes
for (let i = 0; i < noOfVotes.length; i++) {
    allVoteCounts.push(parseInt(noOfVotes[i].innerHTML))
    totalVotes += parseInt(noOfVotes[i].innerHTML)
}

// drawing y axis
ctx.moveTo(axisMargin, 5);
ctx.lineTo(axisMargin, canvas.height - 10);
ctx.strokeStyle = "#000000";
ctx.stroke();

// drawing x axis
ctx.moveTo(axisMargin, canvas.height - 10);
ctx.lineTo(canvas.width - 5, canvas.height - 10);
ctx.strokeStyle = "#000000";
ctx.stroke();

// drawing bar graphs
var ypercent = canvas.width / (allVoteCounts.length + 1);
var barWidth = (canvas.height - 10 - 5 - 5 - 5 )/allVoteCounts.length;
var barLeft = axisMargin;
var barTop = 5 + 5;
for (let i = 0; i < allVoteCounts.length; i++) {
    // console.log(allVoteCounts)
    if (colorArray.length < 1) {
        colorArray = ['#7FC8A9', '#D5EEBB', '#F6A9A9', '#FFBF86', '#28FFBF', '#FFF47D', '#FFE6E6', '#64C9CF']
    }
    var colorPosition = Math.floor(Math.random()*colorArray.length)
    var color = colorArray[colorPosition]
    colorArray.splice(colorPosition, 1)
    // console.log(color)
    ctx.fillStyle = color;
    var xpercent = allVoteCounts[i] / totalVotes * 100;
    // console.log(xpercent)

    var height = (canvas.width - axisMargin - 5) * xpercent / 100
    ctx.fillRect(barLeft + 1, barTop, height, barWidth);

    // bar title - text
    ctx.fillStyle = '#777777';
    ctx.textAlign = "start";
    if (allVoteCounts.length < 5) {
        ctx.font = `20px Arial`
    } else {
        ctx.font = `${barWidth/2}px Arial`
    }
    ctx.fillText(`${noOfCandidates[i].innerHTML}`, barLeft + 10, 4 + barTop + barWidth /2);

    // bar percentage
    ctx.font = `10px Arial`
    ctx.fillStyle = '#777777';
    ctx.textAlign = "center";
    if (totalVotes != 0) {
        ctx.fillText(`${Math.floor(xpercent)}%`, barLeft - 12, 4 + barTop + barWidth /2);
    }
    barTop += barWidth;
}