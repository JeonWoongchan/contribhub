import { defineConfig } from 'vitest/config'

export default defineConfig({
    resolve: {
        // tsconfig.json의 "@/*": ["./src/*"] 경로 별칭을 네이티브로 인식한다.
        // 이것 없이는 import '@/lib/...' 경로를 못 찾아서 테스트가 실패한다.
        tsconfigPaths: true,
    },
    test: {
        environment: 'node',
    },
})
