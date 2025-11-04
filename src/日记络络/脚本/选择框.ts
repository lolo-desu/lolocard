export {};

import default_css from './选择框默认样式.css?raw';

const lorebook_name = '上锁的日记本' as const;
const roleplay_options_tag = '<roleplay_options>' as const;
const roleplay_options_regex = /<(roleplay_options)>\s*(?:```.*\n)?((?:(?!<\1>)[\s\S])*?)(?:\n```)?\s*<\/\1>/mi;

//----------------------------------------------------------------------------------------------------------------------
namespace option_section {
  interface Option {
    input_mode: '直接发送' | '覆盖输入' | '尾附输入' | '自动推进';
  }
  const default_option: Option = {
    input_mode: '直接发送',
  };

  export let option: Option;

  async function parse_option(): Promise<Option> {
    const options: Record<string, string> = _.merge(
      {},
      ...(await getLorebookEntries(lorebook_name))
        .filter(entry => entry.comment.startsWith('选择框设置-') && entry.enabled)
        .map(entry => {
          const value = entry.comment.replace('选择框设置-', '');
          return { [value]: entry.content };
        }),
    );

    const result = default_option;
    if (_.has(options, '直接发送')) {
      result.input_mode = '直接发送';
    } else if (_.has(options, '覆盖输入')) {
      result.input_mode = '覆盖输入';
    } else if (_.has(options, '尾附输入')) {
      result.input_mode = '尾附输入';
    }
    return result;
  }

  export async function update(): Promise<boolean> {
    const old_option = option;
    option = await parse_option();
    return !_.isEqual(option, old_option);
  }
}

//----------------------------------------------------------------------------------------------------------------------
namespace render_section {
  async function divclick($element: JQuery<HTMLDivElement>) {
    if ($element.parents('.last_mes').length > 0) {
      const content = $element.find('.roleplay_options_content').text().trim();
      if (option_section.option.input_mode === '直接发送') {
        triggerSlash(`/send ${content} || /trigger`);
      } else if (option_section.option.input_mode === '覆盖输入') {
        triggerSlash(`/setinput ${content}`);
      } else if (option_section.option.input_mode === '尾附输入') {
        const old_content = $('#send_textarea').val();
        $('#send_textarea')
          .val([old_content, content].join('\n') || '')[0]
          .dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }

  let style: string;

  async function extract_style(): Promise<string> {
    const entries = (await getLorebookEntries(lorebook_name)).filter(
      entry => entry.comment.startsWith('选择框样式-') && entry.enabled,
    );
    if (entries.length === 0) {
      return `<style>${default_css}</style>`;
    }
    return entries[0].content;
  }

  export async function update(): Promise<boolean> {
    const old_style = style;
    style = await extract_style();
    return !_.isEqual(style, old_style);
  }

  export function extract_options_element(text: string): JQuery<HTMLDivElement> {
    const $div = $('<div class="roleplay_options">') as JQuery<HTMLDivElement>;
    $div.append(style);
    $div.append(
      ($('<div class="roleplay_options_back">') as JQuery<HTMLDivElement>).append(
        [...text.matchAll(/(.+?)[:：]\s*(.+)/gm)]
          .map(match => ({
            title: match[1],
            content: match[2].replace(/^\$\{(.+)\}$/, '$1').replace(/^「(.+)」$/, '$1'),
          }))
          .map(({ title, content }) =>
            $('<div class="roleplay_options_item" tabindex="1">')
              .on('click', function (this: HTMLDivElement) {
                divclick($(this));
              })
              .append(`<span class="roleplay_options_title"><strong>${title}</strong></span>`)
              .append('<hr class="roleplay_options_hr">')
              .append(`<span class="roleplay_options_content">${content}</span>`),
          ),
      ),
    );
    return $div;
  }
}

//----------------------------------------------------------------------------------------------------------------------
async function renderOneMessage(message_id: number) {
  const message: string = getChatMessages(message_id)[0].message;
  const match = message.match(roleplay_options_regex);
  if (!match) {
    return;
  }
  const $roleplay_options_element = render_section.extract_options_element(match[2]);

  const $mes_text = retrieveDisplayedMessage(message_id);
  const to_render = $mes_text.find(`.roleplay_options, pre:contains("${roleplay_options_tag}")`);
  if (to_render.length > 0) {
    to_render.remove();
    $mes_text.append($roleplay_options_element);
  }
}

async function renderAllMessage() {
  $('#chat')
    .children(".mes[is_user='false'][is_system='false']")
    .each((_index, node) => {
      renderOneMessage(Number(node.getAttribute('mesid')));
    });
}

$(async () => {
  await errorCatched(option_section.update)();
  await errorCatched(render_section.update)();
  await renderAllMessage();
  eventOn(tavern_events.CHAT_CHANGED, errorCatched(renderAllMessage));
  eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, errorCatched(renderOneMessage));
  eventOn(tavern_events.MESSAGE_UPDATED, errorCatched(renderOneMessage));
  eventOn(tavern_events.MESSAGE_SWIPED, errorCatched(renderOneMessage));
  eventOn(tavern_events.MESSAGE_DELETED, () => setTimeout(errorCatched(renderAllMessage), 1000));
  eventOn(
    tavern_events.WORLDINFO_UPDATED,
    errorCatched(async lorebook => {
      if (lorebook !== lorebook_name) {
        return;
      }
      if (!(await option_section.update()) && !(await render_section.update())) {
        return;
      }
      await renderAllMessage();
    }),
  );
});
