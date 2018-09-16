import * as express from "express";
import * as socketIo from "socket.io";

export const startServer = () => {
    const exp = express();
    exp.set("port", 3000);
    // tslint:disable-next-line:no-var-requires
    const http = require("http").Server(exp);
    exp.get("/", (req: any, res: any) => {
      res.send("Test");
    });
    const server = http.listen(3000, () => {
      // tslint:disable-next-line:no-console
      console.log("listening on *:3000");
    });
    server.on("connection", (socket: any) => {
        // tslint:disable-next-line:no-console
      console.log("user connected!");
      socket.on("disconnect", () => {
        // tslint:disable-next-line:no-console
        console.log("user disconnected!");
      });
      socket.on("test", (msg: string) => {
        // tslint:disable-next-line:no-console
          console.log(msg);
      });
    });
};
