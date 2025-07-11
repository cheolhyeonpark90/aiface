// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // 저장소 이름으로 설정
//   base: '/aiface/', 
  
  // ✅ 이 부분을 추가합니다.
  // public 폴더를 빌드 결과물에 포함시키도록 명시합니다.
  // 이렇게 하면 Vite가 publicDir의 내용을 올바르게 처리합니다.
  publicDir: 'public',

  build: {
    // 빌드 결과물이 dist 폴더에 생성되도록 합니다 (기본값)
    outDir: 'dist',
  }
})