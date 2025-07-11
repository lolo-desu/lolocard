export {};

const lorebook_name = '上锁的日记本' as const;

async function get_gender_option(): Promise<'男' | '女'> {
  const options = (await getLorebookEntries(lorebook_name))
    .filter(entry => entry.comment.startsWith('性别设置-') && entry.enabled)
    .map(entry => entry.comment.replace('性别设置-', ''));
  if (options.length === 0) {
    return '男';
  }
  return options[0] as '男' | '女';
}

async function set_gender_on_message(gender: '男' | '女', message_id: number) {
  const variables = getVariables({ type: 'message', message_id });
  _.set(variables, substitudeMacros('stat_data.<user>.性别'), gender);
  await replaceVariables(variables, { type: 'message', message_id });
}

$(async () => {
  eventOn(tavern_events.MESSAGE_SENT, async message_id => {
    if (message_id === 1) {
      const gender = await get_gender_option();
      await set_gender_on_message(gender, 0);
      await set_gender_on_message(gender, 1);
    }
  });
});
