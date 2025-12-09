function getCurrentVersion() {
  const globalAny = window as any;
  return (
    globalAny?.SillyTavern?.version ??
    globalAny?.APP_VERSION ??
    (globalAny?.SillyTavern?.get_version?.() ?? globalAny?.get_version?.()) ??
    '0.0.0'
  );
}

function compareVersions(lhs: string, rhs: string) {
  const lhsParts = lhs.split('.').map(part => Number(part) || 0);
  const rhsParts = rhs.split('.').map(part => Number(part) || 0);
  const length = Math.max(lhsParts.length, rhsParts.length);
  for (let index = 0; index < length; index += 1) {
    const left = lhsParts[index] ?? 0;
    const right = rhsParts[index] ?? 0;
    if (left === right) {
      continue;
    }
    return left > right ? 1 : -1;
  }
  return 0;
}

export function isDebugMode() {
  try {
    const win = window as any;
    if (win?.thVariableManagerDebug === true) {
      return true;
    }
    return localStorage.getItem('variable_manager_debug') === 'true';
  } catch {
    return false;
  }
}

export function checkMinimumVersion(minVersion: string, featureName: string) {
  const current = getCurrentVersion();
  if (compareVersions(current, minVersion) >= 0) {
    return true;
  }
  if (isDebugMode()) {
    console.warn(
      `[变量管理器] 当前 SillyTavern 版本 (${current}) 无法满足 ${featureName} 所需的最低版本 ${minVersion}`,
    );
  }
  toastr?.warning?.(`需要 ST ${minVersion}+ 才能正常使用 ${featureName}`, '版本过低');
  return false;
}

export function teleportStyle() {
  const scriptId = getScriptId();
  const wrapperSelector = `head > div[script_id="${scriptId}"]`;
  if ($(wrapperSelector).length > 0) {
    return;
  }

  const $wrapper = $('<div>').attr('script_id', scriptId);
  $('head > style', document).each((_, style) => {
    $wrapper.append($(style).clone());
  });
  $('head').append($wrapper);
}

export function deteleportStyle() {
  const scriptId = getScriptId();
  $(`head > div[script_id="${scriptId}"]`).remove();
}
