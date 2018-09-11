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
                    <div class="upload-area">
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
                        <Card :class="{'center':mobileCenterAddItemOption}" class="add-item-option"
                              v-if="currentAddItemIndex !== null" :bordered="false">
                            <p slot="title">
                                <Icon type="ios-film-outline"></Icon>
                                字幕设置
                            </p>
                            <div>
                                <Form :label-width="40" inline>
                                    <FormItem label="内容">
                                        <Input v-model="addItem[currentAddItemIndex].text"
                                               style="width: 220px;"></Input>
                                    </FormItem>
                                    <FormItem label="字体">
                                        <Select v-model="addItem[currentAddItemIndex].fontFamily"
                                                style="width: 140px;margin-right:8px">
                                            <Option v-for="(item,key) in fontFamilyList" :value="key" :key="key">
                                                {{item}}
                                            </Option>
                                        </Select>
                                        <Checkbox v-model="addItem[currentAddItemIndex].isBold"><strong>B</strong>
                                        </Checkbox>
                                        <Checkbox v-model="addItem[currentAddItemIndex].isItalic"><i>I</i></Checkbox>
                                    </FormItem>
                                    <FormItem label="大小">
                                        <InputNumber v-model="addItem[currentAddItemIndex].fontSize"
                                                     :min="0" style="width: 80px;"></InputNumber>
                                    </FormItem>
                                    <FormItem label="角度">
                                        <InputNumber v-model="addItem[currentAddItemIndex].angle"
                                                     :min="0" :step="10" style="width: 80px;"></InputNumber>
                                    </FormItem>
                                    <FormItem label="颜色">
                                        <Input v-model="addItem[currentAddItemIndex].color"
                                               style="width: 150px;"></Input>
                                        <ColorPicker v-model="addItem[currentAddItemIndex].color" recommend alpha/>
                                    </FormItem>
                                </Form>
                            </div>
                            <div class="add-item-option-toggle"
                                 @click="mobileCenterAddItemOption = !mobileCenterAddItemOption">
                                <Icon :type="mobileCenterAddItemOption ? 'ios-arrow-back' : 'ios-arrow-forward'"
                                      size="16"/>
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
        <footer>
            <p>给喜欢的GIF加上字幕，请使用chrome、firefox，或极速模式下的360、QQ等浏览器</p>
            <p>如果您有BUG反馈、意见或更好的建议，请联系我：<strong>caandoll@aliyun.com</strong>，也可以
                <Poptip width="300" placement="right" v-model="feedbackPopTipShow">
                    <a>在线反馈</a>
                    <div slot="content">
                        <div>
                            <Input type="textarea" v-model="feedbackInput.content"
                                   :autosize="{minRows: 2,maxRows: 5}" placeholder="内容，请少于200字"></Input>
                        </div>
                        <div style="margin: 10px 0;">
                            <Input v-model="feedbackInput.email" placeholder="如果可以，请留下您的邮箱"></Input>
                        </div>
                        <Button @click="submitFeedback" long type="primary" :disabled="Boolean(feedbackInvalidMessage)"
                                :title="feedbackInvalidMessage" :loading="loading.feedback">提交
                        </Button>
                    </div>
                </Poptip>
            </p>
        </footer>
        <Modal
                v-model="generateModalShow"
                :mask-closable="false"
                @on-cancel="closeGenerateModal"
                :width="viewSize.width+50"
                title="生成成功">
            <div style="text-align: center;overflow-x: auto">
                <img :src="generateGif" :width="viewSize.width" :height="viewSize.height"/>
                <p style="margin-top: 10px;">注意：因浏览器权限原因，无法直接复制出去，请右键图片另存为保存至本地</p>
            </div>
            <div slot="footer">
                <Button @click="closeGenerateModal">关闭</Button>
            </div>
        </Modal>
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
        feedback: false,
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
      viewSize: {
        width: 0,
        height: 0,
      },
      fontFamilyList: {
        SimSun: '宋体',
        SimHei: '黑体',
        'Microsoft YaHei': '微软雅黑',
        'Microsoft JhengHei': '微软正黑体',
        KaiTi: '楷体',
        NSimSun: '新宋体',
        FangSong: '仿宋',
      },
      delay: null,
      generateModalShow: false,
      generateGif: null,
      feedbackPopTipShow: false,
      feedbackInput: {
        content: '',
        email: '',
      },
      mobileCenterAddItemOption: false,
    };
  },
  computed: {
    feedbackInvalidMessage() {
      if (!this.feedbackInput.content) {
        return '想跟我说什么呢';
      } else if (this.feedbackInput.content.length > 200) {
        return '太长啦消化不了啦，请少于200字喔';
      } else if (this.feedbackInput.email && !/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(this.feedbackInput.email)) {
        return '再检查一下邮箱格式呢';
      }
      return '';
    },
  },
  watch: {
    currentFrame(val) {
      if (this.gif) {
        this.gif.move_to(val);
        this.renderText();
      }
    },
    addItem: {
      handler() {
        if (this.gif) {
          this.renderText();
        }
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
      if (file.type !== 'image/gif') {
        this.$Message.warning('请上传 gif 图片');
        return false;
      }
      this.editReady = false;
      this.$Spin.show();
      const reader = new FileReader();
      reader.onload = event => {
        this.init(event.target.result);
      };
      reader.readAsText(file, 'x-user-defined');
      return false;
    },
    init(data) {
      const width = document.querySelector('.container').offsetWidth;
      this.gif = new SuperGif({
        container: this.$refs.gifBox,
        auto_play: 0,
        loop_mode: false,
        max_width: width,
        on_end: () => {
          this.playing = false;
        },
        on_play: () => {
          this.currentFrame = this.gif.get_current_frame();
        },
      });
      this.gif.load(data, delay => {
        this.delay = delay;
        this.subTextFabric = new fabric.Canvas('addItemCanvas');
        this.subTextFabric.on({
          'object:modified': e => {
            const target = e.target;
            const index = target.index;
            this.addItem[ index ].top = target.top;
            this.addItem[ index ].left = target.left;
          },
        });
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
        fontSize: this.viewSize.width / 15,
        fontFamily: 'Microsoft YaHei',
        isBold: false,
        isItalic: false,
        angle: 0,
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
      this.subTextFabric.clear();
      for (let i = 0; i < this.addItem.length; i++) {
        const item = this.addItem[ i ];
        if (item.frameRange[ 0 ] <= this.currentFrame && item.frameRange[ 1 ] >= this.currentFrame) {
          const Text = new fabric.Text(item.text, {
            top: item.top,
            left: item.left,
            fill: item.color,
            fontSize: item.fontSize,
            fontFamily: item.fontFamily,
            fontWeight: item.isBold ? 'bold' : 'normal',
            fontStyle: item.isItalic ? 'italic' : 'normal',
            angle: item.angle,
            hasControls: false,
            originY: 'center',
            originX: 'center',
            borderColor: '#000',
            index: i,
            /* cornerColor: '#2d8cf0',
            cornerSize: 8,
            transparentCorners: false,
            centeredScaling: true,*/
          });
          this.subTextFabric.add(Text);
        }
      }
    },
    generate() {
      this.$Spin.show();
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: this.viewSize.width,
        height: this.viewSize.height,
      });

      gif.on('finished', blob => {
        this.$Spin.hide();
        this.generateGif = URL.createObjectURL(blob);
        this.generateModalShow = true;
      });

      this.toBegin();

      const addFrame = () => {
        const width = this.viewSize.width;
        const height = this.viewSize.height;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.gif.get_canvas(), 0, 0, width, height);
        ctx.drawImage(this.subTextFabric.lowerCanvasEl, 0, 0, width, height);
        gif.addFrame(canvas, { delay: this.delay });
        this.currentFrame++;
        if (this.currentFrame < this.allFrame) {
          setTimeout(() => {
            addFrame();
          }, this.delay);
        } else {
          gif.render();
        }
      };
      addFrame();
    },
    closeGenerateModal() {
      this.generateModalShow = false;
      this.generateGif = null;
    },
    restart() {
      Object.assign(this.$data, this.$options.data());
    },
    submitFeedback() {
      this.loading.feedback = true;
      const captcha = new window.TencentCaptcha('2089125366', res => {
        if (res.ret === 0) {
          const param = {
            ...this.feedbackInput,
            ticket: res.ticket,
            randstr: res.randstr,
          };
          this.$axios.post('/feedback', param).then(res => {
            this.loading.feedback = false;
            const result = res.data;
            if (result.status === 'SUCCEED') {
              this.feedbackPopTipShow = false;
              this.feedbackInput = this.$options.data().feedbackInput;
              this.$Message.success({
                content: '发送成功，感谢您的反馈',
                duration: 5,
              });
            }
          }).catch(() => {
            this.loading.feedback = false;
          });
        } else {
          this.$Message.warning('验证失败，请重新再试');
          this.loading.feedback = false;
        }
      });
      captcha.show();
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
            margin: 0 auto;
            position: relative;
            .title {
                margin: 50px;
                text-align: center;
                font-size: 30px;
                background-image: linear-gradient(180deg, #2d8cf0, #45ddff);
                color: transparent;
                background-clip: text;
            }
            .upload {
                width: 500px;
                margin: 0 auto;
                .upload-area {
                    padding: 100px 0;
                }
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
                        .add-item-option-toggle {
                            display: none;
                        }
                    }
                }
            }
            .generate {
                width: 300px;
                margin: 40px auto 0;
            }
        }
        footer {
            width: 1250px;
            margin: 20px auto 30px;
            text-align: center;
        }
    }

    @media screen and (max-width: 1024px) {
        .pagehome {
            .container {
                width: 92vw;
                .upload {
                    width: 100%;
                    height: 30vh;
                    .upload-area {
                        padding: 10vh 0;
                    }
                }
                .operation {
                    width: 100%;
                    .timeline {
                        width: 85vw;
                        .add-item {
                            .add-item-row {
                                margin-bottom: 20px;
                                .action {
                                    right: 2px;
                                    top: -26px;
                                }
                            }
                        }
                        .add-item-option {
                            z-index: 6;
                            &.center {
                                left: 0;
                            }
                            .add-item-option-toggle {
                                border-bottom-right-radius: 8px;
                                border-top-right-radius: 8px;
                                border: solid 1px #e6e6e6;
                                border-left: 0;
                                width: 30px;
                                height: 30px;
                                line-height: 30px;
                                text-align: center;
                                position: absolute;
                                left: 300px;
                                top: 280px;
                                display: block;
                                background-color: #fff;
                            }
                        }
                    }
                }
            }
            footer {
                width: 90vw;
            }
        }
    }
</style>
