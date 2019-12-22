var cli = () => {           

    require("dotenv").config();         

    var Spotify = require('node-spotify-api');
    var keys = require("./keys.js");
    var axios = require("axios");    
    var moment = require("moment");
    var fs = require("fs");
    var spotify = new Spotify(keys.spotify);
    var inquirer = require("inquirer");
    var command = process.argv[2];
    var parameter = process.argv.slice(3).join(" ") || null;                            


    var executeFlow = () => {

        var concertThis = () => {
            var artist = parameter;        
            var urlArtist = artist.split(' ').join('%20');  
            urlArtist.replace('"', '');
            queryURL = `https://rest.bandsintown.com/artists/${urlArtist}/events?app_id=codingbootcamp`       
            axios.get(queryURL).then(
                response => {
                    for (var i = 0; i < response.data.length; i++) {        
                        var date = moment(response.data[i].datetime)  
                        console.log (

                            `--------------------------------------------------------------
Concert venue name: ${response.data[i].venue.name}
Location:           ${response.data[i].venue.city}, ${response.data[i].venue.country} 
Event date:         ${date.format("MMMM DD YYYY")}
--------------------------------------------------------------
`
                        )
                    }
                },

                error => {
                    if (error.response) {

                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);                                

                        console.log(error.request);
                    } else {

                        console.log("Error", error.message);
                    }
                    console.log(error.config);
                }
            )
        }

        var spotifyThisSong = () => {
            var songTitle;
            var artist;
            var album;
            var song;                
            var preview;
            if (parameter) {
                songTitle = parameter;
            } else songTitle = "the sign";

            spotify.search({ type: 'track', query: songTitle })
                .then(response => {

                    if (parameter) {
                        artist = response.tracks.items[0].album.artists[0].name;  
                        album = response.tracks.items[0].album.name;
                        song = response.tracks.items[0].name;
                        preview = response.tracks.items[0].preview_url;
                    } else {
                        for (var i = 0; i < response.tracks.items.length; i++) {
                            if ((response.tracks.items[i].album.artists[0].name === "Ace of Base") && (response.tracks.items[i].name === "The Sign")) {
                                artist = (response.tracks.items[i].album.artists[0].name);
                                album = response.tracks.items[i].album.name;         
                                song = response.tracks.items[i].name;
                                preview = response.tracks.items[i].preview_url;
                            }
                        }
                    }
                    console.log(
                        `--------------------------------------------------------------
Artist:                     ${artist}
From the album:             ${album}
Song title:                 ${song}
Link to a preview of song:  ${preview}
--------------------------------------------------------------`
                    )
                })
                .catch(err => console.log(err));

        }

        var movieThis = () => {
            var movie;
            if (parameter) {                                
                movie = parameter.split(" ").join("+");
            } else movie = "mr+nobody";

            queryURL = `http://www.omdbapi.com/?apiKey=trilogy&t=" + ${movie}`
            
            axios.get(queryURL).then(
                response => {
                    var movie = response.data;
                    console.log(
                        `--------------------------------------------------------------
                
Title:                  ${movie.Title}
Year Released:          ${movie.Year}
IMDB Rating:            ${movie.Ratings[0].Value}
Rotten Tomatos Rating:  ${movie.Ratings[0].Value}
Country Produced in:    ${movie.Country}
Original Language:      ${movie.Language}
Plot:                   ${movie.Plot}
Actors:                 ${movie.Actors}
--------------------------------------------------------------`
                    )
                }
            )
        }

        var doWhatItSays = () => {
            fs.readFile("random.txt", "utf-8", (err, data) => {   
                if (err) {
                    return console.log(err)
                }
                var dataArr = data.split(",");
                command = dataArr[0];                   
                parameter = dataArr[1].trim().replace(/"/g, '');
                executeFlow();
                return;


            })
        }

        


        switch (command) {
            case "concert-this":
                concertThis()               
                break;

            case "spotify-this-song":
                spotifyThisSong()
                break;

            case "movie-this":
                movieThis()
                break;

            case "do-what-it-says":
                doWhatItSays()
                break;

        }

    }

    if (process.argv.length < 3) {          

        inquirer.prompt([                  
            {                                   
                type: "list",
                message: "What command would you like Liri to carry out?",
                choices: ["spotify-this-song", "movie-this", "concert-this", "do-what-it-says"],
                name: "command"
            },
            {
                type: "input",
                message: "Okay, now give the command a parameter. Ex: song name if you chose spotify-this-song or movie name for movie-this",
                name: "parameter"
            }
        ]).then(inquirerResponse => {
            command = inquirerResponse.command;         
            parameter = inquirerResponse.parameter;
            executeFlow();                              
        })
    } else executeFlow();                          
    
}

cli()                          