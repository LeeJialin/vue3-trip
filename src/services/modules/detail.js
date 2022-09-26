import hyRequest from "../request";

export function getDetailInfos(houseId) {
  return hyRequest.get({
    url: "/detail/infos",
    params: {
      houseId,
    },
  });
}

// 例如：
// 在class封装中hyRequest方法返回的是一个promise
getDetailInfos(123).then((res) => {
  console.log(res.data);
});
