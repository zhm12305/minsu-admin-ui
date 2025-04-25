import request from '@/utils/request'

// 查询民宿列表
export function listHomestay(query) {
  return request({
    url: '/huacai/homestay/list',
    method: 'get',
    params: query
  })
}

// 查询民宿详细
export function getHomestay(homestayId) {
  return request({
    url: '/huacai/homestay/' + homestayId,
    method: 'get'
  })
}

// 新增民宿
export function addHomestay(data) {
  return request({
    url: '/huacai/homestay',
    method: 'post',
    data: data
  })
}

// 修改民宿
export function updateHomestay(data) {
  return request({
    url: '/huacai/homestay',
    method: 'put',
    data: data
  })
}

// 删除民宿
export function delHomestay(homestayId) {
  return request({
    url: '/huacai/homestay/' + homestayId,
    method: 'delete'
  })
}
