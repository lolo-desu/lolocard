export {};

$(() => {
  EjsTemplate.setFeatures({
      enabled: true,

      generate_enabled: true,
      generate_loader_enabled: true,
      inject_loader_enabled: true,

      render_enabled: false,
      render_loader_enabled: false,
      code_blocks_enabled: false,
      raw_message_evaluation_enabled: false,
      filter_message_enabled: false,
      depth_limit: -1,

      autosave_enabled: false,
      preload_worldinfo_enabled: false,
      with_context_disabled: false,
      debug_enabled: false,
      invert_enabled: true,
  });
});
