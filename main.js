let http = require('http');
let url = require('url');
let st = require('./server_tools');
const { REFUSED } = require('dns');
const { log } = require('console');



http.createServer((req,res)=>{
    let q = url.parse(req.url, true);
    let path = q.pathname;
    if(path.startsWith("/api")){
        path = path.substring(4);
        let username = q.query.username;
        let password = q.query.password;
        if(!username || !password){
            res.writeHead(400, {"Content-Type":"text/plain"});
            res.end("username and password are required");
            return;
        }
        if(path.startsWith("/signup")){
            st.query("INSERT INTO users(username,password) VALUES (?,?)",[username, password], (result, err)=>{
                if(err){
                    res.writeHead(200, {"Content-Type":"text/plain"});
                    res.end("taken");
                    return;
                }
                res.writeHead(200, {"Content-Type":"text/plain"});
                res.end("ok");
            });
        }else if(path.startsWith("/login")){
            validateUser(username, password, (isValid)=>{
                res.writeHead(200, {"Content-Type":"text/plain"});
                res.end(isValid ? "ok" : "invalid");
            });
        }else if(path.startsWith("/get_lobby")){//get a list of all users that are currently waiting to be picked up by another user.
            st.query("UPDATE users SET lobby=? WHERE username=? AND NOT lobby=-1", [Date.now(),username], (result,err)=>{
                if(err){
                    //not now

                    return;
                }
                st.query("SELECT username FROM users WHERE ? - lobby < 2000",[Date.now()], (result, err)=>{
                    if(err){
                        //not now
    
                        return;
                    }
                    res.writeHead(200, {'Content-Type':'application/json'});
                    res.end(JSON.stringify(result));
                });

            });
        }else if(path.startsWith("/start_game")){//when the user picks up another user from the lobby to initiate a game.
            let partner = q.query.partner;
            if(!partner) return;
            st.query("UPDATE users SET lobby = -1 WHERE username IN (?,?) AND ?-lobby<2000",[username, partner,Date.now()], (result, err)=>{
                if(err){
                    //not now

                    return;
                }
                if(result.affectedRows == 2){


                    let countries = ["alaska", "northwest", "greenland", "alberta", "ontario", "quebec" , "wester_us", "eastern_us", "central_america", "venezuela", "peru", "brazil", "argentina", "iceland", "scandinavia", "ukraine", "great_britain", "northern_europe", "western_europe", "southern_europe", "ural", "siberia", "yakutsk", "kamchatka", "irkutsk", "afghanistan", "china", "mongolia", "japan", "middle_east", "india", "siam", "north_africa", "egypt", "congo", "east_africa", "south_africa", "madagascar", "indonesia", "new_guinea", "western_australia", "eastern_australia"];
                    let counter = 0;
                    let colorCounstries = {}

                    function startGame() {
                        for(let i=0; i<42; i++) { /**select ur country ramdom, 14 for each player */
                            if(counter == 0) {
                                let j = randBetween(0,countries.length);
                                let countrie = countries[j];
                                countries.splice(j,1);
                                colorCounstries[countrie] = "blue";
                                counter++
                            } else if(counter == 1) {
                                let j = randBetween(0,countries.length);
                                let countrie = countries[j];
                                countries.splice(j,1);
                                colorCounstries[countrie] = "red";
                                counter++
                            } else {
                                let j = randBetween(0,countries.length);
                                let countrie = countries[j];
                                countries.splice(j,1);
                                colorCounstries[countrie] = "green";
                                counter = 0;
                            }
                        }

                        
                        
                    }




                    function randBetween(lowerBound, upperBound){
                        return lowerBound + Math.floor(Math.random()*(upperBound-lowerBound));
                    }

                    startGame();

                    

                    st.query("INSERT INTO games(player1,player2,alaska, northwest, greenland, alberta, ontario, quebec , wester_us, eastern_us, central_america, venezuela, peru, brazil, argentina, iceland, scandinavia, ukraine, great_britain, northern_europe, western_europe, southern_europe, ural, siberia, yakutsk, kamchatka, irkutsk, afghanistan, china, mongolia, japan, middle_east, india, siam, north_africa, egypt, congo, east_africa, south_africa, madagascar, indonesia, new_guinea, western_australia, eastern_australia) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [username, partner,colorCounstries["alaska"], colorCounstries["northwest"], colorCounstries["greenland"], colorCounstries["alberta"], colorCounstries["ontario"], colorCounstries["quebec"], colorCounstries["wester_us"], colorCounstries["eastern_us"], colorCounstries["central_america"], colorCounstries["venezuela"], colorCounstries["peru"], colorCounstries["brazil"], colorCounstries["argentina"], colorCounstries["iceland"], colorCounstries["scandinavia"], colorCounstries["ukraine"], colorCounstries["great_britain"], colorCounstries["northern_europe"], colorCounstries["western_europe"], colorCounstries["southern_europe"], colorCounstries["ural"], colorCounstries["siberia"], colorCounstries["yakutsk"], colorCounstries["kamchatka"], colorCounstries["irkutsk"], colorCounstries["afghanistan"], colorCounstries["china"], colorCounstries["mongolia"], colorCounstries["japan"], colorCounstries["middle_east"], colorCounstries["india"], colorCounstries["siam"], colorCounstries["north_africa"], colorCounstries["egypt"], colorCounstries["congo"], colorCounstries["east_africa"], colorCounstries["south_africa"], colorCounstries["madagascar"], colorCounstries["indonesia"], colorCounstries["new_guinea"], colorCounstries["western_australia"], colorCounstries["eastern_australia"]], (result, err)=>{
                        if(err){
                            
        
                            return;
                        }
                        res.writeHead(200, {'Content-Type':'text/plain'});
                        res.end("ok");
                        

                        // st.query("INSERT INTO games(alaska, northwest, greenland, alberta, ontario, quebec) VALUES (?,?,?,?,?,?)", [colorCounstries["alaska"], colorCounstries["northwest"], colorCounstries["greenland"], colorCounstries["alberta"], colorCounstries["ontario"], colorCounstries["quebec"]], (result, err) => {
                        //     if(err){
                        //         //not now
            
                        //         return;
                        //     }
                        //     res.writeHead(200, {'Content-Type':'text/plain'});
                        //     res.end("ok");
                        // })
                        

                    });
                }else{
                    res.writeHead(200, {'Content-Type':'text/plain'});
                    res.end("error");
                }

            });
        }else if(path.startsWith("/leave_game")){
            //how to find my partner ??
            //go over all games that I am either player1 or player2.
            //from those games, if I am i.e player1, then player2 is my partner.
            //if I am player2, then my partner is player1.
            st.query("SELECT id,player1,player2 FROM games WHERE (player1=? OR player2=?) AND active=1",[username, username], (result, err)=>{
                if(err){
                    //not now

                    return;
                }
                if(result.length >= 1){
                    let gameId = result[0].id;
                    let partner;
                    if(result[0].player1 == username){
                        partner = result[0].player2;
                    }else{
                        partner = result[0].player1;
                    }

                    
                    st.query("UPDATE games SET active=0 WHERE id=? AND active=1",[gameId],(result,err)=>{
                        if(err){
                            //not now
        
                            return;
                        }
                        if(result.affectedRows == 1){
                            st.query("UPDATE users SET lobby=0 WHERE username IN (?,?)",[username, partner], (result,err)=>{
                                if(err){
                                    //not now
                
                                    return;
                                }
                                res.writeHead(200, {'Content-Type':'text/plain'});
                                res.end("ok");
                            });
                        }else if(result.affectedRows == 0){
                            st.query("UPDATE users SET lobby=0 WHERE username = ?",[username], (result,err)=>{
                                if(err){
                                    //not now
                
                                    return;
                                }
                                res.writeHead(200, {'Content-Type':'text/plain'});
                                res.end("ok");
                            });
                        }
                        

                    });
                    
                }
            });
        }else if(path.startsWith("/get_game_id")){
            st.query("SELECT id FROM games WHERE (player1=? OR player2=?) AND active=1",[username, username], (result,err)=>{
                if(err){
                    //not now
                    res.end("");
                    return;
                }
                if(result.length >= 1){
                    let gameId = result[0].id;
                    res.writeHead(200, {'Content-Type':'text/plain'});
                    res.end(gameId + "");
                }else{
                    res.writeHead(200, {'Content-Type':'text/plain'});
                    res.end("-1");
                }
            });
        }else if(path.startsWith("/get_game_status")){
            let gameId = q.query.id;
            if(!gameId) return;
            st.query("SELECT player1, player2, active, cell_alaska, cell_northwest, cell_greenland, cell_alberta, cell_ontario, cell_quebec, cell_wester_us, cell_eastern_us, cell_central_america, cell_venezuela, cell_peru, cell_brazil, cell_argentina, cell_iceland, cell_scandinavia, cell_ukraine, cell_great_britain, cell_northern_europe, cell_western_europe, cell_southern_europe, cell_ural, cell_siberia, cell_yakutsk, cell_kamchatka, cell_irkutsk, cell_afghanistan, cell_china, cell_mongolia, cell_japan, cell_middle_east, cell_india, cell_siam, cell_north_africa, cell_egypt, cell_congo, cell_east_africa, cell_south_africa, cell_madagascar, cell_indonesia, cell_new_guinea, cell_western_australia, cell_eastern_australia, alaska, northwest, greenland, alberta, ontario, quebec, wester_us, eastern_us, central_america, venezuela, peru, brazil, argentina, iceland, scandinavia, ukraine, great_britain, northern_europe, western_europe, southern_europe, ural, siberia, yakutsk, kamchatka, irkutsk, afghanistan, china, mongolia, japan, middle_east, india, siam, north_africa, egypt, congo, east_africa, south_africa, madagascar, indonesia, new_guinea, western_australia, eastern_australia, turn, soldier_p1, soldier_p2, attack  FROM games WHERE id=? AND (player1=? OR player2=?)",[gameId, username, username],(result,err)=>{
                if(err){
                    //not now
                    res.end("");
                    return;
                }
                if(result.length == 1){
                    let gameStatus = {
                        id: gameId,
                        player1: result[0].player1,
                        player2: result[0].player2,
                        active: result[0].active[0]==1,
                        board: [result[0].cell_alaska, result[0].cell_northwest, result[0].cell_greenland, result[0].cell_alberta, result[0].cell_ontario, result[0].cell_quebec, result[0].cell_wester_us, result[0].cell_eastern_us, result[0].cell_central_america, result[0].cell_venezuela, result[0].cell_peru, result[0].cell_brazil, result[0].cell_argentina, result[0].cell_iceland, result[0].cell_scandinavia, result[0].cell_ukraine, result[0].cell_great_britain, result[0].cell_northern_europe, result[0].cell_western_europe, result[0].cell_southern_europe, result[0].cell_ural, result[0].cell_siberia, result[0].cell_yakutsk, result[0].cell_kamchatka, result[0].cell_irkutsk, result[0].cell_afghanistan, result[0].cell_china, result[0].cell_mongolia, result[0].cell_japan, result[0].cell_middle_east, result[0].cell_india, result[0].cell_siam, result[0].cell_north_africa, result[0].cell_egypt, result[0].cell_congo, result[0].cell_east_africa, result[0].cell_south_africa, result[0].cell_madagascar, result[0].cell_indonesia, result[0].cell_new_guinea, result[0].cell_western_australia, result[0].cell_eastern_australia],
                        colors: [result[0].alaska, result[0].northwest, result[0].greenland, result[0].alberta, result[0].ontario, result[0].quebec, result[0].wester_us, result[0].eastern_us, result[0].central_america, result[0].venezuela, result[0].peru, result[0].brazil, result[0].argentina, result[0].iceland, result[0].scandinavia, result[0].ukraine, result[0].great_britain, result[0].northern_europe, result[0].western_europe, result[0].southern_europe, result[0].ural, result[0].siberia, result[0].yakutsk, result[0].kamchatka, result[0].irkutsk, result[0].afghanistan, result[0].china, result[0].mongolia, result[0].japan, result[0].middle_east, result[0].india, result[0].siam, result[0].north_africa, result[0].egypt, result[0].congo, result[0].east_africa, result[0].south_africa, result[0].madagascar, result[0].indonesia, result[0].new_guinea, result[0].western_australia, result[0].eastern_australia],
                        turn: result[0].turn,
                        soldier_p1: result[0].soldier_p1,
                        soldier_p2: result[0].soldier_p2,
                        attack: result[0].attack
                    };
                    res.writeHead(200, {'Content-Type':'application/json'});
                    res.end(JSON.stringify(gameStatus));
                }
            });
        }else if(path.startsWith("/play_cell")){
            let cell = q.query.buttonCell;
            let gameId = q.query.id;
            if(cell && gameId){
                cell = parseInt(cell);
                gameId = parseInt(gameId);
                if(isNaN(cell) || isNaN(gameId) || cell < 0 || cell > 42) {
                    res.end("");
                    return;
                }
                st.query("SELECT player1, player2, cell_alaska, cell_northwest, cell_greenland, cell_alberta, cell_ontario, cell_quebec, cell_wester_us, cell_eastern_us, cell_central_america, cell_venezuela, cell_peru, cell_brazil, cell_argentina, cell_iceland, cell_scandinavia, cell_ukraine, cell_great_britain, cell_northern_europe, cell_western_europe, cell_southern_europe, cell_ural, cell_siberia, cell_yakutsk, cell_kamchatka, cell_irkutsk, cell_afghanistan, cell_china, cell_mongolia, cell_japan, cell_middle_east, cell_india, cell_siam, cell_north_africa, cell_egypt, cell_congo, cell_east_africa, cell_south_africa, cell_madagascar, cell_indonesia, cell_new_guinea, cell_western_australia, cell_eastern_australia, alaska, northwest, greenland, alberta, ontario, quebec, wester_us, eastern_us, central_america, venezuela, peru, brazil, argentina, iceland, scandinavia, ukraine, great_britain, northern_europe, western_europe, southern_europe, ural, siberia, yakutsk, kamchatka, irkutsk, afghanistan, china, mongolia, japan, middle_east, india, siam, north_africa, egypt, congo, east_africa, south_africa, madagascar, indonesia, new_guinea, western_australia, eastern_australia, soldier_p1, soldier_p2, attack, attack_country, turn  FROM games WHERE id=? AND active=1",[gameId], (result,err)=>{
                    if(err){
                        res.end("");

                        return;
                    }
                    if(result.length == 1){
                        let player1 = result[0].player1;
                        let player2 = result[0].player2;
                        let turn = result[0].turn
                        if(player1 == username || player2 == username){
                            let xOrO = player1 == username ? 1 : 2;
                            
                            let playerSol = "soldier_p"+xOrO+"";
                            let numSoldiers = [0, result[0].soldier_p1, result[0].soldier_p2];

                            let board = [result[0].cell_alaska, result[0].cell_northwest, result[0].cell_greenland, result[0].cell_alberta, result[0].cell_ontario, result[0].cell_quebec, result[0].cell_wester_us, result[0].cell_eastern_us, result[0].cell_central_america, result[0].cell_venezuela, result[0].cell_peru, result[0].cell_brazil, result[0].cell_argentina, result[0].cell_iceland, result[0].cell_scandinavia, result[0].cell_ukraine, result[0].cell_great_britain, result[0].cell_northern_europe, result[0].cell_western_europe, result[0].cell_southern_europe, result[0].cell_ural, result[0].cell_siberia, result[0].cell_yakutsk, result[0].cell_kamchatka, result[0].cell_irkutsk, result[0].cell_afghanistan, result[0].cell_china, result[0].cell_mongolia, result[0].cell_japan, result[0].cell_middle_east, result[0].cell_india, result[0].cell_siam, result[0].cell_north_africa, result[0].cell_egypt, result[0].cell_congo, result[0].cell_east_africa, result[0].cell_south_africa, result[0].cell_madagascar, result[0].cell_indonesia, result[0].cell_new_guinea, result[0].cell_western_australia, result[0].cell_eastern_australia];

                            let colors = [result[0].alaska, result[0].northwest, result[0].greenland, result[0].alberta, result[0].ontario, result[0].quebec, result[0].wester_us, result[0].eastern_us, result[0].central_america, result[0].venezuela, result[0].peru, result[0].brazil, result[0].argentina, result[0].iceland, result[0].scandinavia, result[0].ukraine, result[0].great_britain, result[0].northern_europe, result[0].western_europe, result[0].southern_europe, result[0].ural, result[0].siberia, result[0].yakutsk, result[0].kamchatka, result[0].irkutsk, result[0].afghanistan, result[0].china, result[0].mongolia, result[0].japan, result[0].middle_east, result[0].india, result[0].siam, result[0].north_africa, result[0].egypt, result[0].congo, result[0].east_africa, result[0].south_africa, result[0].madagascar, result[0].indonesia, result[0].new_guinea, result[0].western_australia, result[0].eastern_australia];

                            let countX = 0;
                            let board2 = Object.keys(result[0]);
                            let soldier = board2[85+xOrO];
                            let cellCountrie = board2[cell+2];
                            let countriesN = board2[cell+44];
                            let attack = board2[88];
                            let attack_country = board2[89];


                            let soldiersBlue = 0;
                            let soldiersRed = 0;
                            colors.forEach((color) => { /* count ur terrytories */
                                if(color == "blue") {
                                    soldiersBlue++
                                } else if (color == "red") {
                                    soldiersRed++
                                }
                            });

                            function divS(s) { /*ur nerws soldier when start ur turn, depend how many territory u have but u take 3 if u have less the 12*/
                                if(s < 12) {
                                    return s = 3
                                } else {
                                    return s = Math.floor(s/3);
                                }
                            }

                            function itsLegal(x) { /*check wich contry is near and legal move */

                                if(result[0].attack_country == 0 && (x == 1 || x == 3 || x == 23)) {
                                    return true
                                } else if(result[0].attack_country == 1 && (x == 0 || x == 2 || x == 3 || x == 4)) {
                                    return true
                                } else if(result[0].attack_country == 2 && (x == 1 || x == 4 || x == 5 || x == 13)) {
                                    return true
                                } else if(result[0].attack_country == 3 && (x == 0 || x == 1 || x == 4 || x == 7)) {
                                    return true
                                } else if(result[0].attack_country == 4 && (x == 1 || x == 3 || x == 5 || x == 2 || x == 6 || x == 7)) {
                                    return true
                                } else if(result[0].attack_country == 5 && (x == 2 || x == 4 || x == 7)) {
                                    return true
                                } else if(result[0].attack_country == 6 && (x == 4 || x == 3 || x == 7 || x == 8)) {
                                    return true
                                } else if(result[0].attack_country == 7 && (x == 6 || x == 4 || x == 5 || x == 8)) {
                                    return true
                                } else if(result[0].attack_country == 8 && (x == 6 || x == 7 || x == 9)) {
                                    return true
                                } else if(result[0].attack_country == 9 && (x == 8 || x == 10 || x == 11)) {
                                    return true
                                } else if(result[0].attack_country == 10 && (x == 9 || x == 11 || x == 12)) {
                                    return true
                                } else if(result[0].attack_country == 12 && (x == 10 || x == 11)) {
                                    return true
                                } else if(result[0].attack_country == 11 && (x == 9 || x == 10 || x == 12 || x == 32)) {
                                    return true
                                } else if(result[0].attack_country == 13 && (x == 2 || x == 14 || x == 16)) {
                                    return true
                                } else if(result[0].attack_country == 14 && (x == 13 || x == 16 || x == 17 || x == 15)) {
                                    return true
                                } else if(result[0].attack_country == 15 && (x == 14 || x == 17 || x == 19 || x == 29 || x == 25 || x == 20)) {
                                    return true
                                } else if(result[0].attack_country == 17 && (x == 16 || x == 14 || x == 18 || x == 19 || x == 15)) {
                                    return true
                                } else if(result[0].attack_country == 16 && (x == 13 || x == 14 || x == 17 || x == 18)) {
                                    return true
                                } else if(result[0].attack_country == 18 && (x == 32 || x == 19 || x == 16 || x == 17)) {
                                    return true
                                } else if(result[0].attack_country == 19 && (x == 32 || x == 33 || x == 29 || x == 15 || x == 17 || x == 18)) {
                                    return true
                                } else if(result[0].attack_country == 20 && (x == 15 || x == 25 || x == 26 || x == 21)) {
                                    return true
                                } else if(result[0].attack_country == 21 && (x == 20 || x == 22 || x == 24 || x == 26 || x == 27)) {
                                    return true
                                } else if(result[0].attack_country == 22 && (x == 21 || x == 23 || x == 24)) {
                                    return true
                                } else if(result[0].attack_country == 23 && (x == 0 || x == 22 || x == 24 || x == 28 || x == 27)) {
                                    return true
                                } else if(result[0].attack_country == 24 && (x == 27 || x == 23 || x == 22 || x == 21)) {
                                    return true
                                } else if(result[0].attack_country == 25 && (x == 15 || x == 20 || x == 26 || x == 30 || x == 29)) {
                                    return true
                                } else if(result[0].attack_country == 26 && (x == 25 || x == 30 || x == 20 || x == 21 || x == 27 || x == 31)) {
                                    return true
                                } else  if(result[0].attack_country == 27 && (x == 28 || x == 23 || x == 24 || x == 21 || x == 26)) {
                                    return true
                                } else if(result[0].attack_country == 28 && (x == 27 || x == 23)) {
                                    return true
                                } else if(result[0].attack_country == 29 && (x == 33 || x == 35 || x == 19 || x == 15 || x == 25 || x == 30)) {
                                    return true
                                } if(result[0].attack_country == 30 && (x == 29 || x == 25 || x == 26 || x == 31)) {
                                    return true
                                } else if(result[0].attack_country == 31 && (x == 30 || x == 38 || x == 26)) {
                                    return true
                                } else if(result[0].attack_country == 32 && (x == 11 || x == 18 || x == 19 || x == 33 || x == 35 || x == 34)) {
                                    return true
                                } else if(result[0].attack_country == 33 && (x == 19 || x == 32 || x == 29 || x == 35)) {
                                    return true
                                } else if(result[0].attack_country == 34 && (x == 35 || x == 32 || x == 36)) {
                                    return true
                                } else if(result[0].attack_country == 35 && (x == 29 || x == 33 || x == 34 || x == 36 || x == 37 || x == 32)) {
                                    return true
                                } else if(result[0].attack_country == 36 && (x == 34 || x == 37 || x == 35)) {
                                    return true
                                } else if(result[0].attack_country == 37 && (x == 36 || x == 35)) {
                                    return true
                                } else if(result[0].attack_country == 38 && (x == 31 || x == 39 || x == 40)) {
                                    return true
                                } else if(result[0].attack_country == 39 && (x == 40 || x == 38 || x == 41)) {
                                    return true
                                } else if(result[0].attack_country == 40 && (x == 39 || x == 38 || x == 41)) {
                                    return true
                                } else if(result[0].attack_country == 41 && (x == 40 || x == 39)) {
                                    return true
                                } else {
                                    return false
                                }

                            }

                            let winAttack
                            function winner(counter) { /* when u win new territory u recive new soldier depend the country */
                                
                                switch(counter) {
                                    case 0:
                                        winAttack = 1
                                        break;
                                    case 1:
                                        winAttack = 6
                                
                                        break;
                                    case 2:
                                        winAttack = 5
                                        
                                        
                                        break;
                                    case 3:
                                        winAttack = 2
                                        break;
                                    case 4:
                                        winAttack = 7
                                
                                        break;
                                    case 5:
                                        winAttack = 8
                                        
                                        
                                        break;
                                    case 6:
                                        winAttack = 9
                                        break;
                                    case 7:
                                        winAttack = 4
                                
                                        break;
                                    case 8:
                                        winAttack = 3
                                        
                                        
                                        break;
                                    case 9:
                                        winAttack = 3
                                        break;
                                    case 10:
                                        winAttack = 4
                                
                                        break;
                                    case 11:
                                        winAttack = 2
                                        
                                        
                                        break;
                                    case 12:
                                        winAttack = 1
                                        break;
                                    case 13:
                                        winAttack =2
                                
                                        break;
                                    case 14:
                                        winAttack =4
                                        
                                        
                                        break;
                                    case 15:
                                        winAttack = 6
                                        break;
                                    case 16:
                                        winAttack = 1
                                
                                        break;
                                    case 17:
                                        winAttack = 3
                                        
                                        
                                        break;
                                    case 18:
                                        winAttack = 7
                                        break;
                                    case 19:
                                        winAttack = 5
                                
                                        break;
                                    case 20:
                                        winAttack = 11
                                        
                                        
                                        break;
                                    case 21:
                                        winAttack = 10
                                        break;
                                    case 22:
                                        winAttack = 12
                                
                                        break;
                                    case 23:
                                        winAttack = 6
                                        
                                        
                                        break;
                                    case 24:
                                        winAttack = 24
                                        break;
                                    case 25:
                                        winAttack = 1
                                
                                        break;
                                    case 26:
                                        winAttack = 2
                                        
                                        
                                        break;
                                    case 27:
                                        winAttack = 8
                                        break;
                                    case 28:
                                        winAttack = 5
                                
                                        break;
                                    case 29:
                                        winAttack = 7
                                        
                                        
                                        break;
                                    case 30:
                                        winAttack = 3
                                        break;
                                    case 31:
                                        winAttack = 9
                                
                                        break;
                                    case 32:
                                        winAttack = 5
                                        
                                        
                                        break;
                                    case 33:
                                        winAttack = 3
                                        break;
                                    case 34:
                                        winAttack = 1
                                
                                        break;
                                    case 35:
                                        winAttack = 2
                                        
                                        
                                        break;
                                    case 36:
                                        winAttack = 6
                                        break;
                                    case 37:
                                        winAttack = 4
                                
                                        break;
                                    case 38:
                                        winAttack = 3
                                        
                                        
                                        break;
                                    case 39:
                                        winAttack = 2
                                        break;
                                    case 40:
                                        winAttack = 4
                                
                                        break;
                                    case 41:
                                        winAttack = 1
                                        
                                        
                                        break;
                                }
                            }

                            soldiersBlue = divS(soldiersBlue);
                            soldiersRed = divS(soldiersRed);

                            // console.log(board2);

                            console.log(board2[cell+2], board2[85+xOrO], numSoldiers[xOrO], turn, board2[10], colors[cell], soldiersBlue,attack, countriesN );
                            // for(let i=0;i<9;i++){
                            //     if(board[i] != 0) countX++;
                            // }
                            // let isXturn = countX % 2 == 0;

                            if(turn == 0 && xOrO == 1 && colors[cell] == "blue") { /**select where u waant to put soldiers */
                                if(numSoldiers[1] > 1){
                                    st.query("UPDATE games SET turn="+1+","+cellCountrie+"="+(board[cell]+1) +","+soldier+"="+(numSoldiers[xOrO]-1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(numSoldiers[1] == 1) {
                                    st.query("UPDATE games SET turn="+1+","+cellCountrie+"="+(board[cell]+1) +","+soldier+"="+(numSoldiers[xOrO]-1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                }else{
                                    
                                    res.end("ooops");
                                    return;
                                }
                            } else if(turn == 1 && xOrO == 2 && colors[cell] == "red") { /**select where u waant to put soldiers */
                                if(numSoldiers[2] > 1){
                                    st.query("UPDATE games SET turn="+0+","+cellCountrie+"="+(board[cell]+1) +","+soldier+"="+(numSoldiers[xOrO]-1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(numSoldiers[2] == 1) {
                                    st.query("UPDATE games SET turn="+2+","+cellCountrie+"="+(board[cell]+1) +","+soldier+"="+(numSoldiers[xOrO]-1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        st.query("UPDATE games SET soldier_p1="+soldiersBlue+" WHERE id=?",[gameId], (result,err) => {
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });
                                        
                                    });
                                }else{
                                    res.end("ooops");
                                    return;
                                }
                            } else if(turn == 2 && xOrO == 1 && colors[cell] == "blue") { /**u take new soldiers now u need to select where to put */
                                if(numSoldiers[1] > 1){
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]+1) +","+soldier+"="+(numSoldiers[xOrO]-1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(numSoldiers[1] == 1) {
                                    st.query("UPDATE games SET turn="+3+","+cellCountrie+"="+(board[cell]+1) +","+soldier+"="+(numSoldiers[xOrO]-1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                }else{
                                    
                                    res.end("ooops");
                                    return;
                                }
                            } else if(turn == 3 && xOrO == 1 && colors[cell] == "blue") {/** u need to select wich how many soldier attact 3 2 1  */
                                if(board[cell] > 1 && result[0].attack == 0){
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]-1) +","+attack+"="+(result[0].attack+1)+",attack_country="+cell+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(board[cell] > 1 && result[0].attack > 0 && result[0].attack < 3 && cell == result[0].attack_country) {
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]-1) +","+attack+"="+(result[0].attack+1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                }  else if(result[0].attack == 3 && cell == result[0].attack_country ) {
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]+3) +","+attack+"="+(result[0].attack-3)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                }else if(board[cell] == 1 && cell == result[0].attack_country ) {
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]+result[0].attack) +","+attack+"="+(result[0].attack-result[0].attack)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else{
                                    
                                    res.end("ooops");
                                    return;
                                }
                            } else if(turn == 3 && xOrO == 1 && (colors[cell] == "red" || colors[cell] == "green") && itsLegal(cell)) {/**select wich country u want attack */
                                if(result[0].attack > 0) {

                                    let winBlue = 0;
                                    let winRed = 0;

                                    let blueDice1;
                                    let blueDice2;
                                    let blueDice3;

                                    let redDice1;
                                    let redDice2;
                                    let boxBlue = [];
                                    let boxRed = [];
                                    if(result[0].attack == 3 && board[cell] > 1) {
                                        
                                        boxBlue.push(blueDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.push(blueDice2 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.push(blueDice3 = Math.floor(Math.random() * 6) + 1)
                                        boxRed.push(redDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxRed.push(redDice2 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.sort((a,b) => {return b-a});
                                        boxRed.sort((a,b) => {return b-a});

                                        if(boxBlue[0] == boxRed[0] || boxBlue[0] < boxRed[0]) {
                                            boxRed.sort((a,b) => {return a-b});
                                        }

                                        if(boxBlue[0] > boxRed[0]) {
                                            console.log("blue win");
                                            winBlue++
                                        } else if(boxBlue[0] == boxRed[0] || boxBlue[0] < boxRed[0]) {
                                            console.log("red win");
                                            winRed++
                                        }

                                        if(boxBlue[1] > boxRed[1]) {
                                            console.log("second blue win");
                                            winBlue++
                                        } else if(boxBlue[1] == boxRed[1] || boxBlue[1] < boxRed[1]) {
                                            console.log("second red win");
                                            winRed++
                                        }
                                        console.log('b='+boxBlue, 'r='+boxRed, 'wb='+winBlue, 'wr='+winRed);

                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] - (winBlue)) +",attack="+(result[0].attack - (winRed))+" WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            console.log('b2='+boxBlue, 'r2='+boxRed);
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });


                                    } else if(result[0].attack == 3 && board[cell] == 1) {
                                        
                                        boxBlue.push(blueDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.push(blueDice2 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.push(blueDice3 = Math.floor(Math.random() * 6) + 1)
                                        boxRed.push(redDice1 = Math.floor(Math.random() * 6) + 1)
                                    
                                        boxBlue.sort((a,b) => {return b-a});
                                        
                                        if(boxBlue[0] > boxRed[0]) {
                                            console.log("blue win");
                                            winBlue++
                                        } else if(boxBlue[0] == boxRed[0] || boxBlue[0] < boxRed[0]) {
                                            console.log("red win");
                                            winRed++
                                        }
                                        console.log('b='+boxBlue, 'r='+boxRed);

                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] - (winBlue)) +",attack="+(result[0].attack - (winRed))+" WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            console.log('b2='+boxBlue, 'r2='+boxRed);
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });

                                    } else if(result[0].attack == 2 && board[cell] > 1) {
                                        
                                        boxBlue.push(blueDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.push(blueDice2 = Math.floor(Math.random() * 6) + 1)
                                        
                                        boxRed.push(redDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxRed.push(redDice2 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.sort((a,b) => {return b-a});
                                        boxRed.sort((a,b) => {return b-a});

                                        if(boxBlue[0] == boxRed[0] || boxBlue[0] < boxRed[0]) {
                                            boxRed.sort((a,b) => {return a-b});
                                        }

                                        if(boxBlue[0] > boxRed[0]) {
                                            console.log("blue win");
                                            winBlue++
                                        } else if(boxBlue[0] == boxRed[0] || boxBlue[0] < boxRed[0]) {
                                            console.log("red win");
                                            winRed++
                                        }

                                        if(boxBlue[1] > boxRed[1]) {
                                            console.log("second blue win");
                                            winBlue++
                                        } else if(boxBlue[1] == boxRed[1] || boxBlue[1] < boxRed[1]) {
                                            console.log("second red win");
                                            winRed++
                                        }
                                        console.log('b='+boxBlue, 'r='+boxRed);

                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] - (winBlue)) +",attack="+(result[0].attack - (winRed))+" WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            console.log('b2='+boxBlue, 'r2='+boxRed);
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });

                                    } else if(result[0].attack == 2 && board[cell] == 1) {
                                        
                                        boxBlue.push(blueDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.push(blueDice2 = Math.floor(Math.random() * 6) + 1)
                                        
                                        boxRed.push(redDice1 = Math.floor(Math.random() * 6) + 1)
                                        
                                        boxBlue.sort((a,b) => {return b-a});
                                        
                                        if(boxBlue[0] > boxRed[0]) {
                                            console.log("blue win");
                                            winBlue++
                                        } else if(boxBlue[0] == boxRed[0] || boxBlue[0] < boxRed[0]) {
                                            console.log("red win");
                                            winRed++
                                        }
                                        console.log('b='+boxBlue, 'r='+boxRed);

                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] - (winBlue)) +",attack="+(result[0].attack - (winRed))+" WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            console.log('b2='+boxBlue, 'r2='+boxRed);
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });

                                    } else if(result[0].attack == 1 && board[cell] == 1) {
                                        
                                        boxBlue.push(blueDice1 = Math.floor(Math.random() * 6) + 1)
                                        
                                        boxRed.push(redDice1 = Math.floor(Math.random() * 6) + 1)
                                        
                                        
                                        if(boxBlue[0] > boxRed[0]) {
                                            console.log("blue win");
                                            winBlue++
                                        } else if(boxBlue[0] == boxRed[0] || boxBlue[0] < boxRed[0]) {
                                            console.log("red win");
                                            winRed++
                                        }
                                        console.log('b='+boxBlue, 'r='+boxRed);

                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] - (winBlue)) +",attack="+(result[0].attack - (winRed))+" WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            console.log('b2='+boxBlue, 'r2='+boxRed);
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });

                                    } else if(result[0].attack == 1 && board[cell] > 1) {
                                        
                                        boxBlue.push(blueDice1 = Math.floor(Math.random() * 6) + 1)
                                        
                                        boxRed.push(redDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxRed.push(redDice2 = Math.floor(Math.random() * 6) + 1)
                                        
                                        boxRed.sort((a,b) => {return b-a});
                                        if(boxBlue[0] > boxRed[0]) {
                                            console.log("blue win");
                                            winBlue++
                                        } else if(boxBlue[0] == boxRed[0] || boxBlue[0] < boxRed[0]) {
                                            console.log("red win");
                                            winRed++
                                        }
                                        console.log('b='+boxBlue, 'r='+boxRed);

                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] - (winBlue)) +",attack="+(result[0].attack - (winRed))+" WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            console.log('b2='+boxBlue, 'r2='+boxRed);
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });

                                    } else if(board[cell] == 0) {
                                        console.log('im here');
                                        winner(cell);
                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] + result[0].attack) +",attack="+(result[0].attack - result[0].attack)+","+countriesN+"='blue' WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            st.query("UPDATE games SET soldier_p1="+(numSoldiers[1] + winAttack)+" WHERE id=?",[gameId], (result,err) => {
                                                if(err) {
                                                    res.end("");
                                                    return;
                                                }
                                                console.log('b2='+boxBlue, 'r2='+boxRed, 'winner='+winAttack);
                                                res.writeHead(200,{'Content-Type':'text/plain'});
                                                res.end("ok");
                                            });
                                            
                                            
                                        });

                                    }


                                    
                                } else {
                                    
                                    res.end("ooops");
                                    return;
                                }
                                
                            } else if(turn == 4 && xOrO == 1 && colors[cell] == "blue") {/**u can move soldier one territory to other one time */
                                if(board[cell] > 1 && result[0].attack == 0){
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]-1) +","+attack+"="+(result[0].attack+1)+",attack_country="+cell+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(board[cell] > 1 && result[0].attack > 0 && cell == result[0].attack_country) {
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]-1) +","+attack+"="+(result[0].attack+1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(board[cell] == 1 && cell == result[0].attack_country ) {
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]+result[0].attack) +","+attack+"="+(result[0].attack-result[0].attack)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(result[0].attack > 0 && cell != result[0].attack_country && itsLegal(cell) ) {
                                    console.log("hey here!");
                                    st.query("UPDATE games SET turn="+5+","+cellCountrie+"="+(board[cell]+result[0].attack) +","+attack+"="+(result[0].attack-result[0].attack)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        st.query("UPDATE games SET soldier_p2="+(numSoldiers[2] + soldiersRed)+" WHERE id=?",[gameId], (result,err) => {
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });
                                        
                                    });
                                } else{
                                    
                                    res.end("ooops");
                                    return;
                                }
                            } else if(turn == 5 && xOrO == 2 && colors[cell] == "red") {/**turn player 2 everything almost similar, i can make funtion but i have not time */
                                if(numSoldiers[2] > 1){
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]+1) +","+soldier+"="+(numSoldiers[xOrO]-1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(numSoldiers[2] == 1) {
                                    st.query("UPDATE games SET turn="+6+","+cellCountrie+"="+(board[cell]+1) +","+soldier+"="+(numSoldiers[xOrO]-1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                }else{
                                    
                                    res.end("ooops");
                                    return;
                                }
                            } else if(turn == 6 && xOrO == 2 && colors[cell] == "red") {
                                if(board[cell] > 1 && result[0].attack == 0){
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]-1) +","+attack+"="+(result[0].attack+1)+",attack_country="+cell+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(board[cell] > 1 && result[0].attack > 0 && result[0].attack < 3 && cell == result[0].attack_country) {
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]-1) +","+attack+"="+(result[0].attack+1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                }  else if(result[0].attack == 3 && cell == result[0].attack_country ) {
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]+3) +","+attack+"="+(result[0].attack-3)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                }else if(board[cell] == 1 && cell == result[0].attack_country ) {
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]+result[0].attack) +","+attack+"="+(result[0].attack-result[0].attack)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else{
                                    
                                    res.end("ooops");
                                    return;
                                }
                            } else if(turn == 6 && xOrO == 2 && (colors[cell] == "blue" || colors[cell] == "green") && itsLegal(cell)) {
                                if(result[0].attack > 0) {
                            
                                    let winBlue = 0;
                                    let winRed = 0;
                            
                                    let blueDice1;
                                    let blueDice2;
                                    
                            
                                    let redDice1;
                                    let redDice2;
                                    let redDice3;

                                    let boxBlue = [];
                                    let boxRed = [];

                                    if(result[0].attack == 3 && board[cell] > 1) {
                                        
                                        boxBlue.push(blueDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.push(blueDice2 = Math.floor(Math.random() * 6) + 1)
                                        boxRed.push(redDice3 = Math.floor(Math.random() * 6) + 1)
                                        boxRed.push(redDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxRed.push(redDice2 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.sort((a,b) => {return b-a});
                                        boxRed.sort((a,b) => {return b-a});
                            
                                        if(boxBlue[0] == boxRed[0] || boxBlue[0] > boxRed[0]) {
                                            boxBlue.sort((a,b) => {return a-b});
                                        }
                            
                                        if(boxBlue[0] < boxRed[0]) {
                                            console.log("red win");
                                            winRed++
                                            
                                        } else if(boxBlue[0] == boxRed[0] || boxBlue[0] > boxRed[0]) {
                                            console.log("blue win");
                                            winBlue++
                                        }
                            
                                        if(boxBlue[1] < boxRed[1]) {
                                            console.log("second red win");
                                            winRed++
                                        } else if(boxBlue[1] == boxRed[1] || boxBlue[1] > boxRed[1]) {
                                            console.log("second blue win");
                                            winBlue++
                                        }
                                        console.log('b='+boxBlue, 'r='+boxRed, 'wb='+winBlue, 'wr='+winRed);
                            
                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] - (winRed)) +",attack="+(result[0].attack - (winBlue))+" WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            console.log('b2='+boxBlue, 'r2='+boxRed);
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });
                            
                            
                                    } else if(result[0].attack == 3 && board[cell] == 1) {
                                        
                                        boxBlue.push(blueDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxRed.push(redDice2 = Math.floor(Math.random() * 6) + 1)
                                        boxRed.push(redDice3 = Math.floor(Math.random() * 6) + 1)
                                        boxRed.push(redDice1 = Math.floor(Math.random() * 6) + 1)
                                    
                                        boxRed.sort((a,b) => {return b-a});
                                        
                                        if(boxBlue[0] < boxRed[0]) {
                                            console.log("red win");
                                            winRed++
                                            
                                        } else if(boxBlue[0] == boxRed[0] || boxBlue[0] > boxRed[0]) {
                                            console.log("blue win");
                                            winBlue++
                                        }
                            
                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] - (winRed)) +",attack="+(result[0].attack - (winBlue))+" WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            console.log('b2='+boxBlue, 'r2='+boxRed);
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });
                            
                                    } else if(result[0].attack == 2 && board[cell] > 1) {
                                        
                                        boxBlue.push(blueDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.push(blueDice2 = Math.floor(Math.random() * 6) + 1)
                                        
                                        boxRed.push(redDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxRed.push(redDice2 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.sort((a,b) => {return b-a});
                                        boxRed.sort((a,b) => {return b-a});
                            
                                        if(boxBlue[0] == boxRed[0] || boxBlue[0] > boxRed[0]) {
                                            boxBlue.sort((a,b) => {return a-b});
                                        }
                            
                                        if(boxBlue[0] < boxRed[0]) {
                                            console.log("red win");
                                            winRed++
                                            
                                        } else if(boxBlue[0] == boxRed[0] || boxBlue[0] > boxRed[0]) {
                                            console.log("blue win");
                                            winBlue++
                                        }
                            
                                        if(boxBlue[1] < boxRed[1]) {
                                            console.log("second red win");
                                            winRed++
                                        } else if(boxBlue[1] == boxRed[1] || boxBlue[1] > boxRed[1]) {
                                            console.log("second blue win");
                                            winBlue++
                                        }
                                        console.log('b='+boxBlue, 'r='+boxRed, 'wb='+winBlue, 'wr='+winRed);
                            
                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] - (winRed)) +",attack="+(result[0].attack - (winBlue))+" WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            console.log('b2='+boxBlue, 'r2='+boxRed);
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });
                            
                                    } else if(result[0].attack == 2 && board[cell] == 1) {
                                        
                                        boxBlue.push(blueDice1 = Math.floor(Math.random() * 6) + 1)

                                        boxRed.push(redDice2 = Math.floor(Math.random() * 6) + 1)
                                        
                                        boxRed.push(redDice1 = Math.floor(Math.random() * 6) + 1)
                                        
                                        boxRed.sort((a,b) => {return b-a});
                                        
                                        if(boxBlue[0] < boxRed[0]) {
                                            console.log("red win");
                                            winRed++
                                            
                                        } else if(boxBlue[0] == boxRed[0] || boxBlue[0] > boxRed[0]) {
                                            console.log("blue win");
                                            winBlue++
                                        }
                            
                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] - (winRed)) +",attack="+(result[0].attack - (winBlue))+" WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            console.log('b2='+boxBlue, 'r2='+boxRed);
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });
                            
                                    } else if(result[0].attack == 1 && board[cell] == 1) {
                                        
                                        boxBlue.push(blueDice1 = Math.floor(Math.random() * 6) + 1)
                                        
                                        boxRed.push(redDice1 = Math.floor(Math.random() * 6) + 1)
                                        
                                        
                                        if(boxBlue[0] < boxRed[0]) {
                                            console.log("red win");
                                            winRed++
                                            
                                        } else if(boxBlue[0] == boxRed[0] || boxBlue[0] > boxRed[0]) {
                                            console.log("blue win");
                                            winBlue++
                                        }
                                        console.log('b='+boxBlue, 'r='+boxRed);
                            
                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] - (winRed)) +",attack="+(result[0].attack - (winBlue))+" WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            console.log('b2='+boxBlue, 'r2='+boxRed);
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });
                            
                                    } else if(result[0].attack == 1 && board[cell] > 1) {
                                        
                                        boxBlue.push(blueDice1 = Math.floor(Math.random() * 6) + 1)
                                        
                                        boxRed.push(redDice1 = Math.floor(Math.random() * 6) + 1)
                                        boxBlue.push(blueDice2 = Math.floor(Math.random() * 6) + 1)
                                        
                                        boxBlue.sort((a,b) => {return b-a});
                                        if(boxBlue[0] < boxRed[0]) {
                                            console.log("red win");
                                            winRed++
                                            
                                        } else if(boxBlue[0] == boxRed[0] || boxBlue[0] > boxRed[0]) {
                                            console.log("blue win");
                                            winBlue++
                                        }
                                        console.log('b='+boxBlue, 'r='+boxRed);
                            
                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] - (winRed)) +",attack="+(result[0].attack - (winBlue))+" WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            console.log('b2='+boxBlue, 'r2='+boxRed);
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });
                            
                                    } else if(board[cell] == 0) {
                                        winner(cell);
                                        console.log('im here');
                                        st.query("UPDATE games SET "+cellCountrie+"="+ (board[cell] + result[0].attack) +",attack="+(result[0].attack - result[0].attack)+","+countriesN+"='red' WHERE id=?",[gameId], (result,err)=>{
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            st.query("UPDATE games SET soldier_p2="+(numSoldiers[2] + winAttack)+" WHERE id=?",[gameId], (result,err) => {
                                                if(err) {
                                                    res.end("");
                                                    return;
                                                }
                                                console.log('b2='+boxBlue, 'r2='+boxRed, 'winner='+winAttack);
                                                res.writeHead(200,{'Content-Type':'text/plain'});
                                                res.end("ok");
                                            });
                                            
                                        });
                            
                                    }
                            
                            
                                    
                                } else {
                                    
                                    res.end("ooops");
                                    return;
                                }
                                
                            } else if(turn == 7 && xOrO == 2 && colors[cell] == "red") {
                                if(board[cell] > 1 && result[0].attack == 0){
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]-1) +","+attack+"="+(result[0].attack+1)+",attack_country="+cell+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(board[cell] > 1 && result[0].attack > 0 && cell == result[0].attack_country) {
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]-1) +","+attack+"="+(result[0].attack+1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(board[cell] == 1 && cell == result[0].attack_country ) {
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]+result[0].attack) +","+attack+"="+(result[0].attack-result[0].attack)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(result[0].attack > 0 && cell != result[0].attack_country && itsLegal(cell) ) {
                                    console.log("hey here!");
                                    st.query("UPDATE games SET turn="+2+","+cellCountrie+"="+(board[cell]+result[0].attack) +","+attack+"="+(result[0].attack-result[0].attack)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        st.query("UPDATE games SET soldier_p1="+(numSoldiers[1] + soldiersBlue)+" WHERE id=?",[gameId], (result,err) => {
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });
                                        
                                    });
                                } else{
                                    
                                    res.end("ooops");
                                    return;
                                }
                            } else {
                                res.end("ooops");
                                return;
                            }
                            console.log(turn);

                            
                        }
                    }else{
                        res.end("ooops");
                        return;
                    }
                });

            }else{
                res.end();
                return;
            }

        }else if(path.startsWith("/help")) {
            
            let gameId = q.query.id;
            if(gameId){
                gameId = parseInt(gameId);
                
                st.query("SELECT player1, player2, turn, attack, cell_alaska, cell_northwest, cell_greenland, cell_alberta, cell_ontario, cell_quebec, cell_wester_us, cell_eastern_us, cell_central_america, cell_venezuela, cell_peru, cell_brazil, cell_argentina, cell_iceland, cell_scandinavia, cell_ukraine, cell_great_britain, cell_northern_europe, cell_western_europe, cell_southern_europe, cell_ural, cell_siberia, cell_yakutsk, cell_kamchatka, cell_irkutsk, cell_afghanistan, cell_china, cell_mongolia, cell_japan, cell_middle_east, cell_india, cell_siam, cell_north_africa, cell_egypt, cell_congo, cell_east_africa, cell_south_africa, cell_madagascar, cell_indonesia, cell_new_guinea, cell_western_australia, cell_eastern_australia FROM games WHERE id=? AND active=1",[gameId], (result,err)=>{
                    if(err){
                        res.end("");

                        return;
                    }
                    if(result.length == 1){
                        let player1 = result[0].player1;
                        let player2 = result[0].player2;
                        let turn = result[0].turn
                        if(player1 == username || player2 == username){
                            let xOrO = player1 == username ? 1 : 2;

                            let board = [result[0].cell_alaska, result[0].cell_northwest, result[0].cell_greenland, result[0].cell_alberta, result[0].cell_ontario, result[0].cell_quebec, result[0].cell_wester_us, result[0].cell_eastern_us, result[0].cell_central_america, result[0].cell_venezuela, result[0].cell_peru, result[0].cell_brazil, result[0].cell_argentina, result[0].cell_iceland, result[0].cell_scandinavia, result[0].cell_ukraine, result[0].cell_great_britain, result[0].cell_northern_europe, result[0].cell_western_europe, result[0].cell_southern_europe, result[0].cell_ural, result[0].cell_siberia, result[0].cell_yakutsk, result[0].cell_kamchatka, result[0].cell_irkutsk, result[0].cell_afghanistan, result[0].cell_china, result[0].cell_mongolia, result[0].cell_japan, result[0].cell_middle_east, result[0].cell_india, result[0].cell_siam, result[0].cell_north_africa, result[0].cell_egypt, result[0].cell_congo, result[0].cell_east_africa, result[0].cell_south_africa, result[0].cell_madagascar, result[0].cell_indonesia, result[0].cell_new_guinea, result[0].cell_western_australia, result[0].cell_eastern_australia];

                            

                            board.every((value)=> { return (value > 0); });

                            console.log(board.every((value)=> { return (value > 0); }));
                            console.log(board);
                            
                            if(turn == 3 && xOrO == 1 && board.every((value)=> { return (value > 0); })) {/**finish attack */
                                if(result[0].attack > 0){
                                    res.writeHead(200,{'Content-Type':'text/plain'});
                                    res.end("ok");
                                } else if(result[0].attack == 0) {
                                    st.query("UPDATE games SET turn="+4+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                }else{
                                    
                                    res.end("ooops");
                                    return;
                                }
                            } else if(turn == 6 && xOrO == 2 && board.every((value)=> { return (value > 0); })) {
                                if(result[0].attack > 0){
                                    res.writeHead(200,{'Content-Type':'text/plain'});
                                    res.end("ok");
                                } else if(result[0].attack == 0) {
                                    st.query("UPDATE games SET turn="+7+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                }else{
                                    
                                    res.end("ooops");
                                    return;
                                }
                            } else if(turn == 4 && xOrO == 1) {/**dont move soldiers next */
                                if(result[0].attack > 0){
                                    res.writeHead(200,{'Content-Type':'text/plain'});
                                    res.end("ok");
                                } else if(result[0].attack == 0) {
                                    st.query("UPDATE games SET turn="+5+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                }else{
                                    
                                    res.end("ooops");
                                    return;
                                }
                            } else if(turn == 7 && xOrO == 2) {
                                if(result[0].attack > 0){
                                    res.writeHead(200,{'Content-Type':'text/plain'});
                                    res.end("ok");
                                } else if(result[0].attack == 0) {
                                    st.query("UPDATE games SET turn="+2+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                }else{
                                    
                                    res.end("ooops");
                                    return;
                                }
                            } else if(turn == 1 && xOrO == 2 && colors[cell] == "red") {
                                if(numSoldiers[2] > 0){
                                    st.query("UPDATE games SET "+cellCountrie+"="+(board[cell]+1) +","+soldier+"="+(numSoldiers[xOrO]-1)+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        res.writeHead(200,{'Content-Type':'text/plain'});
                                        res.end("ok");
                                    });
                                } else if(numSoldiers[2] == 0) {
                                    st.query("UPDATE games SET "+board2[10]+"="+2+" WHERE id=?",[gameId], (result,err)=>{
                                        if(err) {
                                            res.end("");
                                            return;
                                        }
                                        st.query("UPDATE games SET "+board2[8]+"="+soldiersBlue+" WHERE id=?",[gameId], (result,err) => {
                                            if(err) {
                                                res.end("");
                                                return;
                                            }
                                            res.writeHead(200,{'Content-Type':'text/plain'});
                                            res.end("ok");
                                        });
                                        
                                    });
                                }else{
                                    res.end("ooops");
                                    return;
                                }
                            } else {
                                res.end("ooops");
                                return;
                            }
                            

                            
                        }
                    }else{
                        res.end("ooops");
                        return;
                    }
                });

            }else{
                res.end();
                return;
            }
        }


    }else{//server static files
        st.serveStaticFile(path, res);
    }
}).listen(8080, ()=>{
    console.log('now listening...');
});


