<template>
    <div class="home">
        <no-key v-if="!isSetKeys"></no-key>
    </div>
</template>
<script>
import { mapGetters } from 'vuex';
import NoKey from './NoKey';
export default {
    components: {
        NoKey
    },
    computed: {
        ...mapGetters([
            'isSetKeys'
        ])
    }
}
</script>
<style>
.home {
    width: 100%;
    height: calc(100% - 64px);
    overflow-x: hidden;
    overflow-y: auto;
}
</style>