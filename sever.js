const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
 });

// 웹브라우저에 띄울 HTML 파일들이 들어있는 public 폴더 지정
app.use(express.static(__dirname + '/public'));

// ⭐ [중요] 24시간 잠들지 않게 봇이 깨워줄 때 응답할 가벼운 통로 생성
app.get('/live-check', (req, res) => {
    res.send('SERVER_IS_ALIVE');
});

io.on('connection', (socket) => {
    console.log('단원 접속 (ID):', socket.id);

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

    socket.on('disconnect', () => {
        console.log('단원 접속 종료 (ID):', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`📞 보이스톡 서버 가동 포트: ${PORT}`);
});