# 포켓몬 초고난도 퀴즈 — GitHub Pages 배포용

이 저장소는 **Vite + React**로 구성되어 있고, **GitHub Actions**가 자동으로 Pages에 배포합니다.

## 빠른 사용법

1. GitHub에서 새 저장소를 만듭니다. (공개 Public 권장)
2. 이 폴더의 모든 파일을 그대로 업로드/커밋합니다.
3. 저장소 이름을 예시로 `pokemon-quiz`라 하면, 아래 두 설정을 합니다.
   - Settings → Pages → Build and deployment: **GitHub Actions** 선택
   - `/.github/workflows/deploy.yml` 파일에서 `env: VITE_BASE: '/pokemon-quiz/'` 부분을 **본인 저장소명으로 변경**

4. main 브랜치로 push하면, Actions가 자동으로 빌드/배포합니다.
5. 잠시 후 **Settings → Pages**에 표시되는 URL
   - 일반적으로 `https://<your-id>.github.io/pokemon-quiz` 형태입니다.

## 로컬 실행
```bash
npm install
npm run dev
```
