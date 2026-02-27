const DOWNLOAD_ID = 'download-bg-jpeg';
const FORM_ID = 'bg-generator-form';
const PREVIEW_SIZE = 150;

const DEFAULT_CONFIG = {
  width: 2000,
  height: 2000,
  bg: '#000000',
  fg: '#ffffff',
  opacity: 0.3,
  cell: 36,
  fontSize: 36,
  angle: -15,
  quality: 1,
  seed: Date.now()
};

const RENDER_BATCH_ROWS = 6;

const ICONS = [
  'grid_view', 'memory', 'cpu', 'router', 'dns', 'settings',
  'code', 'terminal', 'data_object', 'webhook', 'link',
  'lock', 'security', 'fingerprint', 'verified_user',
  'visibility', 'language', 'schedule', 'build', 'extension',
  'dashboard', 'integration_instructions', 'password', 'api',
  'cloud', 'storage', 'public', 'domain', 'hub',
  'bolt', 'bug_report', 'engineering', 'smart_toy', 'science',
  'rocket_launch', 'precision_manufacturing', 'model_training', 'dataset',
  'insights', 'monitoring', 'analytics', 'query_stats', 'troubleshoot',
  'lan', 'device_hub', 'devices', 'memory_alt', 'developer_board',
  'computer', 'laptop', 'phone_android', 'tablet_android', 'desktop_windows',
  'terminal', 'schema', 'token', 'key', 'vpn_key',
  'shield', 'admin_panel_settings', 'gpp_good', 'verified', 'fact_check',
  'cloud_done', 'cloud_sync', 'cloud_queue', 'backup', 'sync',
  'dns', 'http', 'language', 'travel_explore', 'explore',
  'code_blocks', 'polyline', 'account_tree', 'fork_right', 'join_full',
  'build_circle', 'extension', 'widgets', 'apps', 'tune',
  'auto_awesome', 'flare', 'stars', 'lightbulb', 'psychology',
  'assistant', 'robot_2', 'neurology', 'biotech', 'mediation',
  'psychology_alt', 'tips_and_updates', 'emoji_objects', 'architecture', 'construction',
  'handyman', 'rule', 'square_foot', 'design_services', 'brush',
  'palette', 'format_paint', 'draw', 'edit', 'edit_note',
  'terminal', 'developer_mode', 'data_thresholding', 'lan', 'settings_ethernet',
  'settings_input_antenna', 'settings_remote', 'settings_suggest', 'settings_applications', 'settings_system_daydream',
  'bluetooth', 'wifi', 'signal_cellular_alt', 'network_check', 'network_ping',
  'sensors', 'sensors_off', 'radar', 'satellite_alt', 'gps_fixed',
  'my_location', 'location_searching', 'route', 'map', 'map_search',
  'pin_drop', 'place', 'travel_explore', 'explore_off', 'near_me',
  'flight', 'directions_boat', 'directions_bus', 'directions_car', 'directions_transit',
  'electric_bolt', 'battery_charging_full', 'power', 'power_settings_new', 'offline_bolt',
  'electric_meter', 'monitor_heart', 'speed', 'timer', 'hourglass_top',
  'alarm', 'watch_later', 'today', 'event', 'event_available',
  'event_note', 'calendar_month', 'history', 'update', 'autorenew',
  'sync_alt', 'cloud_upload', 'cloud_download', 'downloading', 'upload_file',
  'download_done', 'folder', 'folder_open', 'drive_folder_upload', 'topic',
  'description', 'article', 'snippet_folder', 'request_quote', 'feed',
  'inventory_2', 'fact_check', 'check_circle', 'task_alt', 'done_all',
  'pending', 'error', 'warning', 'notification_important', 'report_problem',
  'shield_moon', 'policy', 'privacy_tip', 'lock_person', 'no_encryption',
  'encrypted', 'enhanced_encryption', 'passkey', 'key_off', 'password',
  'badge', 'verified', 'verified_user', 'how_to_reg', 'person',
  'groups', 'hub', 'share', 'ios_share', 'forward_to_inbox',
  'send', 'outbox', 'mark_email_read', 'alternate_email', 'contact_support',
  'support_agent', 'help', 'help_center', 'forum', 'chat',
  'question_answer', 'smart_button', 'ads_click', 'touch_app', 'swipe',
  'gesture', 'pan_tool', 'mouse', 'keyboard', 'keyboard_command_key',
  'keyboard_option_key', 'space_bar', 'backspace', 'subdirectory_arrow_left', 'subdirectory_arrow_right',
  'open_in_new', 'open_in_browser', 'launch', 'link_off', 'qr_code',
  'qr_code_scanner', 'document_scanner', 'scanner', 'print', 'receipt_long',
  'storefront', 'shopping_cart', 'shopping_bag', 'payments', 'account_balance_wallet',
  'credit_card', 'savings', 'trending_up', 'trending_down', 'show_chart',
  'stacked_line_chart', 'pie_chart', 'bar_chart', 'leaderboard', 'timeline',
  'monitor', 'tv', 'videocam', 'photo_camera', 'camera',
  'image', 'imagesearch_roller', 'filter_center_focus', 'crop_free', 'center_focus_strong',
  'mic', 'mic_none', 'graphic_eq', 'hearing', 'record_voice_over',
  'podcasts', 'radio', 'album', 'library_music', 'music_note',
  'movie', 'theaters', 'live_tv', 'subscriptions', 'slow_motion_video',
  'web', 'web_asset', 'html', 'javascript', 'css',
  'database', 'storage', 'table_chart', 'view_quilt', 'view_sidebar',
  'view_agenda', 'view_compact', 'view_stream', 'apps_outage', 'deployed_code',
  'terminal', 'dns', 'settings', 'api', 'integration_instructions',
  'ac_unit', 'access_alarm', 'access_alarms', 'access_time', 'accessibility',
  'accessible', 'account_balance', 'account_balance_wallet', 'account_box', 'account_circle',
  'adb', 'add_alert', 'add_box', 'add_circle', 'add_circle_outline',
  'add_location', 'add_photo_alternate', 'add_reaction', 'add_task', 'add_to_home_screen',
  'add_to_photos', 'add_to_queue', 'air', 'airline_seat_flat', 'airline_seat_individual_suite',
  'airline_stops', 'airplanemode_active', 'airplanemode_inactive', 'airport_shuttle', 'alarm_add',
  'alarm_off', 'alarm_on', 'all_inbox', 'all_inclusive', 'all_out',
  'alt_route', 'amp_stories', 'analytics', 'anchor', 'android',
  'animation', 'announcement', 'aod', 'apartment', 'app_blocking',
  'app_registration', 'approval', 'apps', 'architecture', 'archive',
  'arrow_back', 'arrow_back_ios', 'arrow_circle_down', 'arrow_circle_left', 'arrow_circle_right',
  'arrow_circle_up', 'arrow_downward', 'arrow_drop_down', 'arrow_drop_up', 'arrow_forward',
  'arrow_outward', 'arrow_right_alt', 'arrow_upward', 'article', 'aspect_ratio',
  'assessment', 'assignment', 'assignment_ind', 'assignment_late', 'assignment_return',
  'assignment_turned_in', 'assistant_direction', 'assistant_navigation', 'assistant_photo', 'atm',
  'attach_email', 'attach_file', 'attach_money', 'attachment', 'audiotrack',
  'auto_delete', 'auto_fix_high', 'auto_fix_normal', 'auto_graph', 'auto_stories',
  'autofps_select', 'autorenew', 'av_timer', 'baby_changing_station', 'back_hand',
  'backpack', 'backup_table', 'badge', 'bakery_dining', 'balance',
  'ballot', 'bar_chart', 'batch_prediction', 'bathroom', 'bathtub',
  'battery_0_bar', 'battery_1_bar', 'battery_2_bar', 'battery_3_bar', 'battery_4_bar',
  'battery_5_bar', 'battery_6_bar', 'battery_alert', 'battery_full', 'battery_saver',
  'beach_access', 'bed', 'bedroom_baby', 'bedroom_child', 'bedroom_parent',
  'beenhere', 'bento', 'bike_scooter', 'biotech', 'blender',
  'blind', 'block', 'bloodtype', 'bluetooth_audio', 'bluetooth_connected',
  'bluetooth_disabled', 'bluetooth_drive', 'bolt', 'book', 'book_online',
  'bookmark', 'bookmark_add', 'bookmark_border', 'bookmark_remove', 'bookmarks',
  'border_all', 'border_bottom', 'border_clear', 'border_color', 'border_horizontal',
  'border_inner', 'border_left', 'border_outer', 'border_right', 'border_style',
  'border_top', 'border_vertical', 'boy', 'branding_watermark', 'breakfast_dining',
  'brightness_1', 'brightness_2', 'brightness_3', 'brightness_4', 'brightness_5',
  'brightness_6', 'brightness_7', 'brightness_auto', 'brightness_high', 'brightness_low',
  'broadcast_on_home', 'broadcast_on_personal', 'browser_not_supported', 'brunch_dining', 'bubble_chart',
  'bug_report', 'build', 'build_circle', 'bungalow', 'burst_mode',
  'bus_alert', 'business', 'business_center', 'cabin', 'cable',
  'cached', 'cake', 'calculate', 'calendar_today', 'call',
  'call_end', 'call_made', 'call_merge', 'call_missed', 'call_missed_outgoing',
  'call_received', 'call_split', 'call_to_action', 'camera_alt', 'camera_enhance',
  'camera_front', 'camera_indoor', 'camera_outdoor', 'camera_rear', 'camera_roll',
  'campaign', 'cancel', 'cancel_presentation', 'cancel_schedule_send', 'candlestick_chart',
  'car_crash', 'card_giftcard', 'card_membership', 'card_travel', 'carpenter',
  'cases', 'casino', 'cast', 'cast_connected', 'castle',
  'catching_pokemon', 'category', 'celebration', 'cell_tower', 'center_focus_weak',
  'chair', 'chair_alt', 'chalet', 'change_circle', 'change_history',
  'charging_station', 'chat_bubble', 'chat_bubble_outline', 'check', 'check_box',
  'check_box_outline_blank', 'checkroom', 'chevron_left', 'chevron_right', 'child_care',
  'child_friendly', 'chrome_reader_mode', 'church', 'circle_notifications', 'class',
  'clean_hands', 'cleaning_services', 'clear', 'clear_all', 'close',
  'close_fullscreen', 'closed_caption', 'cloud_circle', 'cloud_off', 'cloudy_snowing',
  'co2', 'code', 'code_off', 'coffee', 'coffee_maker',
  'collections', 'collections_bookmark', 'color_lens', 'colorize', 'comment',
  'comment_bank', 'comments_disabled', 'commit', 'commute', 'compare',
  'compare_arrows', 'compass_calibration', 'compost', 'compress', 'computer',
  'confirmation_num', 'connect_without_contact', 'construction', 'contact_mail', 'contact_page',
  'contact_phone', 'contactless', 'contacts', 'content_copy', 'content_cut',
  'content_paste', 'content_paste_go', 'content_paste_search', 'contrast', 'control_camera',
  'control_point', 'control_point_duplicate', 'cookie', 'copy_all', 'copyright',
  'coronavirus', 'corporate_fare', 'cottage', 'countertops', 'create',
  'create_new_folder', 'credit_card_off', 'credit_score', 'crib', 'crisis_alert',
  'crop', 'crop_16_9', 'crop_3_2', 'crop_5_4', 'crop_7_5',
  'crop_din', 'crop_landscape', 'crop_original', 'crop_portrait', 'crop_rotate',
  'crop_square', 'cruelty_free', 'css', 'currency_bitcoin', 'currency_exchange',
  'currency_pound', 'currency_ruble', 'currency_rupee', 'currency_yen', 'curtains',
  'cycle', 'dangerous', 'dark_mode', 'dashboard_customize', 'data_array',
  'data_exploration', 'data_object', 'data_saver_off', 'data_saver_on', 'data_usage',
  'dataset_linked', 'deblur', 'deck', 'dehaze', 'delete',
  'delete_forever', 'delete_outline', 'delete_sweep', 'delivery_dining', 'density_large',
  'density_medium', 'density_small', 'departure_board', 'description', 'deselect',
  'design_services', 'desk', 'desktop_access_disabled', 'desktop_mac', 'desktop_windows',
  'details', 'developer_board_off', 'developer_mode', 'device_hub', 'device_thermostat',
  'devices_fold', 'devices_other', 'dialer_sip', 'dialpad', 'diamond',
  'difference', 'dining', 'dinner_dining', 'directions', 'directions_bike',
  'directions_railway', 'directions_run', 'directions_subway', 'directions_walk', 'dirty_lens',
  'disabled_by_default', 'disabled_visible', 'disc_full', 'discount', 'display_settings',
  'diversity_1', 'diversity_2', 'diversity_3', 'dnd_forwardslash', 'dns',
  'do_disturb', 'do_disturb_alt', 'do_disturb_off', 'do_not_disturb', 'do_not_disturb_alt',
  'do_not_disturb_off', 'do_not_disturb_on', 'do_not_step', 'do_not_touch', 'dock',
  'document_scanner', 'domain_add', 'domain_disabled', 'domain_verification', 'done',
  'done_outline', 'donut_large', 'donut_small', 'door_back', 'door_front',
  'door_sliding', 'doorbell', 'double_arrow', 'downhill_skiing', 'download',
  'download_for_offline', 'downloading', 'drafts', 'drag_handle', 'drag_indicator',
  'draw', 'drive_eta', 'drive_file_move', 'drive_file_rename_outline', 'drive_folder_upload',
  'dry', 'dry_cleaning', 'duo', 'dynamic_feed', 'dynamic_form',
  'e_mobiledata', 'earbuds', 'earbuds_battery', 'east', 'eco',
  'edgesensor_high', 'edgesensor_low', 'edit_attributes', 'edit_calendar', 'edit_location',
  'edit_location_alt', 'edit_road', 'egg', 'egg_alt', 'eject',
  'elderly', 'elderly_woman', 'electric_bike', 'electric_car', 'electric_moped',
  'electric_rickshaw', 'electric_scooter', 'electrical_services', 'elevator', 'email',
  'emergency', 'emergency_recording', 'emergency_share', 'emoji_emotions', 'emoji_food_beverage',
  'emoji_nature', 'emoji_people', 'emoji_symbols', 'emoji_transportation', 'engineering',
  'enhanced_encryption', 'equalizer', 'error_outline', 'escalator', 'escalator_warning',
  'euro', 'euro_symbol', 'ev_station', 'event_busy', 'event_repeat',
  'event_seat', 'exit_to_app', 'expand', 'expand_circle_down', 'expand_less',
  'expand_more', 'explicit', 'explore', 'explore_off', 'exposure',
  'exposure_neg_1', 'exposure_neg_2', 'exposure_plus_1', 'exposure_plus_2', 'exposure_zero',
  'extension_off', 'face', 'face_retouching_natural', 'fact_check', 'factory',
  'family_restroom', 'fast_forward', 'fast_rewind', 'fastfood', 'favorite',
  'favorite_border', 'fax', 'featured_play_list', 'featured_video', 'feed',
  'feedback', 'female', 'fence', 'festival', 'fiber_dvr',
  'fiber_manual_record', 'fiber_new', 'fiber_pin', 'fiber_smart_record', 'file_copy',
  'file_download', 'file_download_done', 'file_open', 'file_present', 'file_upload',
  'filter', 'filter_1', 'filter_2', 'filter_3', 'filter_4',
  'filter_5', 'filter_6', 'filter_7', 'filter_8', 'filter_9',
  'filter_9_plus', 'filter_alt', 'filter_alt_off', 'filter_b_and_w', 'filter_drama',
  'filter_frames', 'filter_hdr', 'filter_list', 'filter_none', 'filter_tilt_shift',
  'filter_vintage', 'find_in_page', 'find_replace', 'fingerprint', 'fire_extinguisher',
  'fire_hydrant', 'fire_truck', 'fireplace', 'first_page', 'fit_screen',
  'fitbit', 'fitness_center', 'flag', 'flag_circle', 'flaky',
  'flare', 'flash_auto', 'flash_off', 'flash_on', 'flashlight_off',
  'flashlight_on', 'flatware', 'flight_class', 'flight_land', 'flight_takeoff',
  'flip', 'flip_camera_android', 'flip_camera_ios', 'flip_to_back', 'flip_to_front',
  'flood', 'floor', 'floor_lamp', 'flutter_dash', 'fmd_bad',
  'fmd_good', 'folder_copy', 'folder_delete', 'folder_off', 'folder_shared',
  'folder_zip', 'follow_the_signs', 'font_download', 'font_download_off', 'food_bank',
  'forest', 'fork_left', 'fork_right', 'format_align_center', 'format_align_justify',
  'format_align_left', 'format_align_right', 'format_bold', 'format_clear', 'format_color_fill',
  'format_color_reset', 'format_color_text', 'format_indent_decrease', 'format_indent_increase', 'format_italic',
  'format_line_spacing', 'format_list_bulleted', 'format_list_numbered', 'format_list_numbered_rtl', 'format_overline',
  'format_paint', 'format_quote', 'format_shapes', 'format_size', 'format_strikethrough',
  'format_textdirection_l_to_r', 'format_textdirection_r_to_l', 'format_underlined', 'fort', 'forum',
  'forward', 'forward_10', 'forward_30', 'forward_5', 'forward_to_inbox',
  'foundation', 'free_breakfast', 'fullscreen', 'fullscreen_exit', 'functions',
  'g_mobiledata', 'g_translate', 'gamepad', 'games', 'garage',
  'gas_meter', 'gavel', 'generating_tokens', 'gesture', 'get_app'
];

