<template>
  <div class="notice">
    This page is not yet designed for small screens or mobile. Please enlarge the window or try on another device.
  </div>
</template>

<style lang="scss">
div.notice {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 2000;
  background-color: #EE0;
  font-size: 30px;
  padding: 20px;
  @media screen and (min-width: 1100px) {
    display: none;
  }
}
</style>

