<template>
    <div class="pagehome">
        <div class="container">
            <div class="title">
                P K G I F
            </div>
            <div class="upload">
                <Upload
                        paste
                        type="drag"
                        action=""
                        :before-upload="uploadGif">
                    <div style="padding: 20px 0">
                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                        <p>上传GIF，或将其拖拽至此处</p>
                    </div>
                </Upload>
            </div>
            <div class="operation">
                <div style="display: inline-block;">
                    <div ref="gifBox"></div>
                    <div class="control">
                        <Button icon="md-undo" @click="toBegin"></Button>
                        <Button icon="md-skip-backward" @click="prevOne"></Button>
                        <Button :icon="playing ? 'md-pause' : 'md-play'" @click="playAndPause"></Button>
                        <Button icon="md-skip-forward" @click="nextOne"></Button>
                        <Button icon="md-skip-forward" @click="show"></Button>
                    </div>
                </div>

                <div class="timeline">
                    <div style="text-align: center;font-size:18px">{{currentFrame}} / {{allFrame}}</div>
                    <vue-slider ref="slider" v-model="currentFrame" v-bind="options" :max="allFrame"></vue-slider>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
import SuperGif from '../helper/libgif';
import vueSlider from 'vue-slider-component';

export default {
  components: {
    vueSlider,
  },
  data() {
    return {
      editReady: false,
      gif: null,
      playing: false,
      currentFrame: 0,
      allFrame: 0,
      timeLines: [],
      options: {
        eventType: 'auto',
        width: 'auto',
        height: 6,
        dotSize: 16,
        dotHeight: null,
        dotWidth: null,
        min: 0,
        interval: 1,
        show: true,
        speed: 0.1,
        disabled: false,
        piecewise: false,
        piecewiseLabel: false,
        tooltip: true,
        tooltipDir: 'top',
        reverse: false,
        data: null,
        clickable: true,
        realTime: false,
        lazy: false,
        formatter: null,
        bgStyle: null,
        sliderStyle: null,
        processStyle: null,
        piecewiseActiveStyle: null,
        piecewiseStyle: null,
        tooltipStyle: null,
        labelStyle: null,
        labelActiveStyle: null,
      },
    };
  },
  watch: {
    currentFrame(val) {
      this.gif.move_to(val);
    },
  },
  methods: {
    toBegin() {
      this.gif.move_to(0);
      this.gif.pause();
      this.playing = false;
      this.currentFrame = this.gif.get_current_frame();
    },
    prevOne() {
      this.gif.move_relative(-1);
      this.currentFrame = this.gif.get_current_frame();
    },
    playAndPause() {
      if (this.playing) {
        this.gif.pause();
        this.playing = false;
      } else {
        this.gif.play();
        this.playing = true;
      }
    },
    nextOne() {
      this.gif.move_relative(1);
      this.currentFrame = this.gif.get_current_frame();
    },
    show() {
      console.log(this.gif.get_playing());
      console.log(this.gif);
      console.log(this.gif.get_current_frame());
      console.log(this.gif.get_length());
      console.log(this.gif.get_canvas_scale());
    },
    uploadGif(file) {
      const reader = new FileReader();
      reader.onload = event => {
        this.init(event.target.result);
      };
      reader.readAsText(file, 'x-user-defined');
      return false;
    },
    init(data) {
      this.editReady = false;
      this.gif = new SuperGif({
        container: this.$refs.gifBox,
        auto_play: 0,
        loop_mode: false,
        on_end: () => {
          this.playing = false;
        },
        on_play: () => {
          this.currentFrame = this.gif.get_current_frame();
        },
      });
      this.gif.load(data, () => {
        this.editReady = true;
        this.allFrame = this.gif.get_length() - 1;
        this.options.max = this.allFrame;
        this.toBegin();
      });
    },
  },
  created() {
  },
  mounted() {
  },
};
</script>
<style lang="less">
    .pagehome {
        .container {
            width: 1250px;
            margin: 0 auto;
            .title {
                margin: 50px;
                text-align: center;
            }
            .upload {
                width: 500px;
                margin: 0 auto;
            }
            .operation {
                width: 800px;
                margin: 20px auto 0;
                text-align: center;
                .jsgif {
                    max-width: 800px;
                }
                .control {
                    margin: 10px 0;
                }
                .timeline {
                    width: 500px;
                    margin: 40px auto 0;
                }
            }
        }
    }
</style>
