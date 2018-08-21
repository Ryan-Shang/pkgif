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
                <img id="example1" rel:auto_play="0" width="467"
                     height="375"/>
                <img id="example2" rel:auto_play="0" width="467"
                     height="375"/>
                <button @click="pause">pause</button>
                <button @click="play">play</button>
                <button @click="show">show</button>
            </div>

        </div>
    </div>
</template>

<script>
import gifFile from '../asset/img/test.gif';

export default {
  data() {
    return {
      gif: null,
      gif2:null,
    };
  },
  methods: {
    pause() {
      this.gif2.pause();
    },
    play() {
      this.gif2.play();
    },
    show() {
      console.log(this.gif);
      console.log(this.gif.get_current_frame());
      console.log(this.gif.get_length());
    },
    uploadGif(file) {
      this.gif = new SuperGif({ gif: document.getElementById('example1') });
      this.gif.load_url(gifFile);
      const reader = new FileReader();
      reader.onload = function(event) {
        // 图片路径设置为读取的图片
        this.gif2 = new SuperGif({ gif: document.getElementById('example2') });
        this.gif2.load_url(gifFile,event.target.result);
        console.log(this.gif2);
      };
      reader.readAsText(file, 'x-user-defined');

      /* const formData = new FormData();
      formData.append('file', file);
      this.$axios.post('/uploadImg', formData).then(res => {
        return this.$axios.get(``, formData);
      }).then(res => {

      });*/
      return false;
    },
  },
  created() {
  },
  mounted() {
    /* this.gif = new _SuperGif({ gif: document.getElementById('example1') });
    this.gif.load(gifFile);*/
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
        }
    }
</style>
