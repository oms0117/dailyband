const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

// public 폴더 연결
app.use(express.static(__dirname + '/public'));

// 24시간 안 잠들게 하는 체크용 경로
app.get('/live-check', (req, res) => {
    res.send('SERVER_IS_ALIVE');
});

// 소켓 연결 설정
io.on('connection', (socket) => {
    socket.on('join-voicetalk', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', socket.id);
    });
    socket.on('offer', (data) => {
        socket.to(data.roomId).emit('offer', { sdp: data.sdp, sender: socket.id });
    });
    socket.on('answer', (data) => {
        socket.to(data.roomId).emit('answer', { sdp: data.sdp, sender: socket.id });
    });
    socket.on('ice-candidate', (data) => {
        socket.to(data.roomId).emit('ice-candidate', { candidate: data.candidate, sender: socket.id });
    });
});

// 포트 설정 및 서버 실행
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`SERVER_IS_RUNNING_ON_PORT_${PORT}`);
});
