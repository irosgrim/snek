import { defineConfig, splitVendorChunkPlugin } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    //publicDir: path.resolve(__dirname, "src/assets"),
    base: "/snek/",
    root: "./",
    publicDir: "public",
});
