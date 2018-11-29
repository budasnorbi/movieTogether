
const 
  express = require('express'),
  app = express(),
  http = require('http').Server(app),
  siofu = require("socketio-file-upload"),
  io = require('socket.io')(http),
  fs = require('fs');
  var ffmpeg = require('fluent-ffmpeg');



app.use(siofu.router);
app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

io.on('connection', function(socket){

  const uploader = new siofu();
  uploader.dir = __dirname + '/public/video/mp4';
  uploader.listen(socket);
  uploader.on('progress', event => {
    const progressPct = (event.file.bytesLoaded / event.file.size * 100).toFixed(0);
    socket.emit('upload-progress', progressPct);
  });

  uploader.on('complete', event => {

    fs.readdir(`${__dirname}/public/video/mp4`, (err, files) => {

      const videoName = files[0];

      ffmpeg(`${__dirname}/public/video/mp4/${videoName}`, { timeout: 0 }).addOptions([
          '-profile:v baseline',
          '-level 3.0', 
          '-s 1280x720',     
          '-start_number 0',     
          '-hls_time 10',        
          '-hls_list_size 0',    
          '-f hls'               
      ]).output(`${__dirname}/public/video/converted/movie.m3u8`).on('end', callback).run()

      function callback() {
        socket.emit('movieIsPlayable', true);
      }

    });

    socket.emit('successed', true);
  })
});


http.listen(3000, () => {
  console.log('listening on *:3000');
});



