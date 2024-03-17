import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import styleX from "vite-plugin-stylex";

export default defineConfig({
	optimizeDeps: {
		include: [
			'@emotion/react',
			'@emotion/styled',
			'@mui/material/Tooltip'
		],
	},
	plugins: [ react(), styleX() ],
});

