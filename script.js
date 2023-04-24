const labels = document.querySelectorAll('.form-control label');

labels.forEach(label => {
    label.innerHTML = label.innerText
        .split('')
        .map((letter, idx) => `<span style="transition-delay:${idx * 50}ms">${letter}</span>`)
        .join('')
});
    
let username, password;
let gameId;
let buttonCells = [];

let divLogin = document.getElementById('divLogin');
let divLobby = document.getElementById('divLobby');
let divGame = document.getElementById('divGame');
let pLoginMessage = document.getElementById('pLoginMessage');
let txtUsername = document.getElementById('txtUsername');
let txtPassword = document.getElementById('txtPassword');
let divUsersInLobby = document.getElementById('divUsersInLobby');
let btnLeaveGame = document.getElementById('btnLeaveGame');
let lblGameId = document.getElementById('lblGameId');
let divBoard = document.getElementById('divBoard');
let help = document.getElementById('help');
    
for(let i=0;i<42;i++){
    let buttonCell = document.createElement('button');
    buttonCell.className = 'buttonCell';
    buttonCells.push(buttonCell);
    buttonCell.innerHTML = i+1;
    buttonCell.id = (i+1)+"countrie";
    //divCell.i = i;
    buttonCell.onclick = ()=>{
        //send i to server
        console.log(i);
        let nun = i;
        sendHttpGetRequest('api/play_cell?username='+username+'&password='+password+'&id='+gameId+'&buttonCell='+(nun+""), (response)=>{
            if(response){

            }
        });
    };
    divBoard.appendChild(buttonCell);
    txtUsername.focus();
}


help.onclick = () => {
    sendHttpGetRequest('api/help?username='+username+'&password='+password+'&id='+gameId, (response)=>{
        if(response){

        }
    });
}

function removeAllChildNodes(node){
    while(node.firstChild)
        node.removeChild(node.firstChild);

}

function show(element){
    let shown = document.getElementsByClassName('shown');
    if(shown.length == 1){
        shown[0].classList.add('hidden');
        shown[0].classList.remove('shown');
    }
    element.classList.add('shown');
    element.classList.remove('hidden');

    
}

function getLobby(){
    sendHttpGetRequest('api/get_lobby?username='+username+'&password='+password, (result)=>{
        let usersInLobby = JSON.parse(result);
        removeAllChildNodes(divUsersInLobby);
        let existsInList = false;
        for(let i=0;i<usersInLobby.length;i++){
            if(usersInLobby[i].username == username){
                existsInList = true;
                continue;
            } 
            let p = document.createElement('button');
            p.className = 'buttonLobby'
            p.innerHTML = usersInLobby[i].username;
            divUsersInLobby.appendChild(p);
            p.onclick = (event)=>{
                let partner = event.target.innerHTML;
                sendHttpGetRequest('api/start_game?username='+username+'&password='+password+'&partner='+partner, (response)=>{
                    if(response == "error"){
                        alert("error, try again");
                    }
                    if(response == "ok") {
                        console.log("im here");
                    }
                });

            };
            
        }
        if(existsInList){
            setTimeout(getLobby, 500);
        }else{
            //what is my game id ??
            sendHttpGetRequest('api/get_game_id?username='+username+'&password='+password, (response)=>{
                if(response){
                    
                    gameId = parseInt(response);
                    lblGameId.innerHTML = "your game id is: " + gameId;
                    show(divGame);
                    getGameStatus();
                    console.log("im here bitch");
                }
            });

            
        }
    });
}


