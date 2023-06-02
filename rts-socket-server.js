/**
 * RTS server
 * @date 20.05.2023
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @author Duishenaliev Erdar <erdan.duos@gmail.com>
 */
// config variables
var verbose = true;
var dev = true

// запуск socket.io сервера
const socketport = process.env.PORT || 3333
const host = process.env.HOST || "localhost"
const http = require('http');
var server = http.createServer();
const { Server } = require("socket.io");

io = new Server(server, {
    cors: {
        origin: '*',
        credentials: true
    }
});

server.listen(socketport, host, ()=>{
    console.log(`Socket.io server is running on http://${host}:${socketport}`);
});

if (verbose) { console.log("> server launched"); }

const AllRoomsData = [
    // {
    //     RoomId: '',
    //     RoomFiles: [
    //          {
    //          name: '',
    //          contents: '',
    //          encoding: (0 or 1)
    //          }
    //      ],
    //     RoomOwner: '',
    //     FilesAuthor: '',
    //     URL: IDEURL
    //     CourseId: CourseId,
    // }
];

const AllRoomClients = {
    // [RoomId]=RoomAuthor;
};
// var RoomInfo = {
//     RoomId: '',
//     RoomFiles: {},
//     RoomOwner: '',
//     FilesAuthor: '',
// };
const userSocketMap = {
    //  [socket.id] = username;
};
/**
* Функция, возвращающая все метаданные
* файла с по идентификатору комнаты(сессии)
* @param {string} RoomId номер комнаты(сессии)
* @returns {array} массив json объектов с информ. по файлу
*/
function GetFilesFromRoom(RoomId) {
    var files = []
    for (var i = 0; i < AllRoomsData.length; i++) {
        if (AllRoomsData[i].RoomId == RoomId) {
            files = AllRoomsData[i].RoomFiles
            return files
        }
    }
    return files
}
/**
* Функция, проверяющая создана ли комната(сессия) на сервере?
* @param {string} RoomId номер комнаты
* @returns {boolean} логическое значение Создана ли комната(сессия)?
*/
function IsRoomStarted(RoomId) {
    for (var i = 0; i < AllRoomsData.length; i++) {
        if (AllRoomsData[i].RoomId == RoomId) {
            return true
        }
    }
    return false
}
/**
* Функция, возвращающая позицию комнаты в массиве всех комнат
* @param {string} RoomId номер комнаты
* @returns {boolean or integer} False если комната не нашлась, 
* integer позиции, если комната нашлась
*/
function FindRoomPosition(RoomId) {
    for (var i = 0; i < AllRoomsData.length; i++) {
        if (AllRoomsData[i].RoomId == RoomId) {
            return i
        }
    }
    return false
}
/**
* Функция, возвращающая позицию файла в массиве информации по комнате
* @param {string} RoomFiles все данные по комнате
* @param {string} filename номер комнаты
* @returns {boolean or integer} False если файлы не нашлись, 
* integer позиции, если файл нашелся
*/
function FindFile(RoomFiles, filename) {
    for (var i = 0; i < RoomFiles.length; i++) {
        if (RoomFiles[i].name == filename) {
            return i
        }
    }
    return false
}
/**
* Функция, проверяющая подключен ли владелец комнаты к серверу
* @param {string} RoomOwner имя владельца
* @returns {boolean} подключен ли владелец?
*/
function IsRoomOwnerOnServer(RoomOwner) {
    for (key in userSocketMap) {
        if (userSocketMap[key] == RoomOwner) return true
    }
    return false
}
/**
* Функция, удаляющая все данные комнаты
* @param {string} username имя владельца комнаты
*/
function ClearRoomData(username) {
    for (var i = 0; i < AllRoomsData.length; i++) {
        if (AllRoomsData[i].RoomOwner == username) {
            AllRoomsData.splice(i, 1);
        }
    }
}
/**
* Функция, возвращающая метаданные всех активных 
* сессий(комнат) по индентификатору курса
* для вывода активных сессий(комнат)
* @param {string} CourseId номер комнаты
* @returns {array} массив json объектов с метаданными всех сессий 
*/
function GetActiveSessions(CourseId) {
    var ActiveSessions = []
    for (var i = 0; i < AllRoomsData.length; i++) {
        if (AllRoomsData[i].CourseId == CourseId) {
            let SessionInf = {
                RoomAuthor: '',
                IDEURL: '',
                CourseId: '',
                userid: '',
            }
            SessionInf.RoomAuthor = AllRoomsData[i].RoomOwner
            SessionInf.IDEURL = AllRoomsData[i].URL
            SessionInf.CourseId = AllRoomsData[i].CourseId
            SessionInf.userid = AllRoomsData[i].RoomId
            ActiveSessions.push(SessionInf)
        }
    }
    return ActiveSessions
}
/**
* Функция, возвращающая метаданные одной сессии
* по индентификатору курса и по IDEURL ссылки на IDE
* @param {string} CourseId номер комнаты
* @param {string} IDEURL IDEURL ссылки на IDE комнаты
* @returns {JSON} метаданные сессии 
*/
function GetActiveSessioninf(CourseId, IDEURL) {
    for (var i = 0; i < AllRoomsData.length; i++) {
        if ((AllRoomsData[i].CourseId == CourseId)&&(AllRoomsData[i].URL==IDEURL)) {
            let SessionInf = {
                RoomAuthor: '',
                IDEURL: '',
                CourseId: '',
                userid: '',
            }
            SessionInf.RoomAuthor = AllRoomsData[i].RoomOwner
            SessionInf.IDEURL = AllRoomsData[i].URL
            SessionInf.CourseId = AllRoomsData[i].CourseId
            SessionInf.userid = AllRoomsData[i].RoomId
            return SessionInf
        }
    }
}
/**
* Функция позволяющая использовать результат запроса, только после их получения с сервера
* @param {string} username имя пользователя
* @returns {integer or boolean} идентификатор CourseId в котором находится пользователь
* или False
*/
function GetCourseId(username) {
    for (var i = 0; i < AllRoomsData.length; i++) {
        if (AllRoomsData[i].RoomOwner == username) {
            return AllRoomsData[i].CourseId
        }
    }
    return false
}
/**
* Функция, возвращающая идентификатор пользователя по его имени
* @param {string} username имя пользователя
* @returns {integer or boolean} идентификатор userId пользователя
* или False
*/
function GetUserId(username) {
    for (var i = 0; i < AllRoomsData.length; i++) {
        if (AllRoomsData[i].RoomOwner == username) {
            return AllRoomsData[i].RoomId
        }
    }
    return false
}

