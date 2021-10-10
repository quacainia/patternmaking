<template>
  <div>
    <div class="dots-container" ref="dotsContainer">
      <div class="dots" :class="{hide: !getDisplayPattern}">
        <div
          v-for="(step, index) in steps"
          :key="getDisplayPattern+index"
          class="dot-container"
          :class="{selected: isSelected(index)}"
          @click="clickLink(step, index)">
          <div class="dot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import { mapGetters } from 'vuex';

export default {
  name: 'Dots',
  computed: {
    ...mapGetters('draft', {
      getDisplayPattern: 'displayPattern',
    }),
    steps() {
      if (!this.getDisplayPattern) {
        return [];
      }
      let steps = this.getDisplayPattern.steps.slice();
      steps.unshift({step: 'intro'});
      steps.push({step: 'complete'});
      return steps;
    },
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
    clickLink(step, index) {
      let displayPatternName = (this.getDisplayPattern) ? this.getDisplayPattern.name : null;
      let draftPath = `/draft/${displayPatternName}`;

      if (step.step === 'intro') {
        this.$router.push(draftPath);
        return;
      }

      if (step.step === 'complete') {
        this.$router.push(`${draftPath}/complete`);
        return;
      }

      this.$router.push(`${draftPath}/step/${index}`);
    },
    isSelected(index) {
      if (!this.stepId && !this.isComplete && index === 0) {
        return true;
      }
      if (this.isComplete && index === this.steps.length-1) {
        return true;
      }
      return this.stepId === index;
    },
    resize() {
      this.$refs.dotsContainer.style.width = (window.innerWidth - 60) + 'px';
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
div.dots-container {
  background-color: #FFF;
  position:absolute;
  bottom: 10px;
  left: 30px;
  height: 17px;
  width: 10px;
  padding: 0px 3px;
  border-radius: 10px;
  border: 1px solid #609dff;
  box-shadow: 0px 0px 10px 1px rgba(80, 80, 80, 0.5);
  div.dots {
    background-color: #609dff;
    width: 100%;
    height: 3px;
    overflow: visible;
    display: flex;
    justify-content: space-between;
    border-radius: 5px;
    padding: 0px 2px;
    margin-top: 6px;
    div.dot-container {
      width: 11px;
      height: 11px;
      margin: -4px 0px 4px;
      div.dot {
        width: 5px;
        height: 5px;
        border: 1px solid #609dff;
        border-radius: 5px;
        background-color: #b9d4ff;
        margin: 3px 3px 3px;
        cursor: pointer;
        transition: width 100ms, height 100ms, margin 100ms;
      }
      &:first-child > div.dot, &:last-child > div.dot {
        background-color: #b9d4ff;
        width: 9px;
        height: 9px;
        margin: 1px 1px 1px;
      }
      &:hover > div.dot {
        width: 11px;
        height: 11px;
        margin: 0px 0px;
      }
      &.selected > div.dot {
        background-color: #27F;
        border-color: #27F;
        width: 11px;
        height: 11px;
        margin: 0px 0px;
        cursor: default;
      }
    }
    &.hide {
      display: none;
    }
  }
}
</style>
