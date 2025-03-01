<template>
    <div class="pagehome">
        <div class="container">
            <div class="title">
                <img
                    src="/img/logo-strip-web.png"
                    width="200"
                >
            </div>
            <div
                v-show="!editReady"
                class="upload"
            >
                <Upload
                    type="drag"
                    action=""
                    accept="image/gif,video/mp4"
                    :before-upload="uploadGif"
                >
                    <div class="upload-area">
                        <Icon
                            type="ios-cloud-upload"
                            size="60"
                            style="color: #3399ff"
                        />
                        <p style="font-size: 14px;">
                            😄玩转GIF，为任意GIF动图添加字幕👆（支持<strong>GIF、MP4</strong>格式）
                        </p>
                        <p>
                            GIF宽度自动限制{{ globalOptions.GIF_MAX_WIDTH }}px
                        </p>
                        <p>
                            MP4大小不超过{{ globalOptions.VIDEO_TO_GIF_MAX_MB }}M，宽度自动限制{{ globalOptions.VIDEO_TO_GIF_MAX_WIDTH }}px
                        </p>
                    </div>
                </Upload>
            </div>
            <div v-show="editReady">
                <div class="view">
                    <div
                        ref="gifBox"
                        style="display: inline-block"
                    />
                </div>
                <div class="operation">
                    <div class="control">
                        <Button
                            icon="md-skip-backward"
                            title="重置（R）"
                            @click="toBegin"
                        />
                        <Button
                            style="margin-left: 5px"
                            icon="ios-arrow-back"
                            title="向前一帧（A）"
                            @click="prevOne"
                        />
                        <Button
                            style="margin-left: 5px"
                            :icon="playing ? 'md-pause' : 'md-play'"
                            :title="(playing ? '暂停' : '播放')+'（Space）'"
                            @click="playAndPause"
                        />
                        <Button
                            style="margin-left: 5px"
                            icon="ios-arrow-forward"
                            title="向后一帧（D）"
                            @click="nextOne"
                        />
                        <Button
                            style="margin-left: 5px"
                            icon="md-repeat"
                            title="反转"
                            @click="reverse"
                        />
                        <!-- <Button icon="md-undo" @click="undo" title="撤销"
                                :disabled="currentBackupRecordIndex === 0"></Button>
                        <Button icon="md-redo" @click="redo" title="取消撤销"
                                :disabled="currentBackupRecordIndex >= AddItemBackupRecord.length -1"></Button>-->
                    </div>
                    <div class="timeline">
                        <div style="text-align: center;font-size:18px">
                            {{ currentFrame }} / {{ allFrame }}
                        </div>
                        <vue-slider
                            v-model="currentFrame"
                            class="timeline-slider"
                            :max="allFrame"
                            v-bind="timeLineSliderOption"
                        />
                        <div class="add-item">
                            <draggable
                                v-model="addItem"
                                :options="{handle:'.drag-btn'}"
                                @end="dragEnd"
                            >
                                <div
                                    v-for="(item,index) in addItem"
                                    :key="index"
                                    class="add-item-row"
                                >
                                    <div @click="selectAddItem(index)">
                                        <vue-slider
                                            :key="index"
                                            style="margin-top:10px"
                                            :disabled="currentAddItemIndex !== index"
                                            :value="[item.frameRangeStart,item.frameRangeEnd]"
                                            :max="allFrame"
                                            v-bind="addItemSliderOption"
                                            @callback="changeSlider"
                                        />
                                        <p>
                                            <Icon
                                                :type="item.type === 'text' ? 'ios-text-outline' : 'md-square'"
                                                size="16"
                                            />
                                            <span>{{ item.text }}</span>
                                        </p>
                                    </div>
                                    <div class="action">
                                        <a class="drag-btn">
                                            <Icon
                                                size="18"
                                                type="md-move"
                                                title="移动图层顺序"
                                            />
                                        </a>
                                        <a
                                            style="margin-left: 8px;"
                                            href="javascript:void(0)"
                                            @click="removeAddItem(index)"
                                        >
                                            <Icon
                                                size="18"
                                                type="md-close"
                                                title="删除"
                                            />
                                        </a>
                                        <a
                                            style="margin-left: 8px;"
                                            href="javascript:void(0)"
                                            @click="copyAddItem(index)"
                                        >
                                            <Icon
                                                size="18"
                                                type="md-copy"
                                                title="拷贝"
                                            />
                                        </a>
                                    </div>
                                </div>
                            </draggable>
                            <Button
                                icon="ios-text-outline"
                                @click="pushAddItemText"
                            >
                                添加字幕
                            </Button>
                            <Button
                                icon="md-square"
                                style="margin-left: 5px"
                                @click="pushAddItemBlock"
                            >
                                添加色块
                            </Button>
                        </div>
                        <Card
                            v-if="currentAddItemIndex !== null"
                            :class="{'center':mobileCenterAddItemOption}"
                            class="add-item-option"
                            :bordered="false"
                        >
                            <p slot="title">
                                <Icon type="md-settings" />
                                {{ addItemOptionModalTitle }}
                            </p>
                            <div>
                                <Form
                                    :label-width="40"
                                    inline
                                >
                                    <template v-if="addItem[currentAddItemIndex].type === 'text'">
                                        <FormItem label="内容">
                                            <Input
                                                type="textarea"
                                                v-model="addItem[currentAddItemIndex].text"
                                                style="width: 210px;"
                                            />
                                        </FormItem>
                                        <FormItem label="字体">
                                            <Select
                                                v-model="addItem[currentAddItemIndex].fontFamily"
                                                style="width: 130px;margin-right:10px"
                                            >
                                                <Option
                                                    v-for="(item,key) in fontFamilyList"
                                                    :key="key"
                                                    :value="key"
                                                >
                                                    {{ item }}
                                                </Option>
                                            </Select>
                                            <Checkbox v-model="addItem[currentAddItemIndex].isBold">
                                                <strong> B</strong>
                                            </Checkbox>
                                            <Checkbox v-model="addItem[currentAddItemIndex].isItalic">
                                                <i> I</i>
                                            </Checkbox>
                                        </FormItem>
                                        <FormItem label="大小">
                                            <InputNumber
                                                v-model="addItem[currentAddItemIndex].fontSize"
                                                :min="0"
                                                style="width: 80px;"
                                            />
                                        </FormItem>
                                    </template>
                                    <FormItem label="角度">
                                        <InputNumber
                                            v-model="addItem[currentAddItemIndex].angle"
                                            :min="0"
                                            :step="10"
                                            style="width: 80px;"
                                        />
                                    </FormItem>
                                    <FormItem label="颜色">
                                        <ColorPicker
                                            v-model="addItem[currentAddItemIndex].color"
                                            recommend
                                            alpha
                                        />
                                    </FormItem>
                                </Form>
                            </div>
                            <div
                                class="add-item-option-toggle"
                                @click="mobileCenterAddItemOption = !mobileCenterAddItemOption"
                            >
                                <Icon
                                    :type="mobileCenterAddItemOption ? 'ios-arrow-back' : 'ios-arrow-forward'"
                                    size="16"
                                />
                            </div>
                        </Card>
                    </div>
                </div>
                <div class="generate">
                    <Button
                        type="primary"
                        style="width:200px"
                        @click="generate"
                    >
                        生成GIF
                    </Button>
                    <Poptip
                        confirm
                        title="放弃该次编辑吗?"
                        @on-ok="restart"
                    >
                        <Button style="margin-left: 10px;">
                            重新上传
                        </Button>
                    </Poptip>
                </div>
            </div>
        </div>
        <div
            v-show="!editReady"
            class="demo"
        >
            <div class="demo-item">
                <img :src="wsyw">
                <div class="transform">
                    <Button
                        type="primary"
                        shape="circle"
                        @click="tryDemoWsyw"
                    >
                        <span>点我试试</span>
                        <Icon
                            size="16"
                            type="md-arrow-round-forward"
                            style="position:relative;top: -1px;"
                        />
                    </Button>
                </div>
                <img :src="wsywPkgif">
            </div>
        </div>
        <footer>
            <p style="font-size: 14px;">
                请使用chrome、firefox，safari、edge或极速模式下的360、QQ等浏览器
            </p>
            <p style="margin-top: 20px;">
                <span>pkgif v{{ packageJsonVersion }}</span>
                <span style="margin-left: 10px;"> 原作者： <a href="https://github.com/CaanDoll" target="_">Caandoll</a> </span>
            </p>
        </footer>
        <Modal
            v-model="videoToGifshow"
            :mask-closable="false"
            :width="videoToGifInfo.videoWidth + 100"
            title="选择时间区间生成GIF素材"
            @on-cancel="closeVideoToGifModal"
        >
            <div
                ref="videoToGifBox"
                style="text-align: center"
            >
                <video
                    ref="videoToGif"
                    :width="scaleVideoSize.videoWidth"
                    :src="videoToGifSrc"
                    controls="controls"
                />
                <div class="videoToGif-slider">
                    <vue-slider
                        v-model="videoToGifRange"
                        :max="videoToGifInfo.duration"
                        v-bind="videoToGifInfoOption"
                    />
                </div>
                <div>
                    PS：视频生成的素材会比较大，可先进行一定缩放
                    <InputNumber
                        v-model="videoToGifInfo.scale"
                        style="width: 70px;"
                        :max="100"
                        :min="1"
                        :step="1"
                        :formatter="value => `${value}%`"
                        :parser="value => value.replace('%', '')"
                    />
                </div>
            </div>
            <div slot="footer">
                <Button @click="closeVideoToGifModal">
                    取消
                </Button>
                <Button
                    type="primary"
                    :disabled="videoToGifRange[ 1 ] === videoToGifRange[ 0 ] || !videoToGifInfo.scale"
                    @click="confirmVideoToGif"
                >
                    确认
                </Button>
            </div>
        </Modal>
        <Modal
            v-model="generateModalShow"
            :mask-closable="false"
            :width="viewSize.width + 50 > 400 ? viewSize.width + 50 : 400"
            title="生成成功"
            @on-cancel="closeGenerateModal"
        >
            <div style="text-align: center;overflow-x: auto">
                <img
                    :src="generateGif"
                    :width="viewSize.width"
                    :height="viewSize.height"
                >
                <p style="margin-top: 10px;">
                    由于权限问题，大部分浏览器无法直接<strong>复制</strong>出去
                </p><p style="margin-top: 2px;">
                    请 <strong>右键图片另存为</strong> 或
                    <a
                        :href="generateGif"
                        download="pkgif.net.gif"
                    >直接下载</a>
                </p>
            </div>
            <div slot="footer">
                <Button @click="closeGenerateModal">
                    关闭
                </Button>
            </div>
        </Modal>
    </div>
