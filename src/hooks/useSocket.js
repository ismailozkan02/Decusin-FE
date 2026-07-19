import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuth from "hooks/useAuth";

const useSocket = (me, url, path, query) => {
  const [socket, setSocket] = useState(null);
  const { refreshToken } = useAuth();

  useEffect(() => {
    if (me) {
      connect().then((socketIO) => {
        setSocket(socketIO);
      });
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [me]);

  const connect = () => {
    return new Promise((resolve, reject) => {
      try {
        const session = JSON.parse(localStorage.getItem("session"));
        const socketIO = io(url, {
          path: `/socket.io`,
          secure: true,
          reconnection: true,
          forceNew: true,
          transports: ["websocket"],
          auth: {
            token: session?.access?.token,
          },
          query,
        });

        socketIO.on("connect", () => {
          resolve(socketIO);
        });

        socketIO.on("timestamp", () => {
          console.log("connect timestamp");
        });

        socketIO.on("connect_error", (e) => {
          if (e.message === "Invalid token") {
            refreshToken()
              .then(async () => {
                try {
                  resolve(await connect());
                } catch (err) {
                  reject(err);
                }
              })
              .catch((err) => {
                reject(err);
              });
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  return socket;
};

export default useSocket;
