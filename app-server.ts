import * as express from "express";
import * as socketIo from "socket.io";

export class Connection {
  public socket: any;
  private exp: any;
  private http: any;
  private io: any;

  public startServer = (callback: any) => {
    this.exp = express();
    this.exp.set("port", 3000);
    // tslint:disable-next-line:no-var-requires
    this.http = require("http").Server(this.exp);
    this.io = socketIo(this.http);
    this.exp.get("/", (req: any, res: any) => {
      res.sendFile(__dirname + "/index.html");
    });
    this.http.listen(3000, () => {
      // tslint:disable-next-line:no-console
      console.log("listening on *:3000");
    });
    this.io.on("connection", (sock: any) => {
      this.socket = sock;
      callback();
      // tslint:disable-next-line:no-console
      console.log("user connected!");
      this.socket.on("disconnect", () => {
        // tslint:disable-next-line:no-console
        console.log("user disconnected!");
      });
    });
  }

  public sendPlayingStatus = (paused: boolean) => {
    if (this.socket !== undefined) {
      this.socket.emit("paused", paused);
    }
  }

  public setListener = (socket: any, callback: any) => {
    socket.on("playPause", () => {
      callback("playAndPause", (paused: boolean) => {
        socket.emit("paused", paused);
      });
    });
    socket.on("nextTrack", () => {
      callback("nextTrack", (track: string) => {
        socket.emit("setTrack", track);
      });
    });
    socket.on("previousTrack", () => {
      callback("previousTrack", (track: string) => {
        socket.emit("setTrack", track);
      });
    });
  }

  public setTrack = (track: string) => {
    if (this.socket !== undefined) {
      this.socket.emit("setTrack", track);
    }
  }

  public setTrackAndArtist = (track: String, artist: String) => {
    if (this.socket !== undefined) {
      this.socket.emit("setTrackAndArtist", [track, artist]);
    }
  }

  public sendTracksInPlaylist = (trackList: string[]) => {
    if (this.socket !== undefined) {
      this.socket.emit("TracksInPlaylist", trackList);
    }
  }
}