const MAX_HISTORY = 12;
const colorHistoryBg = [];
const colorHistoryFg = [];

let currentConfig = { ...DEFAULT_CONFIG };
let previewCtx = null;
let pickerState = {
  target: 'bg-color',
  h: 0,
  s: 0,
  v: 0,
  alpha: DEFAULT_CONFIG.opacity
};
let previewSeed = null;

function resetPreviewSeed() {
  previewSeed = null;
}

function addToHistory(color, list, containerId) {
  const idx = list.indexOf(color);
  if (idx !== -1) list.splice(idx, 1);
  list.unshift(color);
  if (list.length > MAX_HISTORY) list.pop();
  renderHistory(list, containerId);
}

function renderHistory(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  list.forEach((hex) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'history-item';
    btn.title = hex;
    btn.style.background = hex;
    btn.addEventListener('click', () => {
      if (containerId === 'color-history-bg') {
        applyColors(hex, document.getElementById('fg-color')?.value || DEFAULT_CONFIG.fg);
      } else {
        applyColors(document.getElementById('bg-color')?.value || DEFAULT_CONFIG.bg, hex);
      }
      updatePreview();
    });
    container.appendChild(btn);
  });
}


function applyDefaults() {
  const setVal = (id, value) => {
    const el = document.getElementById(id);
    if (el instanceof HTMLInputElement) {
      el.value = String(value);
    }
  };

  setVal('bg-width', DEFAULT_CONFIG.width);
  setVal('bg-height', DEFAULT_CONFIG.height);
  setVal('bg-color', DEFAULT_CONFIG.bg);
  setVal('fg-color', DEFAULT_CONFIG.fg);
  setVal('bg-opacity', DEFAULT_CONFIG.opacity);
  setVal('bg-cell', DEFAULT_CONFIG.cell);
  setVal('bg-angle', DEFAULT_CONFIG.angle);

  // очищаем seed, чтобы использовался дефолтный (Date.now при чтении)
  setVal('bg-seed', '');
  resetPreviewSeed();

  // синхронизируем picker
  setPickerFromHex(DEFAULT_CONFIG.bg);
  pickerState.target = 'bg-color';
  const alphaInput = document.getElementById('picker-alpha');
  if (alphaInput instanceof HTMLInputElement) {
    alphaInput.value = String(DEFAULT_CONFIG.opacity);
  }

  updatePickerUI();
  updatePreview();
}

