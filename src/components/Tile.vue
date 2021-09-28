<template>
  <div class="tile">
    <slot></slot>
  </div>
</template>

<script type="text/javascript">

export default {
  name: 'TilesContainer',
}
</script>

<style lang="scss">
div.tile {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 400px;
  background-color: #FFF;
  border: 1px #27F solid;
  box-shadow: 0px 0px 10px 1px rgba(80, 80, 80, 0.5);
  padding: 5px;
  overflow: auto;
}
</style>
