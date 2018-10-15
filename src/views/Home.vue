<template>
  <div class="home">
    <el-dialog
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      width="30%">
      <el-button v-if='all' @click="selectCan">选择所有</el-button>
      <el-button v-else @click="selectAll">选择可选</el-button>
      <el-select v-model="pName" style="width: 160px" @change="handleClose">
        <el-option label="空" value="空">
        </el-option>
        <el-option v-for="item in peopleSelect" :key="item" :label="item['姓名']+'/'+item['联系电话']" :value="JSON.stringify(item)">
        </el-option>
      </el-select>
    </el-dialog>
    <el-form :inline="true">
      <el-form-item label="选择城市">
        <el-select v-model="city" style="width: 160px" @change="selectCity">
          <el-option v-for="item in cityList" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据内容">
        <el-select v-model="infoName" style="width: 160px">
          <el-option v-for="item in infoList" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <upload-excel @loaded="handleImport"></upload-excel>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportInfo">导出</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="auto">自动排班</el-button>
      </el-form-item>
    </el-form>
    <el-table
      border
      :data="formByCity"
      style="width: 100%"
      height="600px">
      <el-table-column label="是否确认" prop="是否确认" width='100'>
        <template slot-scope="scope">
          <span style='color:green' v-if="scope.row['是否确认']==='是'">已确认</span>
          <el-button v-if="scope.row['是否确认']==='是'" @click="cancel(scope)" type="text">取消</el-button>
          <el-button v-else @click="confirm(scope)" type="text">确认</el-button>
        </template>
      </el-table-column>
      <el-table-column v-for='item in tableConfig' :label="item"  :key="item" :prop="item" width='200'>
        <template slot-scope="scope">
          {{scope.row[item]}}
          <el-button @click="handleClick(scope.row,item)" type="text" size="small"  v-if="item.slice(0,2)!=='评审'&&item.slice(-2)==='电话'">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import fileSaver from 'file-saver'
