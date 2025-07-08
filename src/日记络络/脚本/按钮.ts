export {};

async function delete_qr() {
  const qrs: string[] = JSON.parse(await triggerSlash('/qr-set-list'));
  const expected_qr = '纯白色的回响';
  if (qrs.includes(expected_qr)) {
    triggerSlash(`/qr-set-delete ${expected_qr}`);
  }
}

async function handle_度过() {
  const data = {
    晨间: "先描写结束当前场景的剧情再快速将时间调整到下个晨间\n<UpdateVariable>\n_.set('世界.当前时间阶段', 1);\n</UpdateVariable>",
    课上: "先描写结束当前场景的剧情再快速将时间调整到下个课上\n<UpdateVariable>\n_.set('世界.当前时间阶段', 18);\n</UpdateVariable>",
    午休: "先描写结束当前场景的剧情再快速将时间调整到下个午休\n<UpdateVariable>\n_.set('世界.当前时间阶段', 32);\n</UpdateVariable>",
    放学后:
      "先描写结束当前场景的剧情再快速将时间调整到下个放学后\n<UpdateVariable>\n_.set('世界.当前时间阶段', 49);\n</UpdateVariable>",
    夜间: "先描写结束当前场景的剧情再快速将时间调整到下个夜间\n<UpdateVariable>\n_.set('世界.当前时间阶段', 66);\n</UpdateVariable>",
    假日: "先描写结束当前场景的剧情再快速将时间调整到下个假日\n<UpdateVariable>\n_.set('世界.当前时间阶段', 83);\n</UpdateVariable>",
    第二天:
      "先描写结束当前场景的剧情再快速将时间调整到第二天，并调整当前时间阶段变量到接下来故事情节最有意义的时间，下一次响应的时间阶段变量调整没有任何限制\n<UpdateVariable>\n_.set('世界.当前时间阶段', 1);\n</UpdateVariable>",
  };

  const time = await triggerSlash(`/buttons labels=${JSON.stringify(Object.keys(data))} 时间来到了...`);
  if (!_.has(data, time)) {
    return;
  }

  await triggerSlash(`/send ${data[time as keyof typeof data]} || /trigger`);
}

async function handle_地点() {
  const data: Record<string, { 旁白: string; 地点: string[] }> = {
    住宅: { 旁白: '回家！', 地点: ['住所玄关', '住所客厅', '房间'] },
    学校: {
      旁白: '去学校吗...',
      地点: ['上学路上', '学校教学楼正门前', '教室', '学校中庭', '学校外侧楼梯', '学校屋顶'],
    },
    城镇与街道: {
      旁白: '去逛逛呢...',
      地点: ['城镇街道上', '住宅街', '商店街', '拱廊商店街', '繁华商业街', '城市中的铁路道口'],
    },
    商业设施: {
      旁白: '去约会吗w...',
      地点: [
        '便利店内',
        '书店内',
        '咖啡厅',
        '家庭餐厅',
        '购物中心',
        '购物中心二层',
        '美术馆',
        '地铁站内',
        '地铁内',
        '庙会小吃街',
      ],
    },
    户外: {
      旁白: '锻炼身体...?',
      地点: ['公园', '公园凉亭', '公园商店亭', '河旁', '海滩'],
    },
  };

  const place = await triggerSlash(`/buttons labels=${JSON.stringify(Object.keys(data))} {{user}}将动身前往...`);
  if (!_.has(data, place)) {
    return;
  }

  const { 旁白, 地点 } = data[place];
  const subplace = await triggerSlash(`/buttons labels=${JSON.stringify(地点)} <small>${旁白}<small>`);
  if (!地点.includes(subplace)) {
    return;
  }

  triggerSlash(
    `/send <!--于本次响应需要描写结束当前场景的剧情再写出理由前往下一个地点-->[移动] {{user}}前往了${subplace}\n<UpdateVariable>\n_.set('世界.下次响应界面选择判断', 0);\n</UpdateVariable> || /trigger`,
  );
}

function handle_计数() {
  console.log('📊计数');
  triggerSlash(
    `/ejs 上次发送了：<%- variables.LAST_SEND_TOKENS %> 词符(tokens), 共计 <%- variables.LAST_SEND_CHARS %> 字符。<br/>收到的消息处理后：<%- variables.LAST_RECEIVE_TOKENS %> 词符(tokens), 共计 <%- variables.LAST_RECEIVE_CHARS %> 字符。 | /popup <h4>提示词计数</h4><br>{{pipe}}`,
  );
}

$(() => {
  delete_qr();
  eventOnButton('🕛度过', handle_度过);
  eventOnButton('🗺️地点', handle_地点);
  eventOnButton('📊计数', handle_计数);
});
