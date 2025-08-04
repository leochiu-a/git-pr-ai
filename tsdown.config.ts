import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    "git-open-pr": "src/cli/open-pr.ts",
    "git-update-pr-desc": "src/cli/update-pr-desc.ts",
    "postinstall": "scripts/postinstall.ts"
  },
  banner: {
    js: "#!/usr/bin/env node",
  },
});
