// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database()

let counter = 2000;

async function getMaxMemberNo() {
  return await db.collection("members").orderBy('createTime', 'desc').limit(2).get();
}


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  if(counter === 2000) {
    try {
      const res = await getMaxMemberNo();
      console.log(res);
      counter = res.data[1].no ? res.data[1].no + 1 : ++counter;
    } catch (error) {
      console.error(error);
      throw new Error('学号生成失败！')
    }
   
  }else {
    ++ counter;
  }

  try {
    await db.collection("members").where({
      _openid: wxContext.OPENID,
    }).update({
      data: {
        no: counter
      }
    })
  } catch (error) {
    console.error(error);
    throw new Error('学号生成失败！')
  }
  
  return {
    openid: wxContext.OPENID,
    no: counter,
  }
}