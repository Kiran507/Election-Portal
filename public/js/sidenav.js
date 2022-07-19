var notifsCount = document.getElementsByClassName('notifsCount');
// console.log(notifsCount.length);

var countBell = document.getElementById('countBell')
var OtherNotifsCount = parseInt(document.getElementById('OtherNotifsCount').innerHTML)
var invitationRecievedNotifsCount = parseInt(document.getElementById('invitationRecievedNotifsCount').innerHTML)
var totalCount = (invitationRecievedNotifsCount + OtherNotifsCount)
countBell.innerHTML = "(" + totalCount + ")"