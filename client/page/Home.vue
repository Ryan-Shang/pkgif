<template>
    <div class="pagehome">
        <div class="container">
            <div class="title">
                P K G I F
            </div>
            <div class="upload" v-if="!editReady">
                <Upload
                        type="drag"
                        action=""
                        :before-upload="uploadGif">
                    <div style="padding: 20px 0">
                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                        <p>上传GIF，或将其拖拽至此处</p>
                    </div>
                </Upload>
            </div>
            <div class="view" v-show="editReady">
                <div ref="gifBox" style="display: inline-block"></div>
            </div>
            <div class="operation" v-if="editReady">
                <div class="control">
                    <Button icon="md-undo" @click="toBegin" title="重置（R）"></Button>
                    <Button icon="md-skip-backward" @click="prevOne" title="向前一帧（A）"></Button>
                    <Button :icon="playing ? 'md-pause' : 'md-play'" @click="playAndPause"
                            :title="(playing ? '暂停' : '播放')+'（Space）'"></Button>
                    <Button icon="md-skip-forward" @click="nextOne" title="向后一帧（A）"></Button>
                    <Button icon="md-skip-forward" @click="show"></Button>
                </div>
                <div class="timeline">
                    <div style="text-align: center;font-size:18px">{{currentFrame}} / {{allFrame}}</div>
                    <vue-slider
                            v-model="currentFrame"
                            :max="allFrame"
                            v-bind="timeLineSliderOption">
                    </vue-slider>
                    <div class="add-item">
                        <div v-for="(item,index) in addItem" class="add-item-row">
                            <div @click="selectAddItem(index)">
                                <vue-slider
                                        style="margin-top:10px"
                                        :disabled="currentAddItemIndex !== index"
                                        :key="index"
                                        v-model="item.frameRange"
                                        :max="allFrame"
                                        v-bind="addItemSliderOption">
                                </vue-slider>
                            </div>
                            <div class="action">
                                <a href="javascript:void(0)" @click="removeAddItem(index)">
                                    <Icon size="18" type="md-close"/>
                                </a>
                                <a style="margin-left: 8px;" href="javascript:void(0)" @click="copyAddItem(index)">
                                    <Icon size="18" type="md-copy"/>
                                </a>
                            </div>
                        </div>
                        <Button type="primary" icon="md-add" @click="pushAddItem">添加字幕</Button>
                    </div>
                    <Card class="add-item-option" v-if="currentAddItemIndex !== null" :bordered="false">
                        <p slot="title">
                            <Icon type="ios-film-outline"></Icon>
                            字幕设置
                        </p>
                        <div>
                            <Form :label-width="40">
                                <FormItem label="内容">
                                    <Input v-model="addItem[currentAddItemIndex].text"></Input>
                                </FormItem>
                                <FormItem label="颜色">
                                    <ColorPicker v-model="addItem[currentAddItemIndex].color" recommend alpha/>
                                </FormItem>
                            </Form>
                        </div>
                    </Card>
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
      loading: {
        upload: false,
      },
      canvas: null,
      editReady: false,
      gif: null,
      playing: false,
      currentFrame: 0,
      allFrame: 0,
      timeLineSliderOption: {
        speed: 0.1,
        tooltip: 'hover',
        'process-style': {
          'background-color': 'transparent'
        },
        // 'use-keyboard': true,
      },
      addItemSliderOption: {
        tooltip: 'hover',
        'disabled-style': {
          cursor: 'pointer',
        }
      },
      addItem: [],
      currentAddItemIndex: null,
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
      this.editReady = false;
      this.loading.upload = true;
      this.$Spin.show();
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
        loop_mode: false,
        on_end: () => {
          this.playing = false;
        },
        on_play: () => {
          this.currentFrame = this.gif.get_current_frame();
        },
      });
      this.gif.load(data, () => {
        this.loading.upload = false;
        this.$Spin.hide();
        this.editReady = true;
        this.canvas = this.gif.get_canvas();
        this.allFrame = this.gif.get_length() - 1;
        this.toBegin();
      });
    },
    pushAddItem() {
      const newAddItem = {
        frameRange: [ this.currentFrame, this.allFrame ],
        text: '',
        color: 'rgba(255,255,255,1)',
      };
      const length = this.addItem.push(newAddItem);
      this.currentAddItemIndex = length - 1;
    },
    selectAddItem(index) {
      this.currentAddItemIndex = index;
    },
    removeAddItem(index) {
      this.addItem.splice(index, 1);
      this.currentAddItemIndex = this.addItem.length ? index - 1 : null;
    },
    copyAddItem(index) {
      const newAddItem = JSON.parse(JSON.stringify(this.addItem[ index ]));
      const length = this.addItem.push(newAddItem);
      this.currentAddItemIndex = length - 1;
    }
  },
  created() {
    document.onkeydown = event => {
      if (this.editReady) {
        if (event.code === 'keyA' || event.keyCode === 65) {
          this.prevOne();
        } else if (event.code === 'keyD' || event.keyCode === 68) {
          this.nextOne();
        } else if (event.code === 'keyR' || event.keyCode === 82) {
          this.toBegin();
        } else if (event.code === 'Space' || event.keyCode === 32) {
          this.playAndPause();
        }
      }
    }
  },
  mounted() {
  },
};
</script>
<style lang="less">
    .pagehome {
        .container {
            width: 1250px;
            margin: 0 auto 30px;
            position: relative;
            .title {
                margin: 50px;
                text-align: center;
            }
            .upload {
                width: 500px;
                margin: 0 auto;
            }
            .view {
                margin-top: 5px;
                text-align: center;
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
                    width: 600px;
                    margin: 20px auto 0;
                    position: relative;
                    .add-item {
                        margin-top: 40px;
                        .add-item-row {
                            margin-bottom: 10px;
                            position: relative;
                            .action {
                                position: absolute;
                                right: -70px;
                                top: 0;
                            }

                        }
                    }
                    .add-item-option {
                        width: 300px;
                        position: absolute;
                        top: 0;
                        left: -320px;
                    }
                }
            }
        }
    }
</style>
