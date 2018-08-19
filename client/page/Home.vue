<template>
    <div>
        <img id="example1" :rel:animated_src="testGif" rel:auto_play="0" width="467"
             height="375"/>
        <button @click="pause">pause</button>
        <button @click="play">play</button>
        <button @click="show">show</button>
    </div>
</template>

<script>
import testGif from '../asset/img/test.gif';

export default {
  data() {
    return {
      testGif,
      gif: null,
    };
  },
  methods: {
    pause() {
      this.gif.pause();
    },
    play() {
      this.gif.play();
    },
    show(){
      console.log(this.gif);
      console.log(this.gif.get_current_frame());
      console.log(this.gif.get_length());
    }
  },
  created() {
  },
  mounted() {
    this.gif = new SuperGif({ gif: document.getElementById('example1') });
    this.gif.load();
  },
};
</script>
