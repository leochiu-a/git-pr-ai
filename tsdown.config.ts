import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "git-open-pr": "src/git-open-pr.ts",
    "postinstall": "scripts/postinstall.ts"
  },
  banner: {
    js: "#!/usr/bin/env node",
  },
});
