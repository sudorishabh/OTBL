import cors from "cors";
import appEnv from "./app-env";

const corsOptions = {
  origin: [appEnv.MOBILE_CLIENT, appEnv.WEB_CLIENT],
  credentials: true,
};

export default cors(corsOptions);
