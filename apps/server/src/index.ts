import "dotenv/config";
import app from "./app";

app.listen(7200, () => {
  console.log(`Server is running on port 7200 in ${process.env.NODE_ENV} mode`);
});