function btnLoginSignupClicked(loginOrSignup){
    username = txtUsername.value;
    password = txtPassword.value;
    if(!username || !password) return;
    //lock the buttons:
    let elements = document.getElementsByClassName("lock");
    for(let e in elements){
        e.disabled = true;
    }
    pLoginMessage.innerHTML = "";
    sendHttpGetRequest('api/' + loginOrSignup + '?username='+username+'&password='+password, (response)=>{
        //release the buttons:
        for(let e in elements){
            e.disabled = false;
        }
        if(response == "ok"){
            show(divLobby);
            getLobby();
            
        }else if(response == "invalid"){
            pLoginMessage.innerHTML = "invalid username or password.";
        }else if(response == "taken"){
            pLoginMessage.innerHTML = "username already taken.";
        }else{//wtf ???

        }
    });
    

}


function btnLeaveGameClicked(){
    let elements = document.getElementsByClassName("lock");
    for(let e in elements){
        e.disabled = true;
    }
    //send http request to "leave game"...
    if(confirm('Are You sure to leave game?')) {
        sendHttpGetRequest('api/leave_game?username='+username+'&password='+password, (response)=>{
            for(let e in elements){
                e.disabled = false;
            }
            if(response == "ok"){
                show(divLobby);
                getLobby();
            }
        });
    }

    
}


function getGameStatus(){

    //1. send http request to get game status
    //2. update UI
    sendHttpGetRequest('api/get_game_status?username='+username+'&password='+password+'&id='+gameId,(response)=>{
        //we stopped here
        //we need to process the response which is the game status
        //if game is not active then go back to lobby
        let gameStatus = JSON.parse(response);
        if(gameStatus.active){
            //render board   gameStatus.board

            let turn;
            let soldier_p1 = gameStatus.soldier_p1;
            let soldier_p2 = gameStatus.soldier_p2;
            let attack = gameStatus.attack;

            if(gameStatus.turn == 0){/**help buttom dont time for more detail */
                turn = 'blue, You need to reinforce positions'
                help.innerHTML = "Help?";
                help.style.fontSize = "20px"
            } else if(gameStatus.turn == 1){
                turn = 'red, You need to reinforce positions'
                help.innerHTML = "Help?";
                help.style.fontSize = "20px"
            } else if(gameStatus.turn == 2){
                turn = 'blue, You need to reinforce positions'
                help.innerHTML = "Help?";
                help.style.fontSize = "20px"
            } else if(gameStatus.turn == 3){
                turn = 'blue, You can attack'
                help.innerHTML = "Don't attack";
                help.style.fontSize = "15px"
            } else if(gameStatus.turn == 4){
                turn = 'blue, You can reinforce positions or next'
                help.innerHTML = "Finnish?";
                help.style.fontSize = "15px"
            } else if(gameStatus.turn == 5){
                turn = 'red, You need to reinforce positions'
                help.innerHTML = "Help?";
                help.style.fontSize = "20px"
            } else if(gameStatus.turn == 6){
                turn = 'red, You can attack'
                help.innerHTML = "Don't attack";
                help.style.fontSize = "15px"
            } else if(gameStatus.turn == 7){
                turn = 'red, You can reinforce positions or next'
                help.innerHTML = "Finnish?";
                help.style.fontSize = "15px"
            } else {
                help.innerHTML = "Help?";
                help.style.fontSize = "20px"
            }

            lblGameId.innerHTML = `Turn: ${turn}.  -Soldiers player1:  ${soldier_p1}.  -Soldiers player2:  ${soldier_p2}.  -Attack/Move: ${attack}`;

            for(let i=0;i<42;i++){
                buttonCells[i].innerHTML = gameStatus.board[i];
                buttonCells[i].style.backgroundColor = gameStatus.colors[i] + "";
                
                
            }

            

            if(!gameStatus.colors.some((value)=> { return (value == "red" ); })) {/**check winner green territories dont affect */
                alert("blue win")
                btnLeaveGameClicked()
            } else if(!gameStatus.colors.some((value)=> { return (value == "blue" ); })) {
                alert("red win")
                btnLeaveGameClicked()
            }

            setTimeout(getGameStatus, 500);
        }else{
            show(divLobby);
            getLobby();
        }

        
    });

    
}
