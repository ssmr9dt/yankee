let http = require("http");
let path = require("path");

let express = require("express");

let router = express();
let server = http.createServer(router);
let io = require("socket.io")(server);

router.use(express.static(path.resolve(__dirname, "client")));
router.use(
    "/vendor/jquery",
    express.static(path.join(__dirname, "node_modules/jquery/dist"))
);
router.use(
    "/vendor/pixi",
    express.static(path.join(__dirname, "node_modules/pixi.js/bin"))
);

server.listen(process.env.PORT || 37324, process.env.IP || "0.0.0.0", function(){
    let addr = server.address();
    console.log("server listen:", addr.address, ":", addr.port);
});


// var messages = [];
// var sockets = [];

// io.on('connection', function (socket) {
//     messages.forEach(function (data) {
//       socket.emit('message', data);
//     });

//     sockets.push(socket);

//     socket.on('disconnect', function () {
//       sockets.splice(sockets.indexOf(socket), 1);
//       updateRoster();
//     });

//     socket.on('message', function (msg) {
//       var text = String(msg || '');

//       if (!text)
//         return;

//       socket.get('name', function (err, name) {
//         var data = {
//           name: name,
//           text: text
//         };

//         broadcast('message', data);
//         messages.push(data);
//       });
//     });

//     socket.on('identify', function (name) {
//       socket.set('name', String(name || 'Anonymous'), function (err) {
//         updateRoster();
//       });
//     });
//   });

// function updateRoster() {
//   async.map(
//     sockets,
//     function (socket, callback) {
//       socket.get('name', callback);
//     },
//     function (err, names) {
//       broadcast('roster', names);
//     }
//   );
// }

// function broadcast(event, data) {
//   sockets.forEach(function (socket) {
//     socket.emit(event, data);
//   });
// }
