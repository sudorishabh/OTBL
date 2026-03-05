import cors from "cors";
import appEnv from "./app-env";

const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Reflect origin back to client if it exists, otherwise allow
    callback(null, origin || true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);
