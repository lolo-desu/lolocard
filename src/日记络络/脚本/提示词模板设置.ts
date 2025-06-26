export {};

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