io.sockets.on('connection', function (socket) {
    socket.on("CreateRoom", ({ RoomId, username, RoomOwner, FilesAuthor, Files, IDEURL, CourseId }) => {
        userSocketMap[socket.id] = username;
        // Сохраняем данные созданной комнаты, если комната не создана
        if (!IsRoomStarted(RoomId)) {
            let RoomInfo = {
                RoomId: '',
                RoomFiles: {},
                RoomOwner: '',
                FilesAuthor: '',
            };
            RoomInfo.RoomId = RoomId;
            RoomInfo.RoomFiles = Files;
            RoomInfo.RoomOwner = RoomOwner;
            RoomInfo.FilesAuthor = FilesAuthor;
            RoomInfo.URL = IDEURL;
            RoomInfo.CourseId = 'CrsID.' + CourseId;
            AllRoomsData.push(RoomInfo);
            if (dev) console.log(RoomOwner + " created room " + RoomId + " " + FilesAuthor);
            socket.broadcast.to(RoomInfo.CourseId).emit('NewSession', GetActiveSessioninf(RoomInfo.CourseId, RoomInfo.URL));
            console.log(AllRoomsData);
        }
        // console.log(IsRoomOwnerOnServer(RoomOwner), AllRoomClients[RoomOwner], AllRoomClients);
        // Сохраняем данные уникальных владельцев комнат
        AllRoomClients[RoomOwner] = RoomId;

        socket.join(RoomId);
        if (dev) {
            // console.log(AllRoomClients);
            // console.log(Files)
            // console.log(AllRoomsData)
            // console.log(IsRoomOwnerOnServer(RoomOwner));
        }
    });
    socket.on("GetActiveSessions", (CourseId) => {
        socket.join('CrsID.' + CourseId)  // VPL_Activity_Id
        socket.emit('GetActiveSessions', (GetActiveSessions('CrsID.' + CourseId)))
        // console.log('ActiveSs', GetActiveSessions('CrsID.'+CourseId), ' ID  ', CourseId)
    })

    socket.on("EnterRoom", ({ RoomId, username }) => {
        socket.join(RoomId);
        socket.emit("EnterRoom", { files: GetFilesFromRoom(RoomId) });
        if (verbose) {
            //console.log(GetFilesFromRoom(RoomId))
            //console.log(AllRoomsData)
        }
        userSocketMap[socket.id] = username;
        if (dev) console.log(userSocketMap[socket.id] + " connected to room " + RoomId);
    });

    socket.on('disconnect', function () {
        if (userSocketMap[socket.id]!=undefined){
            var username = userSocketMap[socket.id];
            var CourseId = GetCourseId(username)
            socket.broadcast.to(AllRoomClients[username]).emit('UserDiconnected');
            if (dev) {
                console.log(userSocketMap[socket.id] + " disconnected " + AllRoomClients[username]);
            }
            delete userSocketMap[socket.id];
            if (IsRoomOwnerOnServer(username) == false) {
                socket.broadcast.to(CourseId).emit('EndSession', (GetUserId(username)));
                ClearRoomData(username);
                delete AllRoomClients[username]
                console.log(AllRoomsData);
            }
        }
    });
    socket.on('GetEditPerm', (isTeacher) => {
        if (isTeacher == true) {
            socket.emit('EnableEdit')
        } else {
            socket.emit('DisableEdit')
        }
    })
    socket.on('SendEditPerm', ({ RoomId: RoomId, ReadOnly: ReadOnly }) => {
        if (ReadOnly == true) {
            socket.broadcast.to(RoomId).emit('DisableEdit')
            socket.emit('EnableEdit')
        } else {
            socket.broadcast.to(RoomId).emit('EnableEdit')
            socket.emit('DisableEdit')
        }
    })
    socket.on('change', ({
        filename: filename,
        changes: delta,
        room: RoomId,
        content: filecontent
    }) => {
        var RoomPosition = FindRoomPosition(RoomId)
        var FilePosition = FindFile(AllRoomsData[RoomPosition].RoomFiles, filename)
        AllRoomsData[RoomPosition].RoomFiles[FilePosition].contents = filecontent
        if (verbose) {
            //console.log("change " + userSocketMap[socket.id] + " " + delta);
            //console.log(AllRoomsData[FindRoomPosition(RoomId)].cached_instructions[filename]);
            //console.log(AllRoomsData[RoomPosition].RoomFiles[FilePosition])
            //console.log(AllRoomsData[RoomPosition])
        }
        socket.broadcast.to(RoomId).emit('change', {
            delta: delta,
            filename: filename
        })
    });

    socket.on('save', ({
        room: RoomId,
        version: NewVersion
    }) => {
        socket.broadcast.to(RoomId).emit('save', { version: NewVersion })
        if (verbose) {
            console.log('Emitting savings -->', RoomId, NewVersion)
        }
    })

    socket.on('ChangeCursor', ({
        room: RoomId,
        CursorPosition: cursor,
        name: username,
        filename: filename
    }) => {
        socket.broadcast.to(RoomId).emit('ChangeCursor', {
            CursorPosition: cursor,
            name: username,
            filename: filename
        })
    })

    socket.on('ChangeSelection', ({
        room: RoomId,
        rangesJson: rangesJson,
        name: username,
        filename: filename
    }) => {
        socket.broadcast.to(RoomId).emit('ChangeSelection', {
            rangesJson: rangesJson,
            name: username,
            filename: filename
        })
    })
    socket.on('Ready', ({
        roomId: RoomId,
        peerId: peerId
    }) => {
        socket.broadcast.to(RoomId).emit('UserConnected', (peerId))
    })
});
