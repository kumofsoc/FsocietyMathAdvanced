# FsocietyMathAdvanced

Интерактивный курс высшей математики на React + TypeScript.

## Стек

- React 19 + TypeScript + Vite
- Framer Motion
- GSAP
- Three.js / React Three Fiber
- XYFlow для интерактивной карты курса
- KaTeX для формул

## Уже реализовано

- 18 глав курса и связанная карта тем
- карточки карты можно перетаскивать; связи следуют за узлами
- Alt + колесо над карточкой вращает карточку
- zoom / pan / fit-view
- темы Black, White, Catppuccin Mocha, Catppuccin Latte, Neovim, Tokyo Night, Gruvbox, Nord
- Custom Theme Studio с сохранением в localStorage
- собственный курсор для desktop
- расширенная глава «Линейная алгебра»
- все 8 основных свойств определителя
- theorem / proof / definition / property / formula / example / solution / summary blocks
- Three.js лаборатория линейных преобразований: базисные векторы, det и rank
- ambient Three.js фон, реагирующий на скролл

## Запуск

```bash
pnpm install
pnpm dev
```

или

```bash
npm install
npm run dev
```

## Принцип контента

На сайте не указывается конкретный учебник-источник. Учебный материал организован как самостоятельный курс: определения → свойства → доказательства → следствия → примеры → визуализации → практика.
