# 第三方素材与授权 · Third-Party Notices

Make Trades Journey 用到的第三方程式码与字体，连同它们的授权。
这份档案本身就是「保留版权与授权声明」这项义务的落点 —— 移除它等于让站上
十几支档案失去合规依据，所以它不是文件，是必要档案。

---

## React Bits

- **出处** https://reactbits.dev · https://github.com/DavidHDev/react-bits
- **版权** Copyright (c) 2026 David Haz
- **授权** MIT + Commons Clause License Condition v1.0
- **全文** https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md

### 用了哪些

以下每一支都是**独立重写的原生 JS 移植版**（上游是 React + ogl/three），
不是复制贴上；但概念、着色器与参数来自上游，所以照样要标注。

- `assets/acidsquares.js` — 移植自 `<AcidSquares />`
- `assets/galaxy.js` — 移植自 `<Galaxy />`
- `assets/gradientwaves.js` — 移植自 `<GradientWaves />`
- `assets/gridscan.js` — 移植自 `<GridScan />`
- `assets/hyperspeed.js` — 移植自 `<Hyperspeed />`
- `assets/letterglitch.js` — 移植自 `<LetterGlitch />`
- `assets/lightfall.js` — 移植自 `<Lightfall />`
- `assets/lighttunnel.js` — 移植自 `<LightTunnel />`
- `assets/liquidchrome.js` — 移植自 `<LiquidChrome />`
- `assets/moltenmetal.js` — 移植自 `<MoltenMetal />`
- `assets/orb.js` — 移植自 `<Orb />`
- `assets/particles.js` — 移植自 `<Particles />`
- `assets/prism.js` — 移植自 `<Prism />`
- `assets/rotatingtext.js` — 移植自 `<RotatingText />`
- `assets/slicedwaves.js` — 移植自 `<SlicedWaves />`

### Commons Clause 怎么适用

Commons Clause 禁止「sell, sublicense, or redistribute the components
themselves — whether alone, in a bundle, or as a ported version」，但允许
「as part of an application, website, or product」的商业使用。

MTJ 落在**被允许**的那一格：这些档案是网站的一部分，随页面载入，
不单独贩售、不作为元件库散布、不列为产品卖点。

> **给未来的自己：** 如果哪天想把这些效果打包成一个「特效库」卖或送，
> 那就越线了。它们只能待在网站里。

---

## three.js

- **版本** 0.166.0 · **授权** MIT · https://threejs.org
- 打包在 `assets/vendor/three-postprocessing.js`，授权文字保留在档尾

## postprocessing

- **版本** 6.36.0 · **授权** Zlib · https://github.com/pmndrs/postprocessing
- 同上，打包在 `assets/vendor/three-postprocessing.js`

## 字体

- **Sora** · **JetBrains Mono** · **Noto Sans SC**
- **授权** SIL Open Font License 1.1
- 授权全文见 `assets/fonts/LICENSE.txt`，字体档自架于 `assets/fonts/files/`

---

## 自己写的部分

`quizfig.js` · `nav.js` · `comingsoon.js` 以及全部课程内容、图表与考题，
版权归 Make Trades Journey / XRs Trading Lab 所有。
