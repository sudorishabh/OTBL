import cors from "cors";
import appEnv from "./app-env";

// Define your allowed origins here
const allowedOrigins = [
  appEnv.WEB_CLIENT,
  appEnv.MOBILE_CLIENT,
  "https://site.otbl.co.in",
].filter(Boolean); // Removes empty or undefined values

const corsOptions = {
  origin: (origin: any, callback: any) => {
    // 1. Allow requests with no origin (like Postman, curl, or React Native mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Check if the origin is in our whitelist
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      console.warn(`Origin blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);
