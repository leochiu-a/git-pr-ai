import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "git-open-pr.ts",
  banner: {
    js: "#!/usr/bin/env node",
  },
});
