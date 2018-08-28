<template>
    <div class="pagehome">
        <div class="container">
            <div class="title">
                P K G I F
            </div>
            <div class="upload" v-show="!editReady">
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
            <div v-show="editReady">
                <div class="view">
                    <div ref="gifBox" style="display: inline-block"></div>
                </div>
                <div class="operation">
                    <div class="control">
                        <Button icon="md-undo" @click="toBegin" title="重置（R）"></Button>
                        <Button icon="md-skip-backward" @click="prevOne" title="向前一帧（A）"></Button>
                        <Button :icon="playing ? 'md-pause' : 'md-play'" @click="playAndPause"
                                :title="(playing ? '暂停' : '播放')+'（Space）'"></Button>
                        <Button icon="md-skip-forward" @click="nextOne" title="向后一帧（D）"></Button>
                    </div>
                    <div class="timeline">
                        <div style="text-align: center;font-size:18px">{{currentFrame}} / {{allFrame}}</div>
                        <vue-slider class="timeline-slider"
                                    v-model="currentFrame"
                                    :max="allFrame"
                                    v-bind="timeLineSliderOption">
                        </vue-slider>
                        <div class="add-item">
                            <div v-for="(item,index) in addItem" class="add-item-row" :key="index">
                                <div @click="selectAddItem(index)">
                                    <vue-slider
                                            style="margin-top:10px"
                                            :disabled="currentAddItemIndex !== index"
                                            :key="index"
                                            v-model="item.frameRange"
                                            :max="allFrame"
                                            v-bind="addItemSliderOption">
                                    </vue-slider>
                                    <span>{{item.text}}</span>
                                </div>
                                <div class="action">
                                    <a href="javascript:void(0)" @click="removeAddItem(index)">
                                        <Icon size="18" type="md-close" title="删除"/>
                                    </a>
                                    <a style="margin-left: 8px;" href="javascript:void(0)" @click="copyAddItem(index)">
                                        <Icon size="18" type="md-copy" title="拷贝"/>
                                    </a>
                                </div>
                            </div>
                            <Button icon="md-add" @click="pushAddItem">添加字幕</Button>
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
                <div class="generate">
                    <Button type="primary" style="width:200px" @click="generate">生成GIF</Button>
                    <Poptip
                            confirm
                            title="放弃该次编辑吗?"
                            @on-ok="restart">
                        <Button style="margin-left: 10px;">重新上传</Button>
                    </Poptip>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import vueSlider from 'vue-slider-component';

const fabric = require('fabric').fabric;
import SuperGif from '../helper/libgif';
import GIF from 'gif.js.optimized';

export default {
  components: {
    vueSlider,
  },
  data() {
    return {
      loading: {
        upload: false,
      },
      editReady: false,
      gif: null,
      playing: false,
      currentFrame: 0,
      allFrame: 0,
      timeLineSliderOption: {
        speed: 0.1,
        tooltip: 'hover',
        'process-style': {
          'background-color': 'transparent',
        },
        // 'use-keyboard': true,
      },
      addItemSliderOption: {
        tooltip: 'hover',
        'disabled-style': {
          cursor: 'pointer',
        },
      },
      addItem: [],
      currentAddItemIndex: null,
      subTextFabric: null,
      viewSize: null,
    };
  },
  watch: {
    currentFrame(val) {
      this.gif.move_to(val);
      this.renderText();
    },
    addItem: {
      handler() {
        this.renderText();
      },
      deep: true,
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
        max_width: 1250,
        on_end: () => {
          this.playing = false;
        },
        on_play: () => {
          this.currentFrame = this.gif.get_current_frame();
        },
      });
      this.gif.load(data, () => {
        this.subTextFabric = new fabric.Canvas('addItemCanvas');
        this.loading.upload = false;
        this.$Spin.hide();
        this.editReady = true;
        this.allFrame = this.gif.get_length() - 1;
        this.viewSize = {
          width: this.gif.get_canvas().width,
          height: this.gif.get_canvas().height,
        };
        this.toBegin();
      });
    },
    pushAddItem() {
      const defaltColor = 'rgba(255,255,255,1)';
      const newAddItem = {
        frameRange: [ this.currentFrame, this.allFrame ],
        text: '输入文字',
        color: defaltColor,
        top: this.viewSize.height * 0.8,
        left: this.viewSize.width / 2,
        fontSize: this.viewSize.width * this.viewSize.height / 1500,
        rotate: 0,
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
    },
    renderText() {
      if (this.subTextFabric) {
        this.subTextFabric.clear();
      }
      for (const item of this.addItem) {
        if (item.frameRange[ 0 ] <= this.currentFrame && item.frameRange[ 1 ] >= this.currentFrame) {
          const Text = new fabric.Text(item.text, {
            top: item.top,
            left: item.left,
            fill: item.color,
            fontSize: item.fontSize,
            fontFamily: '微软雅黑',
            fontWeight: 'normal',
            fontStyle: 'normal',
            borderColor: '#000',
            cornerColor: '#2d8cf0',
            cornerSize: 8,
            transparentCorners: false,
            originY: 'center',
            originX: 'center',
            centeredScaling: true,
          });


          Text.onSelect(a => {
            console.log(a);
          })
          this.subTextFabric.add(Text);
        }
      }
    },
    generate() {
      const gif = new GIF({
        workers: 2,
        quality: 10,
      });

      this.toBegin();
      while (this.currentFrame < this.allFrame) {
        const textCanvas = this.subTextFabric.lowerCanvasEl;
        const gifCanvas = this.gif.get_canvas();
        const gifCtxCopy = gifCanvas.cloneNode(true).getContext('2d');
        gifCtxCopy.drawImage(textCanvas, 0, 0, this.viewSize.width, this.viewSize.width);
        gif.addFrame(textCanvas, { delay: 200 });
        this.currentFrame++;
      }


      gif.on('finished', function(blob) {
        const reader = new FileReader();
        reader.onload = event => {
          const a = document.createElement('a');
          a.download = 'gif.gif';
          a.href = event.target.result;
          a.click();
        };
        reader.readAsDataURL(blob);
      });

      gif.render();
    },
    restart() {
      Object.assign(this.$data, this.$options.data());
    },
  },
  created() {
    document.onkeydown = event => {
      if (this.editReady && document.activeElement.tagName !== 'INPUT') {
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
    };
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
                .jsgif {
                    position: relative;
                    canvas {
                        position: absolute;
                        top: 0;
                        left: 0;
                    }
                }
            }
            .operation {
                width: 800px;
                margin: 20px auto 0;
                text-align: center;
                .control {
                    margin: 10px 0;
                }
                .timeline {
                    width: 600px;
                    margin: 20px auto 0;
                    position: relative;
                    .timeline-slider {
                        /*.vue-slider-dot {
                            &::after {
                                border-right: solid 1px #000;
                                position: relative;
                                left: -8px;
                                top: 16px;
                                display: block;
                                height: 100%;
                                content: "";
                            }
                        }*/
                    }
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
            .generate {
                width: 300px;
                margin: 40px auto 0;
            }
        }
    }
</style>
