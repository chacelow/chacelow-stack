import { playwright } from "@vitest/browser-playwright";
import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			browser: {
				enabled: true,
				headless: true,
				instances: [
					{ browser: "chromium", viewport: { height: 720, width: 1280 } },
				],
				provider: playwright(),
			},
			include: ["src/**/*.test.tsx"],
			setupFiles: ["./src/test-setup.ts"],
		},
	}),
);