import uploadExcel from '@/components/UploadExcel'
import xlsxUtil from '../util/xlsxUtil.js'
import _ from 'lodash'
export default {
  name: 'home',
  components: {
    uploadExcel
  },
  created () {
    this.form = JSON.parse(sessionStorage.getItem('form'))
    this.people = JSON.parse(sessionStorage.getItem('people'))
    let cl = []
    Object.keys(this.form).forEach(function (key) {
      cl.push(key)
    })
    this.cityList = cl
    this.city = this.cityList[0]

    this.selectCity()
  },
  data () {
    return {
      all: true,
      tableConfig: '',
      core: '',
      alternative: '',
      form: '',
      formByCity: [],
      infoName: '',
      table: '',
      infoList: ['核心专家', '备选专家', '安排表'],
      cityList: [],
      city: '',
      people: {},
      dialogVisible: false,
      peopleSelect: '',
      pName: '',
      vrow: '',
      vitem: ''
    }
  },
  methods: {
    selectCity () {
      this.formByCity = this.form[this.city]
      let tc = []
      Object.keys(this.formByCity[0]).forEach(function (key) {
        if (key !== '是否确认') {
          tc.push(key)
        }
      })
      this.tableConfig = tc
    },
    async handleImport (arrayBuffer) {
      if (this.infoName) {
        const res = await xlsxUtil.excelToJson(arrayBuffer)
        if (this.infoName === '核心专家') {
          this.core = res
          let c = this.core
          let a = this.alternative
          let x = {}
          Object.keys(this.core).forEach(function (key) {
            x[key] = c[key].concat(a[key])
          })
          let people = this.people
          if (Object.keys(x).length > 0) {
            people = _.cloneDeep(x)
          }
          this.people = people
          this.$message({
            showClose: true,
            message: '已导入核心专家库',
            type: 'success'
          })
        } else if (this.infoName === '备选专家') {
          this.alternative = res
          let c = this.core
          let a = this.alternative
          let x = {}
          Object.keys(this.core).forEach(function (key) {
            x[key] = c[key].concat(a[key])
          })
          let people = this.people
          if (Object.keys(x).length > 0) {
            people = _.cloneDeep(x)
          }
          this.people = people
          this.$message({
            showClose: true,
            message: '已导入备选专家库',
            type: 'success'
          })
        } else if (this.infoName === '安排表') {
          this.form = res
          let cl = []
          Object.keys(res).forEach(function (key) {
            cl.push(key)
          })
          this.cityList = cl
          this.city = this.cityList[0]
          this.selectCity()
          this.$message({
            showClose: true,
            message: '已导入安排表',
            type: 'success'
          })
        }
      } else {
        this.$message({
          showClose: true,
          message: '请先选择数据内容',
          type: 'warning'
        })
      }
    },
    exportInfo () {
      let info = this.form
      const xlsx = xlsxUtil.jsonToExcel(
        info
      )
      const blob = new Blob([xlsx], {
        type: 'application/octet-stream'
      })
      fileSaver.saveAs(blob, 'Info.xlsx')
    },
    auto () {
      let c = this.core
      let a = this.alternative
      let x = {}
      Object.keys(this.core).forEach(function (key) {
        x[key] = c[key].concat(a[key])
      })
      let people = this.people
      if (Object.keys(x).length > 0) {
        people = _.cloneDeep(x)
      }
      let peopleZW = []
      try {
        peopleZW = Object.keys(people)
      } catch (error) {

      }
      let formTemp = this.form
      let time = []
      let i = 0
      Object.keys(formTemp).forEach(function (key) {
        formTemp[key].forEach(function (l) {
          time.push(l['评审时间'])
          if (time.length > 1 && time[time.length - 1] === time[time.length - 2]) {
            i++
          } else {
            i = 0
          }
          Object.keys(l).forEach(function (x) {
            if (x.slice(0, 2) !== '评审') {
              peopleZW.forEach(pz => {
                if (pz.slice(0, 2) === x.slice(0, 2)) {
                  while (people[pz][i] && people[pz][i]['tempn'] >= 2 && people[pz][i]['tempz'] >= 2) {
                    people[pz].splice(i, 1)
                  }
                  if (people[pz][i] && x.slice(-2) === '电话') {
                    l[x] = people[pz][i]['姓名'] + '/' + people[pz][i]['联系电话']
                    people[pz][i]['tempn'] ? people[pz][i]['tempn']++ : people[pz][i]['tempn'] = 1
                  } else if (people[pz][i] && x.slice(-2) === '职称') {
                    l[x] = people[pz][i]['单位'] + people[pz][i]['职务'] + '/' + people[pz][i]['职称']
                    people[pz][i]['tempz'] ? people[pz][i]['tempz']++ : people[pz][i]['tempz'] = 1
                  }
                }
              })
            }
          })
        })
      })
      this.people = people
      this.form = formTemp
      sessionStorage.setItem('form', JSON.stringify(this.form))
      sessionStorage.setItem('people', JSON.stringify(this.people))
      this.selectCity()
    },
    handleClose () {
      let vitem = this.vitem
      let vrow = this.vrow
      let pName = ''
      if (this.pName && this.pName !== '空') {
        pName = JSON.parse(this.pName)
      } else if (this.pName && this.pName === '空') {
        pName = { '姓名': '', '联系电话': '', '单位': '', '职务': '', '职称': '' }
      }
      this.tableConfig.forEach(function (key) {
        if (key.slice(0, 2) === vitem.slice(0, 2)) {
          if (key.slice(-2) === '电话') {
            pName ? vrow[key] = pName['姓名'] + '/' + pName['联系电话'] : vrow[key] = vrow[key]
          } else if (key.slice(-2) === '职称') {
            pName ? vrow[key] = pName['单位'] + pName['职务'] + '/' + pName['职称'] : vrow[key] = vrow[key]
          }
        }
      })
      this.pName = ''
      sessionStorage.setItem('form', JSON.stringify(this.form))
      this.dialogVisible = false
    },
    handleClick (row, item) {
      let c = this.core
      let a = this.alternative
      let x = {}
      Object.keys(this.core).forEach(function (key) {
        x[key] = c[key].concat(a[key])
      })
      let people = this.people
      if (Object.keys(x).length > 0) {
        people = _.cloneDeep(x)
      }
      let peopleZW = []
      try {
        peopleZW = Object.keys(people)
      } catch (error) {

      }
      let ps = []
      peopleZW.forEach(function (pz) {
        if (pz.slice(0, 2) === item.slice(0, 2)) {
          ps = people[pz]
        }
      })
      if (!ps[ps.length - 1]) {
        ps.pop()
      }
      this.peopleSelect = ps
      this.vrow = row
      this.vitem = item
      this.dialogVisible = true
      this.all = true
    },
    confirm (scope) {
      scope.row['是否确认'] = '是'
      console.log(this.formByCity)
    },
    cancel (scope) {
      scope.row['是否确认'] = ''
    },
    selectAll () {
      let c = this.core
      let a = this.alternative
      let x = {}
      Object.keys(this.core).forEach(function (key) {
        x[key] = c[key].concat(a[key])
      })
      let people = this.people
      if (Object.keys(x).length > 0) {
        people = _.cloneDeep(x)
      }
      let peopleZW = []
      try {
        peopleZW = Object.keys(people)
      } catch (error) {

      }
      let ps = []
      let item = this.vitem
      peopleZW.forEach(function (pz) {
        if (pz.slice(0, 2) === item.slice(0, 2)) {
          ps = people[pz]
        }
      })
      if (!ps[ps.length - 1]) {
        ps.pop()
      }
      this.all = true
      this.peopleSelect = ps
    },
    selectCan () {
      this.selectAll()
      let allPeople = this.peopleSelect
      let ps = []
      let form = this.form
      allPeople.forEach(function (p) {
        let temp = 2
        Object.keys(form).forEach(function (key) {
          form[key].forEach(function (f) {
            Object.keys(f).forEach(function (x) {
              if (x.slice(-2) === '电话') {
                if (f[x].indexOf('/') > 0 && parseInt(p['联系电话']) === parseInt(f[x].slice(f[x].indexOf('/') + 1))) {
                  temp--
                }
              }
            })
          })
        })
        if (temp > 0) {
          ps.push(p)
        }
      })
      if (!ps[ps.length - 1]) {
        ps.pop()
      }
      this.peopleSelect = ps
      this.all = false
    }
  }

}
</script>