function validateUser(username, password, callback){
    st.query("SELECT COUNT(*) AS count FROM users WHERE username=? AND BINARY password=?", [username, password], (result, err)=>{
        if(err){
            callback(false);
            return;
        }
        callback(result[0].count == 1);
    });
}

// let countries = ["alaska", "northwest", "greenland", "alberta", "ontario", "quebec"];
// let counter = 0;
// let colorCounstries = {}

// function startGame() {
//     for(let i=0; i<6; i++) {
//         if(counter == 0) {
//             let j = randBetween(0,countries.length);
//             let countrie = countries[j];
//             countries.splice(j,1);
//             colorCounstries[countrie] = "blue";
//             counter++
//         } else if(counter == 1) {
//             let j = randBetween(0,countries.length);
//             let countrie = countries[j];
//             countries.splice(j,1);
//             colorCounstries[countrie] = "red";
//             counter++
//         } else {
//             let j = randBetween(0,countries.length);
//             let countrie = countries[j];
//             countries.splice(j,1);
//             colorCounstries[countrie] = "green";
//             counter = 0;
//         }
//     }

    
//     // console.log(colorCounstries);
//     // console.log(colorCounstries[""]);
//     // console.log("blue=",Player1.counstries);
//     // console.log("red=", Player2.counstries);
//     // console.log("green=", Player3.counstries);
//     // start.disabled = true;
// }




// function randBetween(lowerBound, upperBound){
//     return lowerBound + Math.floor(Math.random()*(upperBound-lowerBound));
// }