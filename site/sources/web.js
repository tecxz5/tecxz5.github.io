(function () {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        return;
    }

    if (!window.PIXI || !PIXI.utils || !PIXI.utils.isWebGLSupported()) {
        return;
    }

    const config = {
        angle: -15,
        cellSize: 40,
        fontSize: 38,
        speed: 0.4,
        colorDark: 0x8a8a8a,
        colorHover: 0x232323,
        mouseRadius: 100,
        repelStrength: 18
    };
    const iconStyleVariants = [
        { family: 'Material Symbols Outlined', filled: false, weight: 400 },
        { family: 'Material Symbols Rounded', filled: false, weight: 400 },
        { family: 'Material Symbols Sharp', filled: false, weight: 400 },
        { family: 'Material Symbols Outlined', filled: true, weight: 400 },
        { family: 'Material Symbols Rounded', filled: true, weight: 400 },
        { family: 'Material Symbols Sharp', filled: true, weight: 400 }
    ];

    const iconsList = [
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

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const app = new PIXI.Application({
        view: canvas,
        resizeTo: window,
        antialias: false,
        autoDensity: true,
        resolution: dpr,
        backgroundAlpha: 0,
        powerPreference: 'high-performance'
    });

    const stageRoot = new PIXI.Container();
    const gridContainer = new PIXI.Container();
    stageRoot.addChild(gridContainer);
    app.stage.addChild(stageRoot);

    const state = {
        cols: 0,
        rows: 0,
        gridWidth: 0,
        gridHeight: 0,
        offset: 0,
        cosNeg: 0,
        sinNeg: 0,
        mouseX: -9999,
        mouseY: -9999,
        mouseTX: -9999,
        mouseTY: -9999,
        pointerClientX: -9999,
        pointerClientY: -9999,
        mouseActive: false
    };
    const viewport = {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight
    };
    let viewportUpdateRaf = 0;

    const cells = [];
    const grid = [];
    const highlighted = [];
    const iconTextures = [];
    const fallbackIconName = 'circle';
    const tintLut = Array.from({ length: 256 }, (_, i) => {
        const t = i / 255;
        const eased = Math.pow(t, 0.35);
        const base = config.colorDark & 0xff;
        const hover = config.colorHover & 0xff;
        const shade = Math.floor(base + (hover - base) * eased);
        const r = shade;
        const g = shade;
        const b = shade;
        return (r << 16) | (g << 8) | b;
    });

    function updateAngleCache() {
        const rad = config.angle * Math.PI / 180;
        state.cosNeg = Math.cos(-rad);
        state.sinNeg = Math.sin(-rad);
    }

    function createIconTexture(icon, variant) {
        const size = config.cellSize;
        const el = document.createElement('canvas');
        el.width = size;
        el.height = size;
        const iconCtx = el.getContext('2d');
        const fontWeight = variant && variant.weight ? variant.weight : 400;
        const fontFamily = variant && variant.family ? variant.family : 'Material Symbols Outlined';
        iconCtx.clearRect(0, 0, size, size);
        iconCtx.font = `${fontWeight} ${config.fontSize}px "${fontFamily}"`;
        iconCtx.fillStyle = '#ffffff';
        iconCtx.textAlign = 'center';
        iconCtx.textBaseline = 'middle';
        iconCtx.fillText(icon, size / 2, size / 2 + 1);

        // Some icon names can be unavailable in current font set; use fallback to avoid empty cells.
        const sample = iconCtx.getImageData(0, 0, size, size).data;
        let hasGlyph = false;
        for (let i = 3; i < sample.length; i += 4) {
            if (sample[i] > 0) {
                hasGlyph = true;
                break;
            }
        }
        if (!hasGlyph) {
            return null;
        }

        return PIXI.Texture.from(el);
    }

    function shuffledIndices(count) {
        const out = new Array(count);
        for (let i = 0; i < count; i++) {
            out[i] = i;
        }
        for (let i = count - 1; i > 0; i--) {
            const j = (Math.random() * (i + 1)) | 0;
            const tmp = out[i];
            out[i] = out[j];
            out[j] = tmp;
        }
        return out;
    }

    function ensureTextures() {
        if (iconTextures.length > 0) {
            return;
        }

        const uniqueIcons = Array.from(new Set(iconsList));
        for (let i = 0; i < uniqueIcons.length; i++) {
            const icon = uniqueIcons[i];
            for (let f = 0; f < iconStyleVariants.length; f++) {
                const texture = createIconTexture(icon, iconStyleVariants[f]);
                if (texture) {
                    iconTextures.push(texture);
                }
            }
        }

        if (iconTextures.length === 0) {
            const fallback = createIconTexture(fallbackIconName, iconStyleVariants[0]);
            if (fallback) {
                iconTextures.push(fallback);
            }
        }
    }

    function clearGrid() {
        for (let i = 0; i < cells.length; i++) {
            gridContainer.removeChild(cells[i].sprite);
        }
        cells.length = 0;
        grid.length = 0;
        highlighted.length = 0;
    }

    function updateViewport() {
        const rect = canvas.getBoundingClientRect();
        viewport.left = rect.left;
        viewport.top = rect.top;
        viewport.width = rect.width || window.innerWidth;
        viewport.height = rect.height || window.innerHeight;
    }

    function updateMouseTargetFromClient(clientX, clientY) {
        state.mouseTX = clientX - viewport.left;
        state.mouseTY = clientY - viewport.top;
    }

    function scheduleViewportUpdate() {
        if (viewportUpdateRaf) {
            return;
        }

        viewportUpdateRaf = requestAnimationFrame(() => {
            viewportUpdateRaf = 0;
            updateViewport();
            if (state.mouseActive) {
                updateMouseTargetFromClient(state.pointerClientX, state.pointerClientY);
            }
        });
    }

    function rebuildGrid() {
        clearGrid();
        updateAngleCache();
        updateViewport();

        const w = viewport.width;
        const h = viewport.height;
        const diag = Math.sqrt(w * w + h * h);
        state.cols = Math.ceil(diag / config.cellSize) + 4;
        state.rows = Math.ceil(diag / config.cellSize) + 4;
        state.gridWidth = state.cols * config.cellSize;
        state.gridHeight = state.rows * config.cellSize;

        stageRoot.x = w / 2;
        stageRoot.y = h / 2;
        stageRoot.rotation = config.angle * Math.PI / 180;
        gridContainer.x = -state.gridWidth / 2;
        gridContainer.y = -state.gridHeight / 2;
        let textureOrder = shuffledIndices(iconTextures.length);
        let textureCursor = 0;

        function nextTexture() {
            if (textureCursor >= textureOrder.length) {
                textureOrder = shuffledIndices(iconTextures.length);
                textureCursor = 0;
            }
            const idx = textureOrder[textureCursor++];
            return iconTextures[idx];
        }

        for (let c = 0; c < state.cols; c++) {
            grid[c] = [];
            const x = c * config.cellSize + config.cellSize / 2;

            for (let r = 0; r < state.rows; r++) {
                const sprite = new PIXI.Sprite(nextTexture());
                const baseY = r * config.cellSize + config.cellSize / 2;

                sprite.anchor.set(0.5);
                sprite.x = x;
                sprite.y = baseY;
                sprite.tint = config.colorDark;

                gridContainer.addChild(sprite);

                const cell = {
                    c,
                    r,
                    x,
                    baseY,
                    sprite
                };
                cells.push(cell);
                grid[c][r] = cell;
            }
        }
    }

    function rotateMouse(mx, my) {
        const cx = viewport.width / 2;
        const cy = viewport.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const rx = dx * state.cosNeg - dy * state.sinNeg;
        const ry = dx * state.sinNeg + dy * state.cosNeg;
        return { x: rx, y: ry };
    }

    function getColumnDirection(col) {
        return col % 2 === 0 ? 1 : -1;
    }

    function getCellY(row, col, scroll) {
        const y = (row * config.cellSize + config.cellSize / 2 + scroll * getColumnDirection(col)) % state.gridHeight;
        return y < 0 ? y + state.gridHeight : y;
    }

    function updateCellPositions(scroll) {
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            cell.sprite.x = cell.x;
            cell.sprite.y = getCellY(cell.r, cell.c, scroll);
        }
    }

    function resetHighlightedCells() {
        while (highlighted.length) {
            const cell = highlighted.pop();
            cell.sprite.tint = config.colorDark;
        }
    }

    function highlightCells(mX, mY, scroll) {
        const radius = config.mouseRadius;
        const radius2 = radius * radius;
        const cellSize = config.cellSize;
        const iMin = Math.max(0, Math.floor((mX - radius) / cellSize));
        const iMax = Math.min(state.cols - 1, Math.ceil((mX + radius) / cellSize));

        for (let c = iMin; c <= iMax; c++) {
            const x = c * cellSize + cellSize / 2;
            const dx = x - mX;
            const dx2 = dx * dx;

            if (dx2 > radius2) {
                continue;
            }

            for (let r = 0; r < state.rows; r++) {
                const cell = grid[c][r];
                const y = getCellY(r, c, scroll);
                const dyRaw = Math.abs(y - mY);
                const dy = Math.min(dyRaw, state.gridHeight - dyRaw);
                const dist2 = dx2 + dy * dy;

                if (dist2 >= radius2) {
                    continue;
                }

                const dist = Math.sqrt(dist2);
                const intensity = 1 - dist / radius;
                const lutIdx = Math.max(0, Math.min(255, (intensity * 255) | 0));
                cell.sprite.tint = tintLut[lutIdx];

                // Repel icons away from cursor within radius.
                let signedDy = y - mY;
                if (signedDy > state.gridHeight / 2) {
                    signedDy -= state.gridHeight;
                } else if (signedDy < -state.gridHeight / 2) {
                    signedDy += state.gridHeight;
                }

                if (dist > 0.001) {
                    const force = intensity * config.repelStrength;
                    const nx = dx / dist;
                    const ny = signedDy / dist;
                    cell.sprite.x = x + nx * force;
                    cell.sprite.y = y + ny * force;
                }

                highlighted.push(cell);
            }
        }
    }

    function tick(delta) {
        const lerp = state.mouseActive ? 0.2 : 0.08;
        state.mouseX += (state.mouseTX - state.mouseX) * lerp;
        state.mouseY += (state.mouseTY - state.mouseY) * lerp;

        state.offset += config.speed * delta;
        const scroll = state.offset % state.gridHeight;
        updateCellPositions(scroll);

        resetHighlightedCells();
        const hasPointer = state.pointerClientX > -9000 && state.pointerClientY > -9000;
        if (hasPointer) {
            const rotated = rotateMouse(state.mouseX, state.mouseY);
            const mX = rotated.x + state.gridWidth / 2;
            const mY = rotated.y + state.gridHeight / 2;
            highlightCells(mX, mY, scroll);
        }
    }

    function onPointerMove(e) {
        state.pointerClientX = e.clientX;
        state.pointerClientY = e.clientY;
        updateMouseTargetFromClient(e.clientX, e.clientY);
        state.mouseActive = true;
    }

    function onPointerLeave() {
        state.mouseActive = false;
        state.pointerClientX = -9999;
        state.pointerClientY = -9999;
        state.mouseTX = -9999;
        state.mouseTY = -9999;
    }

    function setupEvents() {
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerover', onPointerMove, { passive: true });
        window.addEventListener('pointerdown', onPointerMove, { passive: true });
        window.addEventListener('pointerleave', onPointerLeave, { passive: true });
        window.addEventListener('pointercancel', onPointerLeave, { passive: true });
        window.addEventListener('resize', rebuildGrid);
        window.addEventListener('scroll', scheduleViewportUpdate, { passive: true });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                app.ticker.stop();
            } else {
                app.ticker.start();
                scheduleViewportUpdate();
            }
        });
    }

    const fontLoadTasks = iconStyleVariants.map((variant) => (
        document.fonts.load(`${variant.weight} ${config.fontSize}px "${variant.family}"`)
    ));
    Promise.all(fontLoadTasks).then(() => {
        ensureTextures();
        rebuildGrid();
        setupEvents();
        app.ticker.add(tick);
    });
})();
