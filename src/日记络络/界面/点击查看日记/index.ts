import './index.css';

$(() => {
  $('.clickdiv').on('click', () => {
    triggerSlash(
      `/send 查看日记\n<UpdateVariable>\n_.set('世界.下次响应界面选择判断', 1)\n</UpdateVariable> || /trigger`,
    );
  });
});
