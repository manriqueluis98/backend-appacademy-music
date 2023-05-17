const http = require('http');
const fs = require('fs');

/* ============================ SERVER DATA ============================ */
let artists = JSON.parse(fs.readFileSync('./seeds/artists.json'));
let albums = JSON.parse(fs.readFileSync('./seeds/albums.json'));
let songs = JSON.parse(fs.readFileSync('./seeds/songs.json'));

let nextArtistId = 2;
let nextAlbumId = 2;
let nextSongId = 2;

// returns an artistId for a new artist
function getNewArtistId() {
  const newArtistId = nextArtistId;
  nextArtistId++;
  return newArtistId;
}

// returns an albumId for a new album
function getNewAlbumId() {
  const newAlbumId = nextAlbumId;
  nextAlbumId++;
  return newAlbumId;
}

// returns an songId for a new song
function getNewSongId() {
  const newSongId = nextSongId;
  nextSongId++;
  return newSongId;
}

/* ======================= PROCESS SERVER REQUESTS ======================= */
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // finished assembling the entire request body
    // Parsing the body of the request depending on the "Content-Type" header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
    }

    /* ========================== ROUTE HANDLERS ========================== */

    // Your code here

    // GET ARTISTS
    if(req.method === 'GET' && req.url === '/artists'){
      res.statusCode = 200
      res.setHeader('Content-type', 'application/json')
      return res.end(JSON.stringify(artists))
    }

    // GET ARTIST BY ID

    if(req.method === 'GET' && req.url.startsWith('/artists/')){
      const urlParts = req.url.split('/')

      if(urlParts.length === 3){
        const requestedId = urlParts[2]

        if(artists.hasOwnProperty(`${requestedId}`)){
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(artists[requestedId]))
        }else{
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json');
          res.write("Artist not found");
          return res.end();
        }
      }
    }

    //POST AN ARTIST
    if(req.method === 'POST' && req.url === '/artists'){
      let newArtistId = getNewArtistId()
      let newArtist = {
        name: req.body.name,
        artistId: newArtistId
      }

      artists[newArtistId] = newArtist

      res.statusCode = 201
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        name: newArtist.name,
        artistId: newArtist.artistId
      }))
    }

    //EDIT ARTIST BY ID

    if(['PUT', 'PATCH'].includes(req.method) && req.url.startsWith('/artists')){
      const urlParts = req.url.split('/')

      if(urlParts.length === 3){
        const requestedId = urlParts[2]

        let currentArtist // undefined

        const newArtist = req.body

        if(artists.hasOwnProperty(`${requestedId}`)){
          currentArtist = artists[requestedId]

          for(key in newArtist){
            currentArtist[key] = newArtist[key]
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            name: currentArtist.name,
            artistId: currentArtist.artistId,
            updatedAt: Date.now()
          }))
        }else{
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json');
          res.write("Artist not found");
          return res.end();
        }
      }

      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json');
      return res.end()
    }

    // DELETE ARTIST BY ID
    if(req.method === 'DELETE' && req.url.startsWith('/artists')){
      const urlParts = req.url.split('/')
      if(urlParts.length === 3){
        const requestedId = urlParts[2]

        if(artists.hasOwnProperty(`${requestedId}`)){
          delete artists[requestedId]

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            message: "Succefully deleted"
          }))
        }else{
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.write("Artist not found to delete");
          return res.end();
        }
      }
    }

    // GET ALL ALBUMS OF AN ARTIST BY ARTIST ID

    if(req.method === 'GET' && req.url.startsWith('/artists') && req.url.endsWith('/albums')){
      const urlParts = req.url.split('/')
      if(urlParts.length === 4){
        const requestedArtistId = urlParts[2]

        if(artists.hasOwnProperty(`${requestedArtistId}`)){
          let albums = artists[requestedArtistId].albums

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(albums))
        }else{
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.write("Artist not found");
          return res.end();
        }
      }
    }

    //GET ALBUM BY ITS ID

    if(req.method === 'GET' && req.url.startsWith('/albums')){
      const urlParts = req.url.split('/')
      if(urlParts.length === 3){
        const requestedId = urlParts[2]

        if(albums.hasOwnProperty(`${requestedId}`)){
          let album = albums[requestedId]

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json');

          return res.end(JSON.stringify(album))
        }else{
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.write("Album not found");
          return res.end();
        }
      }
    }


    // Add an album to a specific artist based on artistId

    if(req.method === 'POST' && req.url.startsWith('/artists')){
      const urlParts = req.url.split('/')
      if(urlParts.length === 4){
        let artistId = urlParts[2]

        let newAlbumId = getNewAlbumId()
        let newAlbum = {
          ...req.body,
          albumId: newAlbumId,
          artistId: Number.parseInt(artistId)
        }



        albums[newAlbumId] = newAlbum
        artists[artistId].albums.push({
          name: newAlbum.name,
          albumId: newAlbum.albumId,
          artistId: newAlbum.artistId
        })


        res.statusCode = 201
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          name: newAlbum.name,
          albumId: newAlbum.albumId,
          artistId: newAlbum.artistId
        }))
      }

    }

    //### Edit a specified album by albumId

    if(['PUT', 'PATCH'].includes(req.method) && req.url.startsWith('/albums')){
      const urlParts = req.url.split('/')
      if(urlParts.length === 3){
        const requestedAlbumId = urlParts[2]

        if(albums.hasOwnProperty(`${requestedAlbumId}`)){
          let currentAlbum = albums[requestedAlbumId]

          let newAlbum = req.body

          let artistAlbums = artists[currentAlbum.artistId].albums

          for(key in newAlbum){
            currentAlbum[key] = newAlbum[key]
          }

          for(album of artistAlbums){
            if(album.albumId == requestedAlbumId){
              album.name = currentAlbum.name,
              album.artistId = currentAlbum.artistId,
              album.albumId = currentAlbum.albumId
            }
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            name: currentAlbum.name,
            albumId: currentAlbum.albumId,
            artistId: currentAlbum.artistId,
            updatedAt: Date.now()
          }))
        }else{
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.write("Album not found");
          return res.end();
        }
      }
    }

    //### Delete a specified album by albumId

    if(req.method === 'DELETE' && req.url.startsWith('/albums')){
      const urlParts = req.url.split('/')
      if(urlParts.length === 3){
        const requestedAlbumId = urlParts[2]

        if(albums.hasOwnProperty(`${requestedAlbumId}`)){
          let currentAlbum = albums[requestedAlbumId]
          let artistAlbums = artists[currentAlbum.artistId].albums
          let index = artistAlbums.findIndex((album) => album.albumId == requestedAlbumId)
          artistAlbums.splice(index)
          delete albums[requestedAlbumId]

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            message: "Sucessfully deleted"
          }))
        }else{
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.write("Album not found");
          return res.end();
        }
      }
    }

    //### Get all songs of a specific artist based on artistId

    if(req.method === "GET" && req.url.startsWith('/artists') && req.url.endsWith('/songs')){
      const urlParts = req.url.split('/')
      if(urlParts.length === 4){
        const requestedArtistId = Number.parseInt(urlParts[2])

        if(artists.hasOwnProperty(`${requestedArtistId}`)){
          let artistAlbums = artists[requestedArtistId].albums

          let albumsIds = artistAlbums.map(album => album.albumId)

          let requestedSongs = []

          for(key in songs){
            if(albumsIds.includes(songs[key].albumId)){
              requestedSongs.push(songs[key])
            }
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(requestedSongs))
        }else{

          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.write("Artist not found");
          return res.end();

        }

      }
    }

    //### Get all songs of a specific album based on albumId

    if(req.method === 'GET' && req.url.startsWith('/albums') && req.url.endsWith('/songs')){
      const urlParts = req.url.split('/')
      if(urlParts.length === 4){
        const requestedAlbumId = Number.parseInt(urlParts[2])

        let requestedSongs = []

        if(albums.hasOwnProperty(`${requestedAlbumId}`)){
          for(key in songs){
            if(songs[key].albumId === requestedAlbumId){
              requestedSongs.push(songs[key])
            }
          }

          req.statusCode = 200
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(requestedSongs))
        }else{
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.write("Album not found");
          return res.end();
        }
      }
    }

    //### Get a specific song's details based on songId

    if(req.method === 'GET' && req.url.startsWith('/songs')){
      const urlParts = req.url.split('/')
      if(urlParts.length === 3){
        const requestedSongId = Number.parseInt(urlParts[2])

        if(songs.hasOwnProperty(`${requestedSongId}`)){
          let requestedSong // undefined

          for(key in songs){
            if(songs[key].songId === requestedSongId){
              requestedSong = songs[key]
            }
          }

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(requestedSong))
        }else{
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.write("Song not found");
          return res.end();
        }
      }
    }

    //### Add a song to a specific album based on albumId

    if(req.method === 'POST' && req.url.startsWith('/albums') && req.url.endsWith('/songs')){
      const urlParts = req.url.split('/')

      if(urlParts.length === 4){
        const requestedAlbumId = Number.parseInt(urlParts[2])

        if(albums.hasOwnProperty(`${requestedAlbumId}`)){
          let currentAlbum = albums[requestedAlbumId]
          let newSongId = getNewSongId()

          if(!currentAlbum.hasOwnProperty('songs')){
            currentAlbum.songs = []
          }

          let newSong = {
            name: req.body.name,
            lyrics: req.body.lyrics,
            trackNumber: req.body.trackNumber,
            songId: newSongId,
            albumId: currentAlbum.albumId,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }

          currentAlbum.songs.push(newSong)

          songs[newSongId] = newSong

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            name: newSong.name,
            lyrics: newSong.lyrics,
            trackNumber: newSong.trackNumber,
            songId: newSong.songId,
            albumId: newSong.albumId
          }))
        }else{
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.write("Album not found");
          return res.end();
        }
      }
    }


    if(['PUT', 'PATCH'].includes(req.method) && req.url.startsWith('/songs')){
      const urlParts = req.url.split('/')
      if(urlParts.length === 3){
        const songIdRequested = urlParts[2]

        if(songs.hasOwnProperty(`${songIdRequested}`)){
          let currentSong = songs[songIdRequested]
          let currentAlbum = albums[currentSong.albumId]
          let newSong = req.body

          for(key in newSong){
            currentSong[key] = newSong[key]
          }
          currentAlbum.songs[songIdRequested] = currentSong
          currentSong.updatedAt = Date.now()

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(currentSong))
        }else{
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.write("Song not found");
          return res.end();
        }
      }
    }

    //### Delete a specified song by songId

    if(req.method === 'DELETE' && req.url.startsWith('/songs')){
      const urlParts = req.url.split('/')
      if(urlParts.length === 3){
        const requestedSongId = urlParts[2]

        if(songs.hasOwnProperty(requestedSongId)){
          let currentAlbum = albums[songs[requestedSongId].albumId]
          let index = currentAlbum.songs.findIndex((song) => song.songId == requestedSongId)

          currentAlbum.songs.splice(index)

          delete songs[requestedSongId]

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            message: "Sucessfully deleted"
          }))
        }
      }else{
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.write("Song not found");
        return res.end();
      }
    }


    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.write("Endpoint not found");
    return res.end();
  });
});

const port = 5000;

server.listen(port, () => console.log('Server is listening on port', port));