function applyColors(bg, fg) {
  const bgInput = document.getElementById('bg-color');
  const fgInput = document.getElementById('fg-color');
  if (bgInput instanceof HTMLInputElement) bgInput.value = bg;
  if (fgInput instanceof HTMLInputElement) fgInput.value = fg;

  // синхронизируем picker
  setPickerFromHex(bg);
  pickerState.target = 'bg-color';
  updatePickerUI();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(value, fallback) {
  if (typeof value !== 'string') return fallback;
  let v = value.trim();
  if (!v) return fallback;
  if (!v.startsWith('#')) v = `#${v}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(v)) return fallback;
  return v.toLowerCase();
}

function hexToRgb(hex) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return { r: 0, g: 0, b: 0 };
  const int = parseInt(m[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function rgbToHex(r, g, b) {
  const toHex = (v) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function setHexFromPicker(targetId) {
  const { h, s, v } = pickerState;
  const rgb = hsvToRgb(h, s, v);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const input = document.getElementById(targetId);
  if (input instanceof HTMLInputElement) {
    input.value = hex;
  }
}

function setPickerFromHex(hex) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, v } = rgbToHsv(r, g, b);
  pickerState.h = h;
  pickerState.s = s;
  pickerState.v = v;
}

function drawPickerSV() {
  const canvas = document.getElementById('picker-sv');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { h } = pickerState;
  const width = canvas.width;
  const height = canvas.height;

  const satGrad = ctx.createLinearGradient(0, 0, width, 0);
  satGrad.addColorStop(0, '#ffffff');
  const rgb = hsvToRgb(h, 1, 1);
  satGrad.addColorStop(1, rgbToHex(rgb.r, rgb.g, rgb.b));
  ctx.fillStyle = satGrad;
  ctx.fillRect(0, 0, width, height);

  const valGrad = ctx.createLinearGradient(0, 0, 0, height);
  valGrad.addColorStop(0, 'rgba(0,0,0,0)');
  valGrad.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = valGrad;
  ctx.fillRect(0, 0, width, height);

  const x = pickerState.s * width;
  const y = (1 - pickerState.v) * height;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.stroke();
}

function drawHueStrip() {
  const canvas = document.getElementById('picker-hue-strip');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#ff0000');
  grad.addColorStop(1 / 6, '#ffff00');
  grad.addColorStop(2 / 6, '#00ff00');
  grad.addColorStop(3 / 6, '#00ffff');
  grad.addColorStop(4 / 6, '#0000ff');
  grad.addColorStop(5 / 6, '#ff00ff');
  grad.addColorStop(1, '#ff0000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const y = (pickerState.h / 360) * height;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y + 1);
  ctx.lineTo(width, y + 1);
  ctx.stroke();
}

function updatePickerUI() {
  drawPickerSV();
  drawHueStrip();
}

function handlePickerSV(event) {
  const canvas = document.getElementById('picker-sv');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const rect = canvas.getBoundingClientRect();
  const x = clamp(event.clientX - rect.left, 0, rect.width);
  const y = clamp(event.clientY - rect.top, 0, rect.height);
  pickerState.s = x / rect.width;
  pickerState.v = 1 - y / rect.height;
  setHexFromPicker(pickerState.target);
  updatePreview();
  drawPickerSV();
}

function handleHueStrip(event) {
  const canvas = document.getElementById('picker-hue-strip');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const rect = canvas.getBoundingClientRect();
  const y = clamp(event.clientY - rect.top, 0, rect.height);
  pickerState.h = (y / rect.height) * 360;
  setHexFromPicker(pickerState.target);
  updatePreview();
  updatePickerUI();
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pickIcon(rand, pool, left, top) {
  for (let i = 0; i < 24; i++) {
    const icon = pool[Math.floor(rand() * pool.length)];
    if (icon !== left && icon !== top) return icon;
  }
  return pool[Math.floor(rand() * pool.length)];
}

function iconLooksValid(measureCtx, iconName, fontSize) {
  const width = measureCtx.measureText(iconName).width;
  return width > 0 && width <= fontSize * 1.25;
}

function rowsPerChunk(config) {
  const area = config.width * config.height;
  if (area > 4_000_000) return 2;
  if (area > 2_500_000) return 3;
  if (area > 1_000_000) return 4;
  return RENDER_BATCH_ROWS;
}

function readConfigFromForm() {
  const form = document.getElementById(FORM_ID);
  if (!form) {
    currentConfig = { ...DEFAULT_CONFIG, seed: Date.now() };
    return currentConfig;
  }

  const num = (id, fallback) => {
    const input = form.querySelector(`#${id}`);
    if (!input) return fallback;
    const parsed = Number(input.value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const text = (id, fallback) => {
    const input = form.querySelector(`#${id}`);
    return input && input.value ? input.value : fallback;
  };

  const seedRaw = num('bg-seed', NaN);

  currentConfig = {
    width: clamp(Math.round(num('bg-width', DEFAULT_CONFIG.width)), 512, 5000),
    height: clamp(Math.round(num('bg-height', DEFAULT_CONFIG.height)), 512, 5000),
    bg: normalizeHex(text('bg-color', DEFAULT_CONFIG.bg), DEFAULT_CONFIG.bg),
    fg: normalizeHex(text('fg-color', DEFAULT_CONFIG.fg), DEFAULT_CONFIG.fg),
    opacity: clamp(num('bg-opacity', DEFAULT_CONFIG.opacity), 0.05, 1),
    cell: clamp(Math.round(num('bg-cell', DEFAULT_CONFIG.cell)), 16, 96),
    fontSize: clamp(Math.round(num('bg-cell', DEFAULT_CONFIG.fontSize)), 16, 96),
    angle: clamp(num('bg-angle', DEFAULT_CONFIG.angle), -90, 90),
    quality: DEFAULT_CONFIG.quality,
    seed: Number.isFinite(seedRaw) && seedRaw > 0 ? Math.floor(seedRaw) : Date.now()
  };

  return currentConfig;
}

function initAdvancedPicker() {
  const svCanvas = document.getElementById('picker-sv');
  const hueCanvas = document.getElementById('picker-hue-strip');
  const eyeBtn = document.getElementById('eyedropper-btn');
  const paletteInput = document.getElementById('palette-image');
  const randomBtn = document.getElementById('random-color-btn');
  const copyBtn = document.getElementById('copy-hex-btn');
  const pickerBox = document.getElementById('picker-box');
  const closePickerBtn = document.getElementById('close-picker-btn');
  const bgInput = document.getElementById('bg-color');
  const fgInput = document.getElementById('fg-color');
  const bgSwatch = document.getElementById('bg-swatch');
  const fgSwatch = document.getElementById('fg-swatch');

  pickerState.target = 'bg-color';
  setPickerFromHex(DEFAULT_CONFIG.bg);
  updatePickerUI();
  updateSwatches();

  function openPicker(targetId) {
    pickerState.target = targetId;
    const input = document.getElementById(targetId);
    const color = normalizeHex(input instanceof HTMLInputElement ? input.value : DEFAULT_CONFIG.bg, DEFAULT_CONFIG.bg);
    setPickerFromHex(color);
    updatePickerUI();
    if (!pickerBox) return;

    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    if (isMobile && input instanceof HTMLElement) {
      const label = input.closest('label');
      const colorField = label?.querySelector('.color-input');
      if (colorField) {
        colorField.insertAdjacentElement('afterend', pickerBox);
      }
      pickerBox.style.position = 'static';
      pickerBox.style.width = '100%';
      pickerBox.style.left = '';
      pickerBox.style.top = '';
    } else {
      const layout = document.querySelector('.generator-layout');
      if (layout instanceof HTMLElement) layout.appendChild(pickerBox);
      pickerBox.style.position = '';
      pickerBox.style.width = '';
    }
    pickerBox.classList.remove('hidden');
  }

  function closePicker() {
    if (pickerBox) pickerBox.classList.add('hidden');
  }

  if (bgInput instanceof HTMLInputElement) {
    bgInput.addEventListener('focus', () => openPicker('bg-color'));
    bgInput.addEventListener('click', () => openPicker('bg-color'));
  }
  if (fgInput instanceof HTMLInputElement) {
    fgInput.addEventListener('focus', () => openPicker('fg-color'));
    fgInput.addEventListener('click', () => openPicker('fg-color'));
  }

  if (closePickerBtn instanceof HTMLButtonElement) {
    closePickerBtn.addEventListener('click', () => closePicker());
  }

  if (svCanvas instanceof HTMLCanvasElement) {
    const handleDown = (e) => {
      handlePickerSV(e);
      const moveHandler = (ev) => handlePickerSV(ev);
      const upHandler = () => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', upHandler);
      };
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', upHandler, { once: true });
    };
    svCanvas.addEventListener('mousedown', handleDown);
  }

  if (hueCanvas instanceof HTMLCanvasElement) {
    const handleDown = (e) => {
      handleHueStrip(e);
      const moveHandler = (ev) => handleHueStrip(ev);
      const upHandler = () => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', upHandler);
      };
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', upHandler, { once: true });
    };
    hueCanvas.addEventListener('mousedown', handleDown);
  }

  if (eyeBtn instanceof HTMLButtonElement && 'EyeDropper' in window) {
    eyeBtn.disabled = false;
    eyeBtn.addEventListener('click', async () => {
      try {
        const dropper = new window.EyeDropper();
        const res = await dropper.open();
        const color = normalizeHex(res.sRGBHex, DEFAULT_CONFIG.bg);
        const input = document.getElementById(pickerState.target);
        if (input instanceof HTMLInputElement) {
          input.value = color;
        }
        setPickerFromHex(color);
        updatePickerUI();
        updatePreview();
      } catch (e) {
        console.warn('EyeDropper cancelled', e);
      }
    });
  } else if (eyeBtn instanceof HTMLButtonElement) {
    eyeBtn.disabled = true;
  }

  if (paletteInput instanceof HTMLInputElement) {
    paletteInput.addEventListener('change', () => {
      const file = paletteInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const buckets = {};
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const key = `${r},${g},${b}`;
            buckets[key] = (buckets[key] || 0) + 1;
          }
          const colors = Object.entries(buckets)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([k]) => {
              const [r, g, b] = k.split(',').map(Number);
              return rgbToHex(r, g, b);
            });
          renderExtractedPalette(colors);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (randomBtn instanceof HTMLButtonElement) {
    randomBtn.addEventListener('click', () => {
      const h = Math.random() * 360;
      const s = 0.25 + Math.random() * 0.7;
      const v = 0.35 + Math.random() * 0.6;
      pickerState.h = h;
      pickerState.s = s;
      pickerState.v = v;
      setHexFromPicker(pickerState.target);
      updatePickerUI();
      updatePreview();
    });
  }

  if (copyBtn instanceof HTMLButtonElement) {
    copyBtn.addEventListener('click', async () => {
      const input = document.getElementById(pickerState.target);
      const hex = normalizeHex(input instanceof HTMLInputElement ? input.value : '', DEFAULT_CONFIG.bg);
      try {
        await navigator.clipboard.writeText(hex);
        copyBtn.textContent = 'Скопировано';
        setTimeout(() => { copyBtn.textContent = 'Копировать HEX'; }, 1200);
      } catch (e) {
        copyBtn.textContent = 'Не скопировано';
        setTimeout(() => { copyBtn.textContent = 'Копировать HEX'; }, 1200);
      }
    });
  }
}

function renderExtractedPalette(colors) {
  const container = document.getElementById('extracted-palette');
  if (!container) return;
  container.innerHTML = '';
  colors.forEach((hex) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.style.setProperty('--swatch', hex);
    btn.dataset.color = hex;
    btn.addEventListener('click', () => {
      const input = document.getElementById(pickerState.target);
      if (input instanceof HTMLInputElement) {
        input.value = hex;
      }
      setPickerFromHex(hex);
      updatePickerUI();
      updatePreview();
    });
    container.appendChild(btn);
  });
}

