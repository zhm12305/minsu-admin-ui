import request from '@/utils/request'

// 查询商家列表
export function listMerchant(query) {
  return request({
    url: '/huacai/merchant/list',
    method: 'get',
    params: query
  })
}

// 查询商家详细
export function getMerchant(merchantId) {
  return request({
    url: '/huacai/merchant/' + merchantId,
    method: 'get'
  })
}

// 新增商家
export function addMerchant(data) {
  return request({
    url: '/huacai/merchant',
    method: 'post',
    data: data
  })
}

// 修改商家
export function updateMerchant(data) {
  return request({
    url: '/huacai/merchant',
    method: 'put',
    data: data
  })
}

// 删除商家
export function delMerchant(merchantId) {
  return request({
    url: '/huacai/merchant/' + merchantId,
    method: 'delete'
  })
}

// 查询商家表中是否存在某个 userId
export function selectMerchantWhereUserId() {
  return request({
    url: '/huacai/merchant/selectMerchantWhereUserId',
    method: 'get'
  })
}

// 根据userId查询商家信息
export function selectMerchantByUserId() {
  return request({
    url: '/huacai/merchant/selectMerchantByUserId',
    method: 'get'
  })
}

// 审核通过
export function approved(merchantId) {
  return request({
    url: '/huacai/merchant/' + merchantId,
    method: 'put',
  })
}
