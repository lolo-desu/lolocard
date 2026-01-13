import type { Reactive, App as VueApp } from 'vue';
import { useConfigStore } from '../store';
import App from './App.vue';
import { Data } from './type';

const states: Map<number, { app: VueApp; data: Reactive<Data>; destroy: () => void }> = new Map();

const CLASS = 'mes_galgame' as const;

function injectStylesIntoIframe(document: Document) {
  const script_id = getScriptId();
  document.head.querySelector(`div[script_id="${script_id}"]`)?.remove();

  const container = document.createElement('div');
  container.setAttribute('script_id', script_id);

  for (const style of Array.from(window.document.head.querySelectorAll(':scope > style'))) {
    container.append(style.cloneNode(true));
  }

  document.head.append(container);
}

function destroy(message_id: number | string) {
  const numbered_message_id = Number(message_id);
  states.get(numbered_message_id)?.destroy();
  states.delete(numbered_message_id);
}

function destroyIfInvalid(message_id: number | string) {
  const numbered_message_id = Number(message_id);
  const min_message_id = Number($('#chat > .mes').first().attr('mesid'));
  const max_message_id = getLastMessageId();
  if (!_.inRange(numbered_message_id, min_message_id, max_message_id + 1)) {
    destroy(message_id);
  }
}

function destroyAllInvalid() {
  states.keys().forEach(message_id => destroyIfInvalid(message_id));
}

async function renderOneMessage(message_id: number | string, stream_message?: string) {
  const $message_element = $(`.mes[mesid='${message_id}']`);
  const numbered_message_id = Number($message_element.attr('mesid'));

  destroyIfInvalid(numbered_message_id);

  const message = stream_message ?? getChatMessages(numbered_message_id)[0].message ?? '';
  const matched = message.match(/<galgame>\s*```/im);
  if (!matched) {
    destroy(numbered_message_id);
    return;
  }

  const $mes_text = $message_element.find('.mes_text');
  $mes_text.addClass('hidden!');

  let $mes_galgame = $message_element.find(`.${CLASS}`) as JQuery<HTMLIFrameElement>;
  if ($mes_galgame.length > 0) {
    const state = states.get(numbered_message_id);
    if (state) {
      $mes_galgame.removeClass('hidden!');
      state.data.duringStreaming = Boolean(stream_message);
      state.data.message = message;
      return;
    }
  }

  destroy(numbered_message_id);

  $mes_galgame.remove();
  $mes_galgame = $(`<iframe class="${CLASS} w-full">`)
    .attr({
      id: `stream-${numbered_message_id}`,
      frameborder: 0,
      srcdoc: `<head>
<link rel="stylesheet" href="https://testingcf.jsdelivr.net/npm/@fortawesome/fontawesome-free/css/all.min.css"></link>
<script src="https://testingcf.jsdelivr.net/gh/n0vi028/JS-Slash-Runner/lib/tailwindcss.min.js"></script>
<script src="https://testingcf.jsdelivr.net/npm/jquery"></script>
<script src="https://testingcf.jsdelivr.net/npm/lodash"></script>
<script src="https://testingcf.jsdelivr.net/gh/n0vi028/JS-Slash-Runner/src/iframe/adjust_iframe_height.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;}
html,body{margin:0!important;padding:0;overflow:hidden!important;max-width:100%!important;}
</style>
</head>`,
    })
    .insertAfter($mes_text) as JQuery<HTMLIFrameElement>;

  const data = reactive(<Data>{
    messageId: numbered_message_id,
    message,
    duringStreaming: Boolean(stream_message),
    inputMethod: useConfigStore().config.选择框触发方式,
  });
  const app = createApp(App).provide('data', data).use(createPinia());
  $mes_galgame.on('load', function () {
    const document = this.contentDocument!;
    injectStylesIntoIframe(document);
    app.mount(document.body);
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

  states.set(numbered_message_id, {
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
      const message_id = $(node).attr('mesid');
      try {
        if (message_id) {
          renderOneMessage(parseInt(message_id));
        }
      } catch (error) {
        /** empty */
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
      const mesid = $('#chat').children('.mes.last_mes').attr('mesid');
      try {
        if (mesid) {
          renderOneMessage(parseInt(mesid), message);
        }
      } catch (error) {
        /** empty */
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
