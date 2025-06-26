import './index.css';

$(() => {
  // 展开/折叠功能
  $('.expand-button').each((_index, button) => {
    const $button = $(button);
    const $section = $button.next('.expandable-section');

    $section.toggleClass('expanded', $button.hasClass('expanded'));
    $button.on('click', () => {
      const state = $button.hasClass('expanded');
      $button.toggleClass('expanded', !state);
      $section.toggleClass('expanded', !state);
    });
  });

  // 选择开局功能
  $('.option-button').on('click', function (this: HTMLButtonElement) {
    const first_message_index = Number(
      $(this)
        .find('span')
        .text()
        .match(/开局(\d+)/)?.[1],
    );
    setChatMessages([{ message_id: 0, swipe_id: first_message_index }]);
  });

  $('.copy-button').on('click', function (this: HTMLButtonElement) {
    const textToCopy = $(this).attr('data-copy') as string;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        // 创建成功提示
        const $successMessage = $('<div>').addClass('copy-success').text('链接已复制到剪贴板');
        $successMessage.appendTo('body');

        // 临时改变按钮文字
        const originalText = $(this).text();
        $(this).text('已复制!');
        $(this).css('background', '#e6f2ff');

        // 显示提示
        setTimeout(() => {
          $successMessage.css({
            opacity: 1,
            transform: 'translateX(-50%) translateY(0)',
          });
        }, 10);

        // 一段时间后隐藏并移除提示
        setTimeout(() => {
          $successMessage.css({
            opacity: 0,
            transform: 'translateX(-50%) translateY(-10px)',
          });
          $(this).text(originalText);
          $(this).css('background', '');

          setTimeout(() => {
            $successMessage.remove();
          }, 300);
        }, 2000);
      })
      .catch(err => {
        console.error('复制失败: ', err);
        alert('复制失败，请手动复制链接');
      });
  });
});
