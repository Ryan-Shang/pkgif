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
            <div class="operation" v-show="gif">
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
            </div>

        </div>
    </div>
</template>

<script>
import SuperGif from '../helper/libgif';

export default {
  data() {
    return {
      gif: null,
      playing: false,
      allFrame: 0,
      currentFrame: 0,
    };
  },
  computed: {},
  methods: {
    toBegin() {
      this.gif.move_to(1);
    },
    prevOne() {
      this.gif.move_relative(-1);
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
    },
    show() {
      console.log(this.gif.get_playing());
      console.log(this.gif);
      console.log(this.gif.get_current_frame());
      console.log(this.gif.get_length());
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
      this.gif = new SuperGif({
        container: this.$refs.gifBox,
        auto_play: 0,
      });
      this.gif.load(data);
      this.playing = false;
      this.allFrame = this.gif.get_length();
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
            }
        }
    }
</style>
