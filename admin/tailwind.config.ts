import type { Config } from "tailwindcss";
import preset from "../shared/tailwind.preset";

/** Theme comes from the shared design-token preset; this app only adds where to scan for classes. */
const config: Config = {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx}", "../shared/src/**/*.{ts,tsx}"],
};

export default config;
