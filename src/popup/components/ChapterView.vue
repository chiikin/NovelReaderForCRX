<template>
  <div class="chapter-view" :style="viewStyle">
    <h3 class="chapter-title">狂拽酷炫</h3>
    <div class="chapter-content" :style="contentStyle">
      <p
        v-for="(section, index) in cotnentSections"
        :key="index"
        v-text="section"
      ></p>
    </div>
    <div class="chapter-btns" style="text-align: center">
      <van-button type="default">上一章</van-button>
      <van-button type="default">下一章</van-button>
    </div>
    <van-popup
      v-model="viewSettingVisible"
      closeable
      position="bottom"
      :style="{ height: '30%' }"
    >
      <p>
        <label>字体大小</label>
        <van-button type="primary" size="small">A-</van-button>
        <van-button type="primary" size="small">A+</van-button>
        <van-button type="primary" size="small">默认</van-button>
      </p>
      <p>
        <label>背景</label>
        <span
        class="chapter-theme-btn"
          v-for="(theme, index) in themes"
          :key="index"
          :style="getThemeBtnStyle(theme)"
          :class="{ 'active':theme.key===theme.key}"
        >
          &nbsp;
        </span>
      </p>
    </van-popup>
  </div>
</template>

<script>
export default {
  name: "ChapterView",
  data() {
    return {
      viewSettingVisible: true,
      fontSize: 1,
      theme: {
        key: "1",
        color: "#000",
        backgroundColor: "rgb(216, 214, 211)",
      },
      themes: [
        {
          key: 1,
          backgroundColor: "rgb(216, 214, 211)",
          color: "#000",
        },
      ],
      content: `钢铁工业是高能耗的行业之一，在全国的能源消耗结构中约占11%，在工业部门能耗量中约占15%~25%，而能源成本在钢铁企业的总制造成本占比约为30%。在企业运营需求，社会环保，政府能源政策以及智慧制造等多重因素的驱动下，节能降本已成为企业持续增长的核心诉求。国内顶尖的钢铁企业都先后退出了成本削减引导节能减排的相关管理模式。
传统上，企业一般通过目标管控、对标寻优等模式来推进能源管理。这种自顶向下的管理具有多种问题：
1)	指导性差：各企业的生产工艺流程特点、产品及原材料结构等具有较大的差异性，对标等不能完整的体现企业生产特点。
2)	事后分析：检修、设备故障等对能耗的影响难以完整体现，而产品规格、操作水平等更是无法量化。能源管理局限于技术员的事后分析，制约了能源改善的及时性。
3)	可操作性差：企业的能耗报表只能做能耗的溯源，无法与生产紧密结合。生产部分无法将节能指标分解为可操作的生产指令。
当前，随着钢铁企业信息化的进一步普及，来自于多种维度的生产大数据使得“数据驱动管理”成为可能。通过将过去不被重视的生产节奏、设备状态、产品结构、工艺及装置参数等低价值数据纳入分析范围，我们可以建立自下而上的透明化能耗分析网络结构，通过能耗因素分析将节能与岗位操作相结合，打造可操作的即时性能耗分析改进管理模式。
能源因素分析模型已经被众多钢铁企业纳入其能源管理体系中。但是，在实际执行中往往效果很差，存在多种问题：
1)	各工序单元因素库差异性大，缺乏有效的指导，技术人员无法有效识别影响因素；部分工厂存在数据缺失、不稳定、失真等各种问题，分析基础薄弱；
2)	分析模型需要进行定制，各厂部诉求不同；能源生产贯穿钢铁生产的全过程全生命周期，孤立的工序能耗分析并不能提高整体能效；因素识别、数据处理等需要相当长的时间，在成效和投入间很难平衡，最终不得不回到报表的传统模式。
3)	分析结论流于形式，不能有效的促成能源改进。因素分析结论往往需要一定程度的人工介入，如结合企业日常生产节奏和状态等。当技术员的结论和分析结果之间缺少联系后，因素分析成为了报表数据源，其可用性受到影响，最终导致人工分析取代数据结论。
本文介绍了因素分析模型的主要实践，其特点在于构建一套具有通用性的可生长因素库模型，并将分析与企业的日常人工分析进行结合，可以构建可操作的持续PDCA循环。本模型包括因素分析知识库建立、因素分析模型、能效改善跟踪3个环节，并针对不同分析场景整合了多种分析方法，实现了自动、透明化地对各工艺环节影响因素进行分析及措施改进跟踪管理。
因素分析知识库建立
通过建立因素分析知识库，对工序下不同维度的影响因素进行定向的研究分析，得出具体量化的影响分析数据，进而制定出特定的解决方案并实施应用。
为了建立统一的可分析模型，其主要步骤包括：
1)	接入各类能源、生产过程及状态数据，并进行数据格式转换、清洗、补正等预处理，进而建立起因素数据集。根据能源数据特点，数据集需要具备一定的规范，满足分析的时序、质量以及扩展性要求。部分定性分析或产品规格等，需要转换为分类数据。
2)	构建数据体系，通过相关性分析等手段，建立分析对象和影响因素间的关系。该数据体系需要具有通用性和自动性，可以针对分析对象，进行特征提取和识别，也能够按照需要进行扩充。在分析过程中，还需要将多个分析模型连接，构成一个可溯源的分析体系。
3)	针对需要，构建能耗基准/标准库。基准/标准库用来对数据进行异常检测，提高分析质量，也作为后续分析的参照。
4)	针对各分析单元和影响因素，建立其对应的“人、机、料、法、环、测”溯因及改善策略库。以便将因素分析结果与生产的主体元素结合，实现持续改善。
根据已配置的数据源、数据项等基础信息，以工序分组建立分析对象，并依据数据项进行配置分析对象下的影响因素数据及可分析的时间粒度，形成因素分析知识库，便可对工序下不同时间粒度的影响因素进行分析研究。
`,
    };
  },
  computed: {
    readingChapter() {
      return this.$store.state.readingChapter;
    },
    contentStyle() {
      return {
        fontSize: this.fontSize + "rem",
        color: this.theme.color,
      };
    },
    viewStyle() {
      return {
        backgroundColor: this.theme.backgroundColor,
        color: this.theme.color,
      };
    },
    cotnentSections() {
      const content = this.content || "";
      return content.split("\n");
      // .map((text) => {
      //   return `<p>${text}</p>`;
      // })
      // .join("");
    },
  },
  created() {},
  methods: {
    getThemeBtnStyle(theme) {
      return {
        backgroundColor: theme.backgroundColor,
        color: theme.color,
      };
    },
  },
};
</script>

<style lang="scss">
.chapter-view {
  overflow: hidden;
  position: relative;
  padding: 0.5rem;
  .chapter-title {
  }
  .chapter-content {
    padding-bottom: 30px;
  }
  .chapter-theme-btn{
display: inline-block;
width: 30px;
height: 30px;
border-radius: 15px;
  }
  .chapter-theme-btn.active{
    outline: 1px solid lightcoral;
  }
}
</style>