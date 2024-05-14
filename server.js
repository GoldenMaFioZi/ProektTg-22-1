let express = require("express")
let server = express()
let http = require("http").createServer(server).listen(6970)
let io = require("socket.io")(http)
let fs = require("fs-extra")

server.use(express.static(__dirname + "/css"))
server.use(express.static(__dirname + "/js"))
server.use(express.static(__dirname + "/html"))
server.use("/Photo", express.static("photo"))

server.get("/", function(request, response) {
    response.sendFile(__dirname + "/html/Secret Shop.html")    
})

server.get("/login", function(request, response) {
    response.sendFile(__dirname + "/html/login.html")    
})

server.get("/registration", function(request, response) {
    response.sendFile(__dirname + "/html/registration.html")    
})

server.get("/cabinet", function(request, response) {
    response.sendFile(__dirname + "/html/cabinet.html")    
})

server.get("/editor", function(request, response) {
    response.sendFile(__dirname + "/html/editor.html")    
})

io.sockets.on("connection", function(socket) {
    //сокет переадресации
    socket.on("redirect", function(session){
        let sessionDB = fs.readJSONSync("database/session.json")
        for (let i = 0; i < sessionDB.data.length; i++) {
            if(sessionDB.data[i].user_login == session.user_login && sessionDB.data[i].device_id == session.device_id){
                socket.emit("redirect")
            }
        }
    })
    //Сокет получения данных юзера
    socket.on("getDataUser", function(user_login){
        let userDB = fs.readJSONSync("database/users.json")
        for (let i = 0; i < userDB.users.length; i++) {
            if(userDB.users[i].login == user_login){
                socket.emit("getDataUser", userDB.users[i])
                break
            }
        }
    })
    //Сокет добавление товара в БД
    socket.on("addProduct", function(product, user_login){
        let userDB = fs.readJSONSync("database/users.json")
        for (let i = 0; i < userDB.users.length; i++) {
            if(userDB.users[i].login == user_login){
                userDB.users[i].product.push(product)
                fs.writeFileSync("database/users.json", JSON.stringify(userDB, null, 4))
                socket.emit("addProduct")
                break
            }
        }
    })

    //сокет получения товара из бД
    socket.on("getProduct", function(){
        let userDB = fs.readJSONSync("database/users.json")
        let arrProduct = []
        for (let i = 0; i < userDB.users.length; i++) {
            if(userDB.users[i].type != "Покупатель"){
                arrProduct = arrProduct.concat(userDB.users[i].product)
            }
        }
        socket.emit("getProduct", arrProduct)
    })

    //сокет регистрации
    socket.on("sendUser", function(user) {
        let userDB = fs.readJSONSync("database/users.json")
        for (let i = 0; i < userDB.users.length; i++) {
            if(userDB.users[i].login == user.login){
                socket.emit("errorCode0", true)
                break
            } else {
                if(userDB.users.length - 1 == i){
                    userDB.users.push(user)
                    fs.writeFileSync("database/users.json", JSON.stringify(userDB, null, 4))
                    socket.emit("errorCode0", false)
                    break
                }
            }
        }        
    })
    //сокет авторизации
    socket.on("sendLogin", function(user) {
        let userDB = fs.readJSONSync("database/users.json")
        for (let i = 0; i < userDB.users.length; i++) {
            if(userDB.users[i].login == user.login && userDB.users[i].password == user.password){
                socket.emit("errorCode1", false)
                break
            } else {
                if(userDB.users.length - 1 == i){
                    socket.emit("errorCode1", true)
                    break
                }
            }
        }
    })
    //Сокет сессии
    socket.on("sendSession", function(session){
        let sessionDB = fs.readJSONSync("database/session.json")
        for (let i = 0; i <= sessionDB.data.length; i++) {
            if(sessionDB.data[i].user_login == session.user_login){
                sessionDB.data[i].device_id = session.device_id
                fs.writeFileSync("database/session.json", JSON.stringify(sessionDB, null, 4))
                break
            }
            if(sessionDB.data.length - 1 == i){
                sessionDB.data.push(session)
                fs.writeFileSync("database/session.json", JSON.stringify(sessionDB, null, 4))
            }
        }
    })
})