<template>
  <div class="measurements">
    <p>
      <router-link :to="backPage">Back</router-link>
      <span v-if="!isComplete">
        |
        <router-link :to="nextPage">Next</router-link>
      </span>
    </p>

    <h3 class="title">
      Drafting: {{pattern.title}}
    </h3>

    <p v-if="!stepId && !isComplete">
    {{pattern.description}}
    </p>

    <div v-if="isComplete">
      <p>Congratulations! You've completed the instructions!* The next steps will be sewing it together and fitting.</p>

      <p><i>* The pattern is currently a few steps from complete, check back later for the full draft.</i></p>
    </div>

    <div v-if="stepId">
      <h4 class="title">
        Step {{stepId}}: {{step.title}}
      </h4>
      <p>{{step.instructions}}</p>

      <div v-if="!step.hideActionInstructions">
        <div v-for="(action, index) in step.actions" :key="index">
          <div v-if="!action.hideInstructions">
            {{action.type}} {{action.name}}
            <ul>
              <li v-if="action.instructions">
                {{action.instructions}}
              </li>
              <li v-else-if="action.generatedInstructions">
                {{action.generatedInstructions}}
              </li>
              <li v-else style="color: #963">
                No auto-genterated instructions for this function yet.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <p v-if="!isComplete">
      <router-link :to="nextPage">Next Step</router-link>
    </p>
  </div>
</template>


<script>
import { mapGetters, mapMutations } from 'vuex';

import {create} from '@/shared/moulage/patterns/bodice.js';

export default {
  name: 'Draft',

  props: ['complete'],

  components: {
  },

  computed: {
    ...mapGetters('draft', {
      getPattern: 'pattern',
    }),
    backPage() {
      if (!this.stepId && !this.isComplete) {
        return '/';
      }
      if (this.stepId === 1) {
        return `/draft/${this.draftId}`;
      }
      if (this.isComplete) {
        return `/draft/${this.draftId}/step/${this.pattern.steps.length}`;
      }
      return `/draft/${this.draftId}/step/${this.stepId-1}`;
    },
    draftId() {
      return this.$route.params.draftId;
    },
    isComplete() {
      return this.$route.matched[this.$route.matched.length - 1].props.default.complete;
    },
    nextPage() {
      if (!this.stepId) {
        return `/draft/${this.draftId}/step/1`;
      }
      if (this.stepId === this.pattern.steps.length) {
        return `/draft/${this.draftId}/complete`;
      }
      return `/draft/${this.draftId}/step/${this.stepId+1}`;
    },
    pattern() {
      return this.getPattern(this.draftId);
    },
    step() {
      return this.pattern.steps[this.stepId-1];
    },
    stepId() {
      return Number(this.$route.params.stepId);
    },
  },

  methods: {
    ...mapMutations('draft', {
      mutateAddPattern: 'ADD_PATTERN',
      mutatePatternDisplay: 'PATTERN_DISPLAY',
      mutateSetDisplayPattern: 'SET_DISPLAY_PATTERN',
    }),
    setDisplayPattern() {
      this.mutateSetDisplayPattern({patternName: this.draftId});
      if (this.pattern) {
        if (!this.stepId) {
          this.mutatePatternDisplay({patternName: this.draftId, displayPieces: this.pattern.patternPieces});
        } else {
          this.mutatePatternDisplay({patternName: this.draftId, displayPieces: this.pattern.sliceDisplaySteps(this.stepId)});
        }
      }
    },
  },

  created() {
    if (!this.pattern) {
      this.mutateAddPattern(create());
    }
    this.setDisplayPattern();
  },

  watch: {
    $route() {
      this.setDisplayPattern();
    },
  },
}


</script>

<style lang="scss">
</style>