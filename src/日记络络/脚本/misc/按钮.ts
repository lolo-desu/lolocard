async function delete_qr() {
  const qrs: string[] = JSON.parse(await triggerSlash('/qr-set-list'));
  const expected_qr = '纯白色的回响';
  if (qrs.includes(expected_qr)) {
    triggerSlash(`/qr-set-delete ${expected_qr}`);
  }
}

interface Button {
  name: string;
  function: (() => void) | (() => Promise<void>);
}

const buttons: Button[] = [
  {
    name: '🕛度过',
    function: async () => {
      const data = {
        晨间: '先描写结束当前场景的剧情再快速将时间调整到下个晨间',
        课上: '先描写结束当前场景的剧情再快速将时间调整到下个课上',
        午休: '先描写结束当前场景的剧情再快速将时间调整到下个午休',
        放学后: '先描写结束当前场景的剧情再快速将时间调整到下个放学后',
        夜间: '先描写结束当前场景的剧情再快速将时间调整到下个夜间',
        假日: '先描写结束当前场景的剧情再快速将时间调整到下个假日',
        第二天:
          '先描写结束当前场景的剧情再快速将时间调整到第二天，并调整当前时间阶段变量到接下来故事情节最有意义的时间，下一次响应的时间阶段变量调整没有任何限制',
      };

      const time = await triggerSlash(`/buttons labels=${JSON.stringify(Object.keys(data))} 时间来到了...`);
      if (!_.has(data, time)) {
        return;
      }

      await triggerSlash(`/send ${data[time as keyof typeof data]} || /trigger`);
    },
  },
  {
    name: '🗺️地点',
    function: async () => {
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
        `/send <!--于本次响应需要描写结束当前场景的剧情再写出理由前往下一个地点-->[移动] {{user}}前往了${subplace} || /trigger`,
      );
    },
  },
];

export function initButtons() {
  delete_qr();
  buttons.forEach(button => eventOn(getButtonEvent(button.name), button.function));
  appendInexistentScriptButtons(buttons.map(button => ({ name: button.name, visible: true })));
  return {
    destroy: () => replaceScriptButtons(getScriptButtons().filter(button => buttons.some(b => b.name === button.name))),
  };
}
