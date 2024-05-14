let socket = io()

//функция регистрации и ее валидации
function regFunc(){
    let userType = document.getElementById("userType").value
    let userName = document.getElementById("userName").value
    let userLogin = document.getElementById("userLogin").value
    let userPassword_1 = document.getElementById("userPassword_1").value
    let userPassword_2 = document.getElementById("userPassword_2").value

    if(userPassword_1 == userPassword_2){
        if(document.getElementById("userPassword_1").value.length >= 8){
            let user = {
                "type": userType,
                "name": userName,
                "login": userLogin,
                "password": userPassword_1,
                "product": []
            }
            socket.emit("sendUser", user)
        } else {
            alert("Пароль слишком короткий")
        }
    } else {
        alert("Пароли не совпадают")
    }
}

//функция автовхода
function redirect(){
    let session = {
        "user_login": localStorage.getItem("user_login"),
        "device_id": localStorage.getItem("device_id")
    }
    socket.emit("redirect", session)
}

socket.on("redirect", function(){
    document.location.href = "/cabinet"
})

//Функция авторизации
function loginFunc(){
    let login = document.getElementById("login").value
    let password = document.getElementById("password").value
    let user = {
        "login": login,
        "password": password
    }
    socket.emit("sendLogin", user)
}

//Функция выхода из личного кабинета
function funcLogout(){
    localStorage.clear()
    document.location.href = "/"
}

//Функция получения данных пользователя
function getDataUser(){
    let user_login = localStorage.getItem("user_login")
    socket.emit("getDataUser", user_login)
}
socket.on("getDataUser", function(user_data){
    document.getElementById("icon-name").textContent = user_data.name
    if(user_data.type == "Покупатель"){
        document.getElementById("icon-editor").remove()
    } else {
        document.getElementById("icon-cart").remove()
    }
})

//Функция добавления товара
function addProduct(){
    let productName = document.getElementById("productName").value
    let productDesc = document.getElementById("productDesc").value
    let productPrice = document.getElementById("productPrice").value
    let user_login = localStorage.getItem("user_login")
    let product = {
        "name": productName,
        "desc": productDesc,
        "price": productPrice
    }
    socket.emit("addProduct", product, user_login)
}

socket.on("addProduct", function(){
    alert("Товар успешно добавлен в ваш магазин")
})

//функция загрузки товара
function getProduct(){
    socket.emit("getProduct")
}

socket.on("getProduct", function(arrProduct){
    for (let i = 0; i < arrProduct.length; i++) {
        let html = "<div class=productCard><div class=productIMG></div><div class=productName>" + arrProduct[i].name + "</div><div class=productPrice>" + arrProduct[i].price + "</div><div class=productDesc>" + arrProduct[i].desc + "</div>"
        document.getElementById("content").insertAdjacentHTML("beforeend", html)
    }
})

//функции отлова ошибок
//errorCode0 - пользователь уже существует
socket.on("errorCode0", function(status){
    if(status){
        alert("Логин пользователя занят")
    } else {
        alert("Вы успешно создали аккаунт")
    }
})

//errorCode1 - проверка авторизации
socket.on("errorCode1", function(status){
    if(status){
        alert("Неверный логин или пароль")
    } else {
        localStorage.setItem("user_login", document.getElementById("login").value)
        localStorage.setItem("device_id", crypto.randomUUID())
        let session = {
            "user_login": localStorage.getItem("user_login"),
            "device_id": localStorage.getItem("device_id")
        }
        socket.emit("sendSession", session)
        document.location.href = "/cabinet"
    }
})