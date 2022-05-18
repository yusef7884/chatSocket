const socket = io();

//Query DOM
const messageInput = document.getElementById("messageInput"),
    chatForm = document.getElementById("chatForm"),
    chatBox = document.getElementById("chat-box"),
    feedback = document.getElementById("feedback"),
    onlineUsers = document.getElementById("online-users-list"),
    chatContainer = document.getElementById("chatContainer"),
    pvChatForm = document.getElementById("pvChatForm"),
    pvMessageInput = document.getElementById("pvMessageInput"),
    modalTitle = document.getElementById("modalTitle"),
    pvChatMessage = document.getElementById("pvChatMessage");

const nickname = localStorage.getItem("nickname"),
    roomNumber = localStorage.getItem("chatroom");
let socketId;
// Emit Events
socket.emit("login", { nickname, roomNumber });

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (messageInput.value) {
        socket.emit("chat message", {
            message: messageInput.value,
            name: nickname,
            roomNumber,
        });
        messageInput.value = "";
    }
});

messageInput.addEventListener("keypress", () => {
    socket.emit("typing", { name: nickname, roomNumber });
});

pvChatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    socket.emit("pvChat", {
        message: pvMessageInput.value,
        name: nickname,
        to: socketId,
        from: socket.id,
    });

    $("#pvChat").modal("hide");
    pvMessageInput.value = "";
});
// Listening

socket.on("online", (users) => {
    onlineUsers.innerHTML = "";

    for (const socketId in users) {
        if (roomNumber === users[socketId].roomNumber) {
            onlineUsers.innerHTML += `
            <li >
                <button type="button" class="btn btn-light mx-2 p-2" data-toggle="modal" data-target="#pvChat" data-id=${socketId} data-client=${
                users[socketId].nickname
            }
                ${users[socketId].nickname === nickname ? "disabled" : ""}>
                ${users[socketId].nickname}
                    <span class="badge badge-success"> </span>
                </button>
            </li>
        `;
        }
    }
});

socket.on("chat message", (data) => {
    feedback.innerHTML = "";
    chatBox.innerHTML += `
                        <li class="alert alert-light">
                            <span
                                class="text-dark font-weight-normal"
                                style="font-size: 13pt"
                                >${data.name}</span
                            >
                            <span
                                class="
                                    text-muted
                                    font-italic font-weight-light
                                    m-2
                                "
                                style="font-size: 9pt"
                                >ساعت 12:00</span
                            >
                            <p
                                class="alert alert-info mt-2"
                                style="font-family: persian01"
                            >
                            ${data.message}
                            </p>
                        </li>`;
    chatContainer.scrollTop =
        chatContainer.scrollHeight - chatContainer.clientHeight;
});

socket.on("typing", (data) => {
    if (roomNumber === data.roomNumber)
        feedback.innerHTML = `<p class="alert alert-warning w-25"><em>${data.name} در حال نوشتن است ... </em></p>`;
});

socket.on("pvChat", (data) => {
    $("#pvChat").modal("show");
    socketId = data.from;
    modalTitle.innerHTML = "دریافت پیام از طرف : " + data.name;
    pvChatMessage.style.display = "block";
    pvChatMessage.innerHTML = data.name + " : " + data.message;
});

//JQuery
$("#pvChat").on("show.bs.modal", function (e) {
    var button = $(e.relatedTarget);
    var user = button.data("client");
    socketId = button.data("id");

    modalTitle.innerHTML = "ارسال پیام شخصی به :" + user;
    pvChatMessage.style.display = "none";
});
