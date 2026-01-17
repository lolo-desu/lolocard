import { createScriptIdDiv, createScriptIdIframe } from '@util/script';
import type { Reactive, App as VueApp } from 'vue';
import { useConfigStore } from '../store';
import App from './App.vue';
import { Data } from './type';

const states: Map<number, { app: VueApp; data: Reactive<Data>; destroy: () => void }> = new Map();

const CLASS = 'mes_galgame' as const;

function destroy(message_id: number) {
  states.get(message_id)?.destroy();
  states.delete(message_id);
}

function destroyIfInvalid(message_id: number) {
  const min_message_id = Number($('#chat > .mes').first().attr('mesid'));
  const max_message_id = getLastMessageId();
  if (!_.inRange(message_id, min_message_id, max_message_id + 1)) {
    destroy(message_id);
  }
}

function destroyAllInvalid() {
  states.keys().forEach(message_id => destroyIfInvalid(message_id));
}

async function renderOneMessage(message_id: number, stream_message?: string) {
  const $message_element = $(`.mes[mesid='${message_id}']`);

  destroyIfInvalid(message_id);

  const message = stream_message ?? getChatMessages(message_id)[0].message ?? '';
  const matched = message.match(/<galgame>\s*```/im);
  if (!matched) {
    destroy(message_id);
    return;
  }

  const $mes_text = $message_element.find('.mes_text');
  $mes_text.addClass('hidden!');

  let $mes_galgame = $message_element.find(`.${CLASS}`) as JQuery<HTMLDivElement>;
  if ($mes_galgame.length > 0) {
    const state = states.get(message_id);
    if (state) {
      const $iframe = $mes_galgame.find('iframe');

      const before_galgame = message.indexOf('<galgame>');
      if (before_galgame !== -1) {
        $iframe.prevAll().remove();
        const $before = $(
          formatAsDisplayedMessage(message.slice(0, before_galgame).trim(), {
            message_id: message_id,
          }),
        );
        $before.find('pre:contains("<body")').remove();
        $iframe.before($before);
      }

      state.data.duringStreaming = Boolean(stream_message);
      state.data.message = message;

      const after_galgame = message.lastIndexOf('</galgame>');
      if (after_galgame !== -1) {
        $iframe.nextAll().remove();
        const $after = $(
          formatAsDisplayedMessage(
            message
              .slice(after_galgame + 10)
              .replace(/<(roleplay_options)>(?:(?!.*<\/\1>)(?:(?!<\1>).)*$|(?:(?!<\1>).)*<\/\1?>)/, '')
              .trim(),
            {
              message_id: message_id,
            },
          ),
        );
        $after.find('pre:contains("<body")').remove();
        $iframe.after($after);
      }

      $mes_galgame.removeClass('hidden!');
      return;
    }
  }

  destroy(message_id);

  $mes_galgame.remove();
  $mes_galgame = createScriptIdDiv()
    .addClass(`${CLASS} w-full`)
    .attr('id', `stream-${message_id}`)
    .insertAfter($mes_text);
  const before_galgame = message.indexOf('<galgame>');
  if (before_galgame !== -1) {
    const $before = $(
      formatAsDisplayedMessage(message.slice(0, before_galgame).trim(), { message_id: message_id }),
    );
    $before.find('pre:contains("<body")').remove();
    $mes_galgame.append($before);
  }
  const $iframe = createScriptIdIframe().addClass('w-full').appendTo($mes_galgame);
  const after_galgame = message.indexOf('</galgame>');
  if (after_galgame !== -1) {
    const $after = $(
      formatAsDisplayedMessage(
        message
          .slice(after_galgame + 10)
          .replace(/<(roleplay_options)>(?:(?!.*<\/\1>)(?:(?!<\1>).)*$|(?:(?!<\1>).)*<\/\1?>)/gis, '')
          .trim(),
        {
          message_id: message_id,
        },
      ),
    );
    $after.find('pre:contains("<body")').remove();
    $mes_galgame.append($after);
  }

  const data = reactive(<Data>{
    messageId: message_id,
    message,
    duringStreaming: Boolean(stream_message),
    inputMethod: useConfigStore().config.选择框触发方式,
  });
  const app = createApp(App).provide('data', data).use(createPinia());
  $iframe.on('load', function () {
    app.mount(this.contentDocument!.body);
  });

  const observer = new MutationObserver(() => {
    const $edit_textarea = $('#curEditTextarea');
    if ($edit_textarea.parent().is($mes_text)) {
      $mes_text.removeClass('hidden!');
      $mes_galgame.addClass('hidden!');
    }
  });

  observer.observe($mes_text[0] as HTMLElement, { childList: true, subtree: true, characterData: true });

  const stop = watch(
    () => useConfigStore().config.选择框触发方式,
    new_input_method => {
      data.inputMethod = new_input_method;
    },
  );

  states.set(message_id, {
    app,
    data,
    destroy: () => {
      $mes_text.removeClass('hidden!');
      app.unmount();
      $mes_galgame.remove();
      observer.disconnect();
      stop();
    },
  });
}

async function renderAllMessage() {
  destroyAllInvalid();

  $('#chat')
    .children(".mes[is_user='false'][is_system='false']")
    .each((_index, node) => {
      const message_id = Number($(node).attr('mesid') ?? 'NaN');
      if (!isNaN(message_id)) {
        renderOneMessage(message_id);
      }
    });
}

export function initGalgame() {
  renderAllMessage();
  eventOn(
    tavern_events.CHAT_CHANGED,
    errorCatched(() => renderAllMessage()),
  );
  eventOn(
    tavern_events.CHARACTER_MESSAGE_RENDERED,
    errorCatched(message_id => renderOneMessage(message_id)),
  );
  eventOn(
    tavern_events.MESSAGE_UPDATED,
    errorCatched(message_id => renderOneMessage(message_id)),
  );
  eventOn(
    tavern_events.MESSAGE_SWIPED,
    errorCatched(message_id => {
      destroy(message_id);
      renderOneMessage(message_id);
    }),
  );
  eventOn(tavern_events.MESSAGE_DELETED, () => setTimeout(errorCatched(renderAllMessage), 1000));
  eventOn(
    tavern_events.STREAM_TOKEN_RECEIVED,
    errorCatched(message => {
      const message_id = Number($('#chat').children('.mes.last_mes').attr('mesid') ?? 'NaN');
      if (!isNaN(message_id)) {
        renderOneMessage(message_id, message);
      }
    }),
  );

  return {
    destroy: () => {
      $('.mes_text').removeClass('hidden!');

      states.forEach(({ destroy }) => destroy());
      states.clear();
      $(`.${CLASS}`).remove();
    },
  };
}
