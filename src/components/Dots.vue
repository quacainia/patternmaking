<template>
  <div>
    <div class="dots" ref="dots">
      <div v-for="(_, index) in dots" :key="getDisplayPattern+index">
        <router-link :to="stepLink(index)">
          <div
            class="dot"
            :class="{selected: isSelected(index)}">
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import { mapGetters } from 'vuex';

export default {
  name: 'Dots',
  data: function() {
    return {
      dots: new Array(77),
    }
  },
  computed: {
    ...mapGetters('draft', {
      getDisplayPattern: 'displayPattern',
    }),
    isComplete() {
      let lastMatch = this.$route.matched[this.$route.matched.length - 1];
      return lastMatch && lastMatch.props.default.complete;
    },
    stepId() {
      return Number(this.$route.params.stepId);
    },
  },

  created() {
    window.addEventListener("resize", this.resize);
  },

  methods: {
    isSelected(index) {
      if (!this.stepId && !this.isComplete && index === 0) {
        return true;
      }
      if (this.isComplete && index === this.dots.length-1) {
        return true;
      }
      return this.stepId === index;
    },
    resize() {
      console.log(this.$refs.dots.style.width);
      this.$refs.dots.style.width = (window.innerWidth - 60) + 'px';
    },
    stepLink(index) {
      let displayPattern = (this.getDisplayPattern) ? this.getDisplayPattern.name : null;
      let draftPath = `/draft/${displayPattern}`;

      if (index === 0) {
        return draftPath;
      }
      if (index === this.dots.length-1) {
        return `${draftPath}/complete`;
      }
      return `${draftPath}/step/${index}`
    },
  },

  mounted() {
    this.resize();
  },

  unmounted() {
    window.removeEventListener("resize", this.resize);
  },
}
</script>

<style lang="scss">
div.dots {
  position:absolute;
  bottom: 10px;
  left: 30px;
  background-color: #666;
  height: 3px;
  overflow: visible;
  display: flex;
  justify-content: space-between;
  border-radius: 5px;
  padding: 0px 2px;
  a {
    display: block;
    margin: 0px;
    padding: 0px;
    line-height: 0px;
    cursor: pointer;
    div.dot {
      width: 9px;
      height: 9px;
      border: 1px solid #666;
      border-radius: 5px;
      background-color: #fff;
      display: inline-block;
      margin: -3px 1px 0px;
      &.selected {
        background-color: #27F;
        border-color: #27F;
        width: 11px;
        height: 11px;
        margin: -4px 0px 0px;
      }
    }
  }
}
</style>
