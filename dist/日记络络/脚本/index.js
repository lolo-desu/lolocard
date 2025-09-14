import "https://testingcf.jsdelivr.net/gh/MagicalAstrogy/MagVarUpdate@master/artifact/bundle.js";

;// ./src/日记络络/脚本/按钮.ts
async function delete_qr() {
    const qrs = JSON.parse(await triggerSlash('/qr-set-list'));
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
        放学后: "先描写结束当前场景的剧情再快速将时间调整到下个放学后\n<UpdateVariable>\n_.set('世界.当前时间阶段', 49);\n</UpdateVariable>",
        夜间: "先描写结束当前场景的剧情再快速将时间调整到下个夜间\n<UpdateVariable>\n_.set('世界.当前时间阶段', 66);\n</UpdateVariable>",
        假日: "先描写结束当前场景的剧情再快速将时间调整到下个假日\n<UpdateVariable>\n_.set('世界.当前时间阶段', 83);\n</UpdateVariable>",
        第二天: "先描写结束当前场景的剧情再快速将时间调整到第二天，并调整当前时间阶段变量到接下来故事情节最有意义的时间，下一次响应的时间阶段变量调整没有任何限制\n<UpdateVariable>\n_.set('世界.当前时间阶段', 1);\n</UpdateVariable>",
    };
    const time = await triggerSlash(`/buttons labels=${JSON.stringify(Object.keys(data))} 时间来到了...`);
    if (!_.has(data, time)) {
        return;
    }
    await triggerSlash(`/send ${data[time]} || /trigger`);
}
async function handle_地点() {
    const data = {
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
    triggerSlash(`/send <!--于本次响应需要描写结束当前场景的剧情再写出理由前往下一个地点-->[移动] {{user}}前往了${subplace}\n<UpdateVariable>\n_.set('世界.下次响应界面选择判断', 0);\n</UpdateVariable> || /trigger`);
}
function handle_计数() {
    console.log('📊计数');
    triggerSlash(`/ejs 上次发送了：<%- variables.LAST_SEND_TOKENS %> 词符(tokens), 共计 <%- variables.LAST_SEND_CHARS %> 字符。<br/>收到的消息处理后：<%- variables.LAST_RECEIVE_TOKENS %> 词符(tokens), 共计 <%- variables.LAST_RECEIVE_CHARS %> 字符。 | /popup <h4>提示词计数</h4><br>{{pipe}}`);
}
$(() => {
    delete_qr();
    eventOnButton('🕛度过', handle_度过);
    eventOnButton('🗺️地点', handle_地点);
    eventOnButton('📊计数', handle_计数);
});


;// ./src/日记络络/脚本/调整世界书全局设置.ts
$(() => {
    sync_lorebook_settings();
});
async function sync_lorebook_settings() {
    const EXPECTED_SETTINGS = {
        scan_depth: 2,
        context_percentage: 100,
        budget_cap: 0,
        min_activations: 0,
        max_depth: 0,
        max_recursion_steps: 0,
        insertion_strategy: 'character_first',
        include_names: false,
        recursive: true,
        case_sensitive: false,
        match_whole_words: false,
        use_group_scoring: false,
        overflow_alert: false,
    };
    const settings = getLorebookSettings();
    if (!_.isEqual(_.merge({}, settings, EXPECTED_SETTINGS), settings)) {
        setLorebookSettings(EXPECTED_SETTINGS);
    }
}


;// ./src/日记络络/脚本/提示词模板设置.ts
$(() => {
    EjsTemplate.setFeatures({
        enabled: true,
        generate_enabled: true,
        generate_loader_enabled: false,
        render_enabled: false,
        render_loader_enabled: false,
        code_blocks_enabled: false,
        raw_message_evaluation_enabled: false,
        filter_message_enabled: false,
        world_active_enabled: false,
        autosave_enabled: false,
        preload_worldinfo_enabled: false,
        debug_enabled: false,
        cache_enabled: true,
    });
});


;// ./src/日记络络/脚本/性别设置.ts
const lorebook_name = '上锁的日记本';
async function get_gender_option() {
    const options = (await getLorebookEntries(lorebook_name))
        .filter(entry => entry.comment.startsWith('性别设置-') && entry.enabled)
        .map(entry => entry.comment.replace('性别设置-', ''));
    if (options.length === 0) {
        return '男';
    }
    return options[0];
}
async function set_gender_on_message(gender, message_id) {
    const variables = getVariables({ type: 'message', message_id });
    _.set(variables, substitudeMacros('stat_data.<user>.性别'), gender);
    await replaceVariables(variables, { type: 'message', message_id });
}
$(async () => {
    eventOn(tavern_events.MESSAGE_SENT, async (message_id) => {
        if (message_id === 1) {
            const gender = await get_gender_option();
            await set_gender_on_message(gender, 0);
            await set_gender_on_message(gender, 1);
        }
    });
});


;// ./src/日记络络/脚本/选择框默认样式.css?raw
const _raw_namespaceObject = "*{-webkit-tap-highlight-color:transparent}.roleplay_options_hr{display:none}.roleplay_options_back{background:#fff0f3;border-radius:16px;box-shadow:0 8px 20px rgba(145,125,138,0.15);padding:22px 24px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;border:1px solid #ffe5ea;width:90%;max-width:740px;margin:24px auto}.roleplay_options_item{position:relative;background:#fffafb;border-radius:12px;box-shadow:0 5px 15px rgba(145,125,138,0.1);padding:18px 20px;cursor:default;border:1px solid #ffe5ea;transition:all 0.28s cubic-bezier(0.22,1,0.36,1);overflow:hidden;display:flex;flex-direction:column;z-index:1;margin:0;color:#7d6b6e;font-weight:400;line-height:1.6;height:100%;font-family:'Microsoft YaHei',Arial,sans-serif}.last_mes .roleplay_options_item{cursor:pointer}.last_mes .roleplay_options_item::after{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(140deg,transparent 0%,transparent 50%,rgba(255,204,214,0.15) 150%);opacity:0;transition:opacity 0.35s ease;z-index:-1}.last_mes .roleplay_options_item:hover{transform:translateY(-4px);box-shadow:0 8px 24px rgba(145,125,138,0.2);background:#fff5f7;border-color:rgba(255,204,214,0.3)}.last_mes .roleplay_options_item:hover::after{opacity:1}.last_mes .roleplay_options_item:hover .roleplay_options_content{color:#635759}.last_mes .roleplay_options_item:active{transform:translateY(-2px);box-shadow:0 4px 12px rgba(145,125,138,0.1)}.roleplay_options_item:before{content:'';position:absolute;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,#ffd0d8,#ffbbc8);transform:scaleX(0);transform-origin:0 0;transition:transform 0.35s cubic-bezier(0.4,0,0.2,1)}.last_mes .roleplay_options_item:hover:before{transform:scaleX(1)}.roleplay_options_title{font-size:0.95em;font-weight:600;color:#7d6b6e;margin-bottom:12px;letter-spacing:0.04em;text-align:left;padding-bottom:10px;border-bottom:1px solid rgba(200,200,200,0.3);text-shadow:0 1px 1px rgba(255,255,255,0.5);line-height:1.4;position:relative;display:flex;align-items:center}.roleplay_options_title::before{content:'';display:inline-block;width:6px;height:6px;background:#ffd0d8;border-radius:50%;margin-right:10px;box-shadow:0 0 0 2px rgba(255,204,214,0.2)}.roleplay_options_content{font-size:0.95em;line-height:1.65;color:#8e7478;font-weight:normal;transition:color 0.25s ease;text-align:left;flex:1;text-shadow:0 1px 1px rgba(255,255,255,0.5);letter-spacing:0.018em}.roleplay_options_item.selected{background:rgba(255,235,240,0.7);border-color:rgba(255,204,214,0.5)}.roleplay_options_item.selected:before{background:linear-gradient(90deg,#ffd0d8,#ffbbc8);transform:scaleX(1)}.roleplay_options_item.selected .roleplay_options_title::before{background:#ffd0d8;box-shadow:0 0 0 2px rgba(255,204,214,0.3)}@media (max-width:999px){.roleplay_options_back{padding:18px;gap:14px;grid-template-columns:1fr;width:100%;max-width:none;margin:24px 0;background:#fff0f3;border:1px solid #ffe5ea}.roleplay_options_item{padding:16px;background:#fffafb;border:1px solid #ffe5ea}.roleplay_options_title{font-size:0.9em;padding-bottom:8px;margin-bottom:10px}.roleplay_options_content{font-size:0.92em;line-height:1.6}}@media (prefers-reduced-motion:reduce){.roleplay_options_item,.roleplay_options_item::before,.roleplay_options_item::after,.roleplay_options_content,.roleplay_options_title{transition:none}}\n";
;// ./src/日记络络/脚本/选择框.ts

const _lorebook_name = '上锁的日记本';
const roleplay_options_tag = '<roleplay_options>';
const roleplay_options_regex = /<roleplay_options>\s*(?:```.*\n)?([\s\S]*?)(?:\n```)?\s*<\/roleplay_options>/im;
//----------------------------------------------------------------------------------------------------------------------
var option_section;
(function (option_section) {
    const default_option = {
        input_mode: '直接发送',
    };
    async function parse_option() {
        const options = _.merge({}, ...(await getLorebookEntries(_lorebook_name))
            .filter(entry => entry.comment.startsWith('选择框设置-') && entry.enabled)
            .map(entry => {
            const value = entry.comment.replace('选择框设置-', '');
            return { [value]: entry.content };
        }));
        const result = default_option;
        if (_.has(options, '直接发送')) {
            result.input_mode = '直接发送';
        }
        else if (_.has(options, '覆盖输入')) {
            result.input_mode = '覆盖输入';
        }
        else if (_.has(options, '尾附输入')) {
            result.input_mode = '尾附输入';
        }
        return result;
    }
    async function update() {
        const old_option = option_section.option;
        option_section.option = await parse_option();
        return !_.isEqual(option_section.option, old_option);
    }
    option_section.update = update;
})(option_section || (option_section = {}));
//----------------------------------------------------------------------------------------------------------------------
var render_section;
(function (render_section) {
    async function divclick($element) {
        if ($element.parents('.last_mes').length > 0) {
            const content = $element.find('.roleplay_options_content').text().trim();
            if (option_section.option.input_mode === '直接发送') {
                triggerSlash(`/send ${content} || /trigger`);
            }
            else if (option_section.option.input_mode === '覆盖输入') {
                triggerSlash(`/setinput ${content}`);
            }
            else if (option_section.option.input_mode === '尾附输入') {
                const old_content = $('#send_textarea').val();
                $('#send_textarea')
                    .val([old_content, content].join('\n') || '')[0]
                    .dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }
    let style;
    async function extract_style() {
        const entries = (await getLorebookEntries(_lorebook_name)).filter(entry => entry.comment.startsWith('选择框样式-') && entry.enabled);
        if (entries.length === 0) {
            return `<style>${_raw_namespaceObject}</style>`;
        }
        return entries[0].content;
    }
    async function update() {
        const old_style = style;
        style = await extract_style();
        return !_.isEqual(style, old_style);
    }
    render_section.update = update;
    function extract_options_element(text) {
        const $div = $('<div class="roleplay_options">');
        $div.append(style);
        $div.append($('<div class="roleplay_options_back">').append([...text.matchAll(/(.+?)[:：]\s*(.+)/gm)]
            .map(match => ({
            title: match[1],
            content: match[2].replace(/^\$\{(.+)\}$/, '$1').replace(/^「(.+)」$/, '$1'),
        }))
            .map(({ title, content }) => $('<div class="roleplay_options_item" tabindex="1">')
            .on('click', function () {
            divclick($(this));
        })
            .append(`<span class="roleplay_options_title"><strong>${title}</strong></span>`)
            .append('<hr class="roleplay_options_hr">')
            .append(`<span class="roleplay_options_content">${content}</span>`))));
        return $div;
    }
    render_section.extract_options_element = extract_options_element;
})(render_section || (render_section = {}));
//----------------------------------------------------------------------------------------------------------------------
async function renderOneMessage(message_id) {
    const message = getChatMessages(message_id)[0].message;
    const match = message.match(roleplay_options_regex);
    if (!match) {
        return;
    }
    const $roleplay_options_element = render_section.extract_options_element(match[1]);
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
    eventOn(tavern_events.WORLDINFO_UPDATED, errorCatched(async (lorebook) => {
        if (lorebook !== _lorebook_name) {
            return;
        }
        if (!(await option_section.update()) && !(await render_section.update())) {
            return;
        }
        await renderAllMessage();
    }));
});

;// ./src/日记络络/脚本/样式加载.ts
function get_style() {
    return _.get(getVariables({ type: 'script', script_id: getScriptId() }), '样式加载', '');
}
function extract_style_node(style) {
    return $('<style>').attr('id', `script_custom_style-${getScriptId()}`).text(style);
}
function reappend_styles(node) {
    const $head = $('head');
    $head.find(`#script_custom_style-${getScriptId()}`).remove();
    $head.append(node);
}
$(() => {
    const style = get_style();
    const style_node = extract_style_node(style);
    reappend_styles(style_node);
});


;// ./src/日记络络/脚本/资源预载.ts
function get_preloads() {
    return _.get(getVariables({ type: 'script', script_id: getScriptId() }), '资源预载', []);
}
function extract_preloads_node(preloads) {
    return $('<div>')
        .attr('id', `script_preload-${getScriptId()}`)
        .append(preloads.map(preload => $('<link>').attr('rel', 'preload').attr('href', preload).attr('as', 'image')));
}
function reappend_preloads(node) {
    const $head = $('head');
    $head.find(`#script_preload-${getScriptId()}`).remove();
    $head.append(node);
}
$(() => {
    const preloads = get_preloads();
    const preloads_node = extract_preloads_node(preloads);
    reappend_preloads(preloads_node);
});


;// ./src/日记络络/脚本/自动安装插件.ts
async function get_third_party_extension_names() {
    try {
        const response = await fetch('/api/extensions/discover');
        if (response.ok) {
            const extensions = await response.json();
            return extensions
                .filter(extension => extension.type !== 'system')
                .map(extension => extension.name.replace('third-party/', ''));
        }
        else {
            return [];
        }
    }
    catch (err) {
        console.error(err);
        return [];
    }
}
async function install_extension(url) {
    const request = await fetch('/api/extensions/install', {
        method: 'POST',
        headers: SillyTavern.getRequestHeaders(),
        body: JSON.stringify({
            url,
        }),
    });
    if (!request.ok) {
        const text = await request.text();
        toastr.warning(`${text || request.statusText}`, '扩展安装失败');
        console.error('扩展安装失败', request.status, request.statusText, text);
        return false;
    }
    const response = await request.json();
    toastr.success(`已成功安装由 '${response.author}' 编写的 '${response.display_name}' (版本 ${response.version})!`, '扩展安装成功');
    console.debug(`已成功将 '${response.display_name}' 安装到 ${response.extensionPath}`);
    return true;
}
$(() => {
    setTimeout(async () => {
        const extensions = Object.entries(_.get(getVariables({ type: 'script', script_id: getScriptId() }), '自动安装插件', {}))
            .map(([name, url]) => {
            let tag = url.replace(/(\.git|\/)$/, '');
            tag = tag.substring(tag.lastIndexOf('/') + 1);
            return {
                [tag]: {
                    name,
                    url,
                },
            };
        })
            .reduce((previous, current) => _.defaults(previous, current), {});
        const current_extensions = await get_third_party_extension_names();
        const uninstall_extension_tags = _.difference(Object.keys(extensions), current_extensions);
        if (uninstall_extension_tags.length === 0) {
            return;
        }
        if (!(await SillyTavern.callGenericPopup('以下需要的插件尚未安装, 是否安装?<br>' +
            uninstall_extension_tags.map(tag => `- ${extensions[tag].name}`).join('<br>'), SillyTavern.POPUP_TYPE.CONFIRM, '', { leftAlign: true }))) {
            return;
        }
        await Promise.allSettled(uninstall_extension_tags.map(tag => install_extension(extensions[tag].url)));
        setTimeout(() => triggerSlash('/reload-page'), 3000);
    }, 10000);
});


;// ./src/日记络络/脚本/最大化预设上下文长度.ts
function unlock_token_length() {
    const MAX_CONTEXT = 2000000;
    const settings = SillyTavern.chatCompletionSettings;
    if (settings.max_context_unlocked === true && settings.openai_max_context === MAX_CONTEXT) {
        return;
    }
    $('#oai_max_context_unlocked').prop('checked', true).trigger('input');
    $('#openai_max_context_counter').val(MAX_CONTEXT);
    $('#openai_max_context').val(MAX_CONTEXT).trigger('input');
}
const unlock_token_length_debounced = _.debounce(unlock_token_length, 1000);
$(() => {
    eventOn(tavern_events.SETTINGS_UPDATED, unlock_token_length_debounced);
});


;// external "https://testingcf.jsdelivr.net/gh/MagicalAstrogy/MagVarUpdate@master/artifact/bundle.js"

;// ./src/日记络络/脚本/mvu.ts


;// ./src/日记络络/脚本/index.ts











