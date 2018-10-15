<template>
  <div class="el-button el-button--primary btn-file">
    导入
    <input ref="fileInput" type="file" accept="application/vnd.ms-excel,.xlsx" @change="handleFile">
  </div>
</template>

<script>
export default {
  name: 'uploadExcel',
  data () {
    return {}
  },
  methods: {
    handleFile (e) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = e => {
        this.$emit('loaded', e.target.result)
        this.$refs.fileInput.value = null
      }
      if (file) {
        reader.readAsArrayBuffer(file)
      }
    }
  }
}

</script>
<style scoped>
.btn-file {
    position: relative;
    overflow: hidden;
}
.btn-file input[type=file] {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 100%;
    min-height: 100%;
    text-align: right;
    opacity: 0;
    filter: alpha(opacity=0);
    opacity: 0;
    background: none repeat scroll 0 0 transparent;
    cursor: inherit;
    display: block;
}
</style>
