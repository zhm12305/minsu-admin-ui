import request from '@/utils/request'

// 查询景点列表
export function listSpots(query) {
  return request({
    url: '/huacai/spots/list',
    method: 'get',
    params: query
  })
}

// 查询景点详细
export function getSpots(spotsId) {
  return request({
    url: '/huacai/spots/' + spotsId,
    method: 'get'
  })
}

// 新增景点
export function addSpots(data) {
  return request({
    url: '/huacai/spots',
    method: 'post',
    data: data
  })
}

// 修改景点
export function updateSpots(data) {
  return request({
    url: '/huacai/spots',
    method: 'put',
    data: data
  })
}

// 删除景点
export function delSpots(spotsId) {
  return request({
    url: '/huacai/spots/' + spotsId,
    method: 'delete'
  })
}

// 不分页查询景点列表
export function selectSpotsByList() {
  return request({
    url: '/huacai/spots/selectSpotsByList',
    method: 'get'
  })
}
