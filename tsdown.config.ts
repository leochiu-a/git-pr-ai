import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "git-open-pr": "git-open-pr.ts",
    "postinstall": "postinstall.ts"
  },
  banner: {
    js: "#!/usr/bin/env node",
  },
});
