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
            <div class="operation" v-show="gifFile">
                <img id="example1" :src="gifFile" :rel:animated_src="gifFile" rel:auto_play="0" width="467"
                     height="375"/>
                <button @click="pause">pause</button>
                <button @click="play">play</button>
                <button @click="show">show</button>
            </div>

        </div>
    </div>
</template>

<script>

export default {
  data() {
    return {
      gifFile: {},
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
    show() {
      console.log(this.gif);
      console.log(this.gif.get_current_frame());
      console.log(this.gif.get_length());
    },
    uploadGif(file) {
      const formData = new FormData();
      formData.append('file', file);
      this.$axios.post('/uploadImg', formData).then(res => {
        return this.$axios.get(``, formData);
      }).then(res => {

      });


      /* reader.onload = () => {
        this.gif = new SuperGif({ gif: document.getElementById('example1') });
        this.gif.load();
      };*/
      return false;
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
        }
    }
</style>
