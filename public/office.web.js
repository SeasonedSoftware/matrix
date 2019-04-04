$(function(){

	var enterRoom = $("[enter-room]")

	var matrixProfile = new MatrixProfile()

	if (matrixProfile.isProfileStored()) {
		enterInOffice(matrixProfile);
	}else{
		redirectToHome();
	}

	var logoutButton = $("#btnLogout");

	logoutButton.on("click",function(e){
		var auth2 = gapi.auth2.getAuthInstance();
		auth2.signOut().then(function () {
			matrixProfile.terminate();
			//Redirect
			window.location = "/";
		});
	})

	function removeUser(userId){
		$('#'+userId).remove();
	}

	function showUserInRoom(user,room){

		let userView = $('#'+user.id).length
		if(userView==0){
			userView = $('<img class="rounded-circle m-1 user-image" id="'+user.id+'"src="'+user.imageUrl+'">');
		}else{
			userView = $('#'+user.id).detach();
		}

		$("#users-"+room).append(userView);
	}

	function redirectToHome(){
		window.location.href = "./"
	}

	function goToMeet(externalMeetUrl){
		var r = confirm("Deseja entrar na call?");
		if (r == true) {
		  window.open(externalMeetUrl, '_blank');
		} else {
		  txt = "You pressed Cancel!";
		}
	}

	function saveLastRoom(data) {
		localStorage.setItem('last_room' + data.user.id, data.room);
	}

	function enterInOffice(matrixProfile){
		var lastRoom = localStorage.getItem('last_room' + matrixProfile.loadStoredProfile().id);
		console.log(window.location)
	   	//make connection
		var socket = io.connect(window.location.protocol + "//" + window.location.host, {
			query: "user=" + matrixProfile.loadStoredProfileAsString() + (lastRoom ? "&room=" + lastRoom : "")
		})

		enterRoom.on("click",function(e){
			var room = $(e.target).attr("enter-room");
			socket.emit('enter-room', {room : room,user:matrixProfile.loadStoredProfile()})
			setTimeout(function () {
				goToMeet($(e.target).attr("external-meet-url"));
			},300);

		})

		socket.on("enter-room", (data) => {
			saveLastRoom(data);
			showUserInRoom(data.user,data.room);
		})

		socket.on("disconnect", (userId) => {
			removeUser(userId);
		})
	}

});

function onLoad() {
	gapi.load('auth2', function() {
		console.log("gapi");
		gapi.auth2.init();
	});
}
