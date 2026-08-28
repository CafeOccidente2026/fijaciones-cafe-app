import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Price Board API corriendo en http://localhost:${env.PORT}`);
});
