<template>
  <div class="detail top-page" ref="detailRef">
    <tab-control
      v-if="showTabControl"
      class="tabs"
      :titles="names"
      @tabItemClick="tabClick"
      ref="tabControlRef"
    />
    <van-nav-bar
      title="房屋详情"
      left-text="旅途"
      left-arrow
      @click-left="onClickLeft"
    />
    <!-- v-memo="[mainPart]" : 新语法，当这个数据有变化时，里面的内容才进行刷新 -->
    <div class="main" v-if="mainPart" v-memo="[mainPart]">
      <detail-swipe :swipe-data="mainPart.topModule.housePicture.housePics" />
      <detail-infos
        name="描述"
        :ref="getSectionRef"
        :top-infos="mainPart.topModule"
      />
      <detail-facility
        name="设施"
        :ref="getSectionRef"
        :house-facility="mainPart.dynamicModule.facilityModule.houseFacility"
      />
      <detail-landlord
        name="房东"
        :ref="getSectionRef"
        :landlord="mainPart.dynamicModule.landlordModule"
      />
      <detail-comment
        name="评论"
        :ref="getSectionRef"
        :comment="mainPart.dynamicModule.commentModule"
      />
      <detail-notice
        name="须知"
        :ref="getSectionRef"
        :order-rules="mainPart.dynamicModule.rulesModule.orderRules"
      />
      <detail-map
        name="周边"
        :ref="getSectionRef"
        :position="mainPart.dynamicModule.positionModule"
      />
      <detail-intro :price-intro="mainPart.introductionModule" />
    </div>
    <div class="footer">
      <img src="@/assets/img/detail/icon_ensure.png" alt="" />
      <div class="text">弘源旅途, 永无止境!</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getDetailInfos } from "@/services";

import TabControl from "@/components/tab-control/tab-control.vue";
import DetailSwipe from "./cpns/detail_01-swipe.vue";
import DetailInfos from "./cpns/detail_02-infos.vue";
import DetailFacility from "./cpns/detail_03-facility.vue";
import DetailLandlord from "./cpns/detail_04-landlord.vue";
import DetailComment from "./cpns/detail_05-comment.vue";
import DetailNotice from "./cpns/detail_06-notice.vue";
import DetailMap from "./cpns/detail_07-map.vue";
import DetailIntro from "./cpns/detail_08-intro.vue";
import useScroll from "@/hooks/useScroll";

const router = useRouter();
const route = useRoute();
const houseId = route.params.id;

// 发送网络请求获取数据
const detailInfos = ref({});
const mainPart = computed(() => detailInfos.value.mainPart);
getDetailInfos(houseId).then((res) => {
  detailInfos.value = res.data;
});

// 监听返回按钮的点击
const onClickLeft = () => {
  router.back();
};

// tabControl相关的操作
const detailRef = ref();
const { scrollTop } = useScroll(detailRef);
const showTabControl = computed(() => {
  return scrollTop.value >= 300;
});

// const landlordRef = ref()
// const sectionEls = []
// const getSectionRef = (value) => {
//   sectionEls.push(value.$el)
// }
const sectionEls = ref({});
const names = computed(() => {
  return Object.keys(sectionEls.value);
});
// 这里用了一个新语法：动态给所有子组件添加ref，结合html结构的使用要在html的ref中添加`:`符合;
const getSectionRef = (value) => {
  if (!value) return;
  console.log(value.$el);
  // 获取每个组件身上的name值
  const name = value.$el.getAttribute("name");
  // .el:是获取组件上的元素，因为使用ref获取到的组件是一个组件对象，需要单带获取组件的元素
  // 相当于给对象的key添加value， obj.name = <组件 />
  sectionEls.value[name] = value.$el;
};

// 取消点击后页面滚动的效果
let isClick = false;
let currentDistance = -1;
const tabClick = (index) => {
  const key = Object.keys(sectionEls.value)[index];
  const el = sectionEls.value[key];
  let distance = el.offsetTop;
  if (index !== 0) {
    distance = distance - 44;
  }

  isClick = true;
  currentDistance = distance;

  detailRef.value.scrollTo({
    top: distance,
    // 平滑滚动
    behavior: "smooth",
  });
};

// 页面滚动, 滚动时匹配对应的tabControll的index
const tabControlRef = ref();
// newValue:这里的这个watch是箭头scrollTop的最新的值，每次拿到最新的值去匹配
watch(scrollTop, (newValue) => {
  // 如果页面滚动到了想到的位置，需要重新赋值isCilck，好为下一次点击做判断
  if (newValue === currentDistance) {
    isClick = false;
  }
  // 判断是页面滚动还是点击，如果是点击则不执行下面的滚动代码
  if (isClick) return;

  // 1.获取所有的区域的offsetTops
  const els = Object.values(sectionEls.value);
  const values = els.map((el) => el.offsetTop);

  // 2.根据newValue去匹配想要索引
  let index = values.length - 1;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > newValue + 44) {
      index = i - 1;
      break;
    }
  }
  // console.log(index)
  tabControlRef.value?.setCurrentIndex(index);
});
</script>

<style lang="less" scoped>
.tabs {
  position: fixed;
  z-index: 9;
  left: 0;
  right: 0;
  top: 0;
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;

  img {
    width: 123px;
  }

  .text {
    margin-top: 12px;
    font-size: 12px;
    color: #7688a7;
  }
}
</style>
