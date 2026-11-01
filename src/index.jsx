import ReactDOM from "react-dom/client";
import { io } from "socket.io-client";

import init from "./init.jsx";

const app = async () => {
  const root = ReactDOM.createRoot(document.querySelector("#root"));
  const socket = io();
  root.render(await init(socket));
};

app();