function updateSwatches() {
  const bgInput = document.getElementById('bg-color');
  const fgInput = document.getElementById('fg-color');
  const bgSwatch = document.getElementById('bg-swatch');
  const fgSwatch = document.getElementById('fg-swatch');
  if (bgSwatch instanceof HTMLElement) {
    bgSwatch.style.background = normalizeHex(bgInput instanceof HTMLInputElement ? bgInput.value : DEFAULT_CONFIG.bg, DEFAULT_CONFIG.bg);
  }
  if (fgSwatch instanceof HTMLElement) {
    fgSwatch.style.background = normalizeHex(fgInput instanceof HTMLInputElement ? fgInput.value : DEFAULT_CONFIG.fg, DEFAULT_CONFIG.fg);
  }
}

function nextFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function generateBackgroundJpeg(config) {
  await document.fonts.load(`${config.fontSize}px "Material Icons"`);
  await document.fonts.ready;

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  measureCtx.font = `${config.fontSize}px "Material Icons"`;
  const validIcons = ICONS.filter((icon) => iconLooksValid(measureCtx, icon, config.fontSize));
  const iconPool = validIcons.length >= 20 ? validIcons : ICONS;

  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = config.bg;
  ctx.fillRect(0, 0, config.width, config.height);

  const diag = Math.hypot(config.width, config.height);
  const cols = Math.ceil(diag / config.cell) + 8;
  const rows = Math.ceil(diag / config.cell) + 8;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(''));

  ctx.save();
  ctx.translate(config.width / 2, config.height / 2);
  ctx.rotate((config.angle * Math.PI) / 180);
  ctx.translate(-diag / 2, -diag / 2);
  ctx.font = `${config.fontSize}px "Material Icons"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = config.fg;
  ctx.globalAlpha = config.opacity;

  const rand = mulberry32(config.seed);
  const chunkRows = rowsPerChunk(config);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = c > 0 ? grid[r][c - 1] : '';
      const top = r > 0 ? grid[r - 1][c] : '';
      const icon = pickIcon(rand, iconPool, left, top);
      grid[r][c] = icon;
      const x = c * config.cell + config.cell / 2;
      const y = r * config.cell + config.cell / 2;
      ctx.fillText(icon, x, y);
    }

    if (r % chunkRows === 0) {
      await nextFrame();
    }
  }

  ctx.restore();

  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', config.quality);
  });

  if (!blob) {
    throw new Error('JPEG generation failed');
  }

  const filenameSeed = Number.isFinite(config.seed) ? config.seed : Date.now();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `generated-bg-${filenameSeed}.jpeg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function renderBackgroundToCanvas(config, canvas, ctx) {
  canvas.width = config.width;
  canvas.height = config.height;

  ctx.fillStyle = config.bg;
  ctx.fillRect(0, 0, config.width, config.height);

  const diag = Math.hypot(config.width, config.height);
  const cols = Math.ceil(diag / config.cell) + 8;
  const rows = Math.ceil(diag / config.cell) + 8;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(''));

  // подберём тот же пул иконок, что и в основной генерации, чтобы избежать наложений
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  measureCtx.font = `${config.fontSize}px "Material Icons"`;
  const validIcons = ICONS.filter((icon) => iconLooksValid(measureCtx, icon, config.fontSize));
  const iconPool = validIcons.length >= 20 ? validIcons : ICONS;

  ctx.save();
  ctx.translate(config.width / 2, config.height / 2);
  ctx.rotate((config.angle * Math.PI) / 180);
  ctx.translate(-diag / 2, -diag / 2);
  ctx.font = `${config.fontSize}px "Material Icons"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = config.fg;
  ctx.globalAlpha = config.opacity;

  const rand = mulberry32(config.seed);
  const chunkRows = rowsPerChunk(config);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = c > 0 ? grid[r][c - 1] : '';
      const top = r > 0 ? grid[r - 1][c] : '';
      const icon = pickIcon(rand, iconPool, left, top);
      grid[r][c] = icon;
      const x = c * config.cell + config.cell / 2;
      const y = r * config.cell + config.cell / 2;
      ctx.fillText(icon, x, y);
    }
    if (r % chunkRows === 0 && config.width * config.height > 10000) {
      // yield lightly on larger preview sizes
    }
  }
  ctx.restore();
}

function updatePreview() {
  // читаем текущие значения формы
  currentConfig = readConfigFromForm();
  // фиксируем паттерн один раз: первый вызов сохраняет seed, далее используем его
  if (previewSeed === null) {
    previewSeed = currentConfig.seed;
  } else {
    currentConfig.seed = previewSeed;
  }

  if (!previewCtx) {
    const canvas = document.getElementById('bg-preview');
    if (!(canvas instanceof HTMLCanvasElement)) return;
    previewCtx = canvas.getContext('2d');
  }
  if (!previewCtx) return;
  const cfg = { ...currentConfig, width: PREVIEW_SIZE, height: PREVIEW_SIZE, quality: 0.8 };
  renderBackgroundToCanvas(cfg, previewCtx.canvas, previewCtx);
  updateSwatches();
}

function initBackgroundDownloader() {
  const link = document.getElementById(DOWNLOAD_ID);
  if (!link) return;
  initAdvancedPicker();
  const form = document.getElementById(FORM_ID);
  if (form instanceof HTMLFormElement) {
    form.addEventListener('submit', (e) => e.preventDefault());
    form.addEventListener('input', () => updatePreview());
    form.addEventListener('change', () => updatePreview());
    const seedInput = document.getElementById('bg-seed');
    if (seedInput instanceof HTMLInputElement) {
      const onSeedChange = () => {
        resetPreviewSeed();
        updatePreview();
      };
      seedInput.addEventListener('input', onSeedChange);
      seedInput.addEventListener('change', onSeedChange);
    }

    const resetBtn = document.getElementById('reset-form-btn');
    if (resetBtn instanceof HTMLButtonElement) {
      resetBtn.addEventListener('click', () => applyDefaults());
    }

    const pickerBox = document.getElementById('picker-box');
    const closePickerBtn = document.getElementById('close-picker-btn');
    const bgInput = document.getElementById('bg-color');
    const fgInput = document.getElementById('fg-color');

    const positionPicker = (anchor, box) => {
      if (!(anchor instanceof HTMLElement) || !(box instanceof HTMLElement)) return;
      const rect = anchor.getBoundingClientRect();
      const boxWidth = box.offsetWidth || 280;
      const boxHeight = box.offsetHeight || 240;
      const margin = 8;
      let left = rect.left;
      let top = rect.bottom + margin;
      if (left + boxWidth > window.innerWidth - margin) {
        left = window.innerWidth - margin - boxWidth;
      }
      if (left < margin) left = margin;
      if (top + boxHeight > window.innerHeight - margin) {
        top = rect.top - boxHeight - margin;
      }
      if (top < margin) top = margin;
      box.style.left = `${left + window.scrollX}px`;
      box.style.top = `${top + window.scrollY}px`;
    };

    const openPicker = (targetId) => {
      pickerState.target = targetId;
      if (targetSelect instanceof HTMLSelectElement) targetSelect.value = targetId;
      const input = document.getElementById(targetId);
      const color = normalizeHex(input instanceof HTMLInputElement ? input.value : DEFAULT_CONFIG.bg, DEFAULT_CONFIG.bg);
      setPickerFromHex(color);
      updatePickerUI();
      if (!pickerBox) return;

      const isMobile = window.matchMedia('(max-width: 900px)').matches;
      if (isMobile && input instanceof HTMLElement) {
        const label = input.closest('label');
        const colorField = label?.querySelector('.color-input');
        if (colorField) {
          colorField.insertAdjacentElement('afterend', pickerBox);
        }
        pickerBox.style.position = 'static';
        pickerBox.style.width = '100%';
        pickerBox.style.left = '';
        pickerBox.style.top = '';
      } else {
        const layout = document.querySelector('.generator-layout');
        if (layout instanceof HTMLElement) layout.appendChild(pickerBox);
        pickerBox.style.position = 'absolute';
        pickerBox.style.width = '';
        pickerBox.classList.remove('hidden');
        positionPicker(input, pickerBox);
      }
      pickerBox.classList.remove('hidden');
    };

    if (bgInput instanceof HTMLInputElement) {
      bgInput.addEventListener('focus', () => openPicker('bg-color'));
      bgInput.addEventListener('click', () => openPicker('bg-color'));
    }
    if (fgInput instanceof HTMLInputElement) {
      fgInput.addEventListener('focus', () => openPicker('fg-color'));
      fgInput.addEventListener('click', () => openPicker('fg-color'));
    }
    if (closePickerBtn instanceof HTMLButtonElement && pickerBox) {
      closePickerBtn.addEventListener('click', () => pickerBox.classList.add('hidden'));
    }
  }
  updatePreview();

  link.addEventListener('click', async (event) => {
    event.preventDefault();
    const original = link.textContent;
    link.textContent = 'Генерация...';
    link.style.pointerEvents = 'none';

    try {
      const config = readConfigFromForm();
      currentConfig = config;
      await generateBackgroundJpeg(config);
      addToHistory(config.bg, config.fg);
      link.textContent = 'Скачать еще';
    } catch (error) {
      console.error(error);
      link.textContent = 'Ошибка генерации';
    } finally {
      link.style.pointerEvents = '';
      setTimeout(() => {
        link.textContent = original;
      }, 2000);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackgroundDownloader, { once: true });
} else {
  initBackgroundDownloader();
}