</template>

<script>
import vueSlider from 'vue-slider-component';
import draggable from 'vuedraggable';
import GIF from 'gif.js.optimized';
import SuperGif from '@utils/libgif';
import wsywData from '@assets/wsyw.json';
import pkg from '../../package';

const fabric = require('fabric').fabric;

export default {
  components: {
    vueSlider,
    draggable,
  },
  data() {
    return {
      wsyw: '/img/demo/wsyw.gif',
      wsywPkgif: '/img/demo/wsyw-pkgif.gif',
      packageJsonVersion: pkg.version,
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
      },
      addItemSliderOption: {
        tooltip: 'hover',
        'disabled-style': {
          cursor: 'pointer',
        },
      },
      videoToGifInfoOption: {
        interval: 0.1,
        tooltip: 'always',
      },
      addItem: [],
      /* AddItemBackupRecord: [],
      currentBackupRecordIndex: 0,*/
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
      mobileCenterAddItemOption: false,
      videoToGifshow: false,
      videoToGifSrc: null,
      videoToGifRange: [ 0, 0 ],
      videoToGifInfo: {
        duration: 0,
        videoWidth: 0,
        videoHeight: 0,
        scale: 0,
      },
      globalOptions: {
        VIDEO_TO_GIF_MAX_MB: 20, // video转gif文件最大mb
        VIDEO_TO_GIF_MAX_WIDTH: 400, // video转gif最大宽度
        VIDEO_TO_GIF_DELAY: 50, // video转gif帧之间的ms数
        GIF_MAX_WIDTH: 1250, // 上传gif最大宽度
      },
    };
  },
  computed: {
    addItemOptionModalTitle() {
      const map = {
        text: '字幕设置',
        block: '色块设置',
      };
      return map[ this.addItem[ this.currentAddItemIndex ].type ];
    },
    scaleVideoSize() {
      const videoToGifInfo = this.videoToGifInfo;
      return {
        videoWidth: videoToGifInfo.videoWidth * videoToGifInfo.scale / 100,
        videoHeight: videoToGifInfo.videoHeight * videoToGifInfo.scale / 100,
      };
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
          // this.backupAddItem();
        }
      },
      deep: true,
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
    reverse() {
      this.gif.reverse();
    },
    /* undo() {
      this.addItem = JSON.parse(JSON.stringify(this.AddItemBackupRecord[ this.currentBackupRecordIndex - 1 ]));
      this.$forceUpdate();
    },
    redo() {
      this.addItem = JSON.parse(JSON.stringify(this.AddItemBackupRecord[ this.currentBackupRecordIndex + 1 ]));
      this.$forceUpdate();
    },*/
    uploadGif(file) {
      if (file.type === 'image/gif') {
        this.$Spin.show();
        const reader = new FileReader();
        reader.onload = event => {
          this.init(event.target.result);
        };
        reader.readAsText(file, 'x-user-defined');
      } else if (file.type === 'video/mp4') {
        if (file.size <= this.globalOptions.VIDEO_TO_GIF_MAX_MB * 1024 * 1024) {
          this.$Spin.show();
          const reader = new FileReader();
          reader.onload = event => {
            const videoToGif = this.$refs.videoToGif;
            this.videoToGifSrc = event.target.result;
            videoToGif.onloadeddata = () => {
              this.$Spin.hide();
              // 设置宽高
              const maxWidth = this.globalOptions.VIDEO_TO_GIF_MAX_WIDTH;
              const videoWidth = videoToGif.videoWidth <= maxWidth ? videoToGif.videoWidth : maxWidth;
              const videoHeight = videoToGif.videoHeight / videoToGif.videoWidth * maxWidth;
              this.videoToGifInfo = {
                duration: videoToGif.duration,
                videoWidth,
                videoHeight,
                scale: 100,
              };
              this.videoToGifRange = [ 0, videoToGif.duration ];
              this.videoToGifshow = true;
            };
          };
          reader.readAsDataURL(file);
        } else {
          this.$Message.warning(`视频文件超过${this.globalOptions.VIDEO_TO_GIF_MAX_MB}M`);
        }
      } else {
        this.$Message.warning('请上传 gif 图片 或 mp4 视频');
      }
      return false;
    },
    closeVideoToGifModal() {
      this.videoToGifshow = false;
      this.videoToGifSrc = null;
    },
    confirmVideoToGif() {
      this.$Spin.show();
      const video = this.$refs.videoToGif;
      video.pause();
      video.currentTime = this.videoToGifRange[ 0 ];
      // 配置
      const delay = this.globalOptions.VIDEO_TO_GIF_DELAY;
      const width = this.scaleVideoSize.videoWidth;
      const height = this.scaleVideoSize.videoHeight;
      // gif配置
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
      });
      gif.on('finished', blob => {
        const reader = new FileReader();
        reader.onload = event => {
          this.closeVideoToGifModal();
          this.init(event.target.result);
        };
        reader.readAsText(blob, 'x-user-defined');
      });
      let flag = false; // 去掉首帧，首帧黑屏
      const addFrame = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);
        if (flag) {
          gif.addFrame(canvas, { delay });
        }
        flag = true;
        video.currentTime += delay / 1000;
        if (video.currentTime < this.videoToGifRange[ 1 ]) {
          setTimeout(() => {
            addFrame();
          }, delay);
        } else {
          gif.render();
        }
      };
      addFrame();
    },
    init(data, addItemData) {
      this.gif = new SuperGif({
        container: this.$refs.gifBox,
        auto_play: 0,
        loop_mode: false,
        max_width: this.globalOptions.GIF_MAX_WIDTH,
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
            this.addItem[ index ].angle = target.angle;
            this.addItem[ index ].width = target.width * target.scaleX;
            this.addItem[ index ].height = target.height * target.scaleY;
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
        if (addItemData) {
          this.addItem = addItemData;
          this.currentAddItemIndex = this.addItem.length - 1;
        }
      });
    },
    pushAddItemText() {
      const defaltColor = 'rgba(255,255,255,1)';
      const newAddItem = {
        type: 'text',
        frameRangeStart: this.currentFrame,
        frameRangeEnd: this.allFrame,
        text: '输入文字',
        color: defaltColor,
        top: this.viewSize.height * 0.85,
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
    pushAddItemBlock() {
      const defaltColor = 'rgba(0,0,0,1)';
      const newAddItem = {
        type: 'block',
        frameRangeStart: this.currentFrame,
        frameRangeEnd: this.allFrame,
        top: this.viewSize.height * 0.9,
        left: this.viewSize.width * 0.5,
        color: defaltColor,
        width: this.viewSize.width,
        height: this.viewSize.height * 0.2,
        angle: 0,
      };
      const length = this.addItem.push(newAddItem);
      this.currentAddItemIndex = length - 1;
    },
    dragEnd(event) {
      this.currentAddItemIndex = event.newIndex;
    },
    selectAddItem(index) {
      this.currentAddItemIndex = index;
    },
    changeSlider(value) {
      this.addItem[ this.currentAddItemIndex ].frameRangeStart = value[ 0 ];
      this.addItem[ this.currentAddItemIndex ].frameRangeEnd = value[ 1 ];
    },
    removeAddItem(index) {
      this.addItem.splice(index, 1);
      this.currentAddItemIndex = this.addItem.length ? index - 1 : null;
    },
    copyAddItem(index) {
      const newAddItem = JSON.parse(JSON.stringify(this.addItem[ index ]));
      newAddItem.frameRangeStart = this.currentFrame;
      newAddItem.frameRangeEnd = this.allFrame;
      const length = this.addItem.push(newAddItem);
      this.currentAddItemIndex = length - 1;
    },
    /* backupAddItem() {
      if (this.currentBackupRecordIndex >= this.AddItemBackupRecord.length - 1) { // 备份时当前是最新记录
        const length = this.AddItemBackupRecord.push(this.addItem);
        this.currentBackupRecordIndex = length - 1;
        if (length >= 20) {
          this.AddItemBackupRecord.shift();
        }
      } else { // 备份时已经是正在撤回的状态
        this.AddItemBackupRecord = this.AddItemBackupRecord.splice(0, this.currentBackupRecordIndex);
      }
    },*/
    renderText() {
      this.subTextFabric.clear();
      for (let i = 0; i < this.addItem.length; i++) {
        const item = this.addItem[ i ];
        if (item.frameRangeStart <= this.currentFrame && item.frameRangeEnd >= this.currentFrame) {
          let fabricItem;
          switch (item.type) {
            case 'text':
              fabricItem = new fabric.Text(item.text, {
                shadow: {
                  color: '#000',
                  offsetX: 1,
                  offsetY: 1,
                },
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
                zIndex: i,
              /* cornerColor: '#2d8cf0',
                cornerSize: 8,
                transparentCorners: false,
                centeredScaling: true,*/
              });
              break;
            case 'block':
              fabricItem = new fabric.Rect({
                top: item.top,
                left: item.left,
                width: item.width,
                height: item.height,
                fill: item.color,
                angle: item.angle,
                originY: 'center',
                originX: 'center',
                borderColor: '#000',
                index: i,
                cornerColor: '#2d8cf0',
                cornerSize: 8,
                transparentCorners: false,
                centeredScaling: true,
                zIndex: i,
              });
              break;
            default:
              fabricItem = null;
          }
          this.subTextFabric.add(fabricItem);
        }
      }
    },
    generate() {
      this.$Spin.show();
      // 配置宽高
      const width = this.viewSize.width;
      const height = this.viewSize.height;
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
      });
      gif.on('finished', blob => {
        this.$Spin.hide();
        this.generateGif = URL.createObjectURL(blob);
        this.generateModalShow = true;
      });
      const addFrame = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.gif.get_canvas(), 0, 0, width, height);
        ctx.drawImage(this.subTextFabric.lowerCanvasEl, 0, 0, width, height);
        // 水印功能
        ctx.font = `${width * 0.02}px YaHei`;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255,255,255,.4)';
        ctx.fillText('pkgif.net', width * (1 - 0.02), height * 0.02);
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
      this.toBegin();
      setTimeout(() => {
        addFrame();
      }, this.delay);
    },
    closeGenerateModal() {
      this.generateModalShow = false;
      this.generateGif = null;
    },
    restart() {
      Object.assign(this.$data, this.$options.data());
    },
    tryDemoWsyw() {
      this.$Spin.show();
      const h = new XMLHttpRequest();
      h.open('GET', this.wsyw, true);
      h.overrideMimeType('text/plain; charset=x-user-defined');
      h.onload = e => {
        this.init(e.target.response, JSON.parse(JSON.stringify(wsywData)));
      };
      h.send();
    },
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
                margin: 20px 0;
                text-align: center;
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
                                right: -84px;
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
        .demo {
            margin: 20px 0;
            display: flex;
            justify-content: center;
            .demo-item {
                display: flex;
                justify-content: center;
                align-items: center;
                .transform {
                    margin: 0 20px;
                }
            }
        }
        footer {
            width: 600px;
            margin: 20px auto 30px;
            text-align: center;
        }
    }

    .md-box {
        .ivu-drawer-body {
            padding-left: 24px;
        }
    }

    .videoToGif-slider {
        padding: 0 46px;
        margin-top: 30px;
    }

    @media screen and (max-width: 1250px) {
        .pagehome {
            .container {
                width: 92vw;
                .upload {
                    width: 100%;
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
                            position: fixed;
                            top: 8vh;
                            left: -296px;
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
                                top: 50px;
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
    @media screen and (max-width: 800px) {
      .pagehome {
        .demo {
          .demo-item {
            flex-direction: column;
            img {
              margin: 10px 0;
            }
          }
        }
      }
    }
</style>
